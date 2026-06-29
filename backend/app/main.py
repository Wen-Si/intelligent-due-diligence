from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid
from datetime import datetime
import asyncio
from dotenv import load_dotenv

from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from app.services.qcc_service import QCCService
from app.services.word_generator import word_generator

load_dotenv()

app = FastAPI(
    title="智能尽调平台 API",
    description="三阶段工作流：企查查MCP → PaddleOCR → GLM-4.5，生成Word尽调报告",
    version="2.0.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ocr_service = OCRService()
ai_service = AIService()
qcc_service = QCCService()

tasks = {}
history = []

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
REPORTS_DIR = "./reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


@app.get("/")
async def root():
    return {
        "message": "智能尽调平台 API v2.0",
        "workflow": ["企查查MCP", "PaddleOCR", "GLM-4.5"],
        "output": "Word文档",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "qcc": "available",
            "ocr": "available",
            "ai": "available",
            "word": "available"
        }
    }


@app.post("/api/analyze")
async def analyze_documents(
    files: List[UploadFile] = File(...),
    company_name: str = None
):
    """
    三阶段尽调分析：
    1. 企查查MCP - 获取企业信息
    2. PaddleOCR - 解析PDF文档
    3. GLM-4.5 - 生成分析报告
    
    输出：Word文档
    """
    # Validate inputs
    if not company_name or not company_name.strip():
        raise HTTPException(status_code=400, detail="企业名称为必填项")
    
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="请上传PDF文件")
    
    for file in files:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail=f"文件 {file.filename} 不是PDF格式")
        
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        
        max_size = int(os.getenv("MAX_FILE_SIZE", 52428800))
        if size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"文件 {file.filename} 超过最大限制 {max_size / 1024 / 1024}MB"
            )
    
    # Generate task ID
    task_id = str(uuid.uuid4())
    
    # Save files
    saved_files = []
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, f"{task_id}_{file.filename}")
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        saved_files.append(file_path)
    
    # Initialize task with workflow tracking
    tasks[task_id] = {
        "status": "processing",
        "companyName": company_name,
        "files": saved_files,
        "workflow": {
            "currentStep": "qcc",
            "overallProgress": 0,
            "steps": {
                "qcc": {"progress": 0, "status": "pending", "message": "", "result": None},
                "ocr": {"progress": 0, "status": "pending", "message": "", "result": None},
                "ai": {"progress": 0, "status": "pending", "message": "", "result": None}
            }
        },
        "reportFile": None,
        "error": None,
        "timestamp": datetime.now().isoformat()
    }
    
    # Start background analysis
    asyncio.create_task(process_workflow(task_id, company_name, saved_files))
    
    return {
        "taskId": task_id,
        "message": f"开始分析企业：{company_name}",
        "workflow": ["企查查MCP", "PaddleOCR", "GLM-4.5"]
    }


async def process_workflow(task_id: str, company_name: str, file_paths: List[str]):
    """
    Complete 3-step workflow with detailed progress tracking
    """
    try:
        # ===== Step 1: QCC MCP (0-33%) =====
        update_workflow(task_id, "qcc", 0, "active", "正在调用企查查MCP...")
        
        company_info = await qcc_service.query_company_info(
            company_name,
            modules=["company", "risk", "ipr", "operation", "executive", "history"]
        )
        
        update_workflow(task_id, "qcc", 100, "completed", "企查查数据获取完成", {
            "模块数": len(company_info.get("modules", {})),
            "查询时间": company_info.get("query_time", "")
        })
        
        # ===== Step 2: PaddleOCR (33-66%) =====
        update_workflow(task_id, "ocr", 0, "active", "正在调用PaddleOCR解析PDF...")
        
        update_workflow(task_id, "ocr", 20, "active", "上传PDF文件到OCR引擎...")
        
        ocr_results = await ocr_service.process_files(file_paths)
        
        update_workflow(task_id, "ocr", 80, "active", "提取文本和表格数据...")
        
        # Extract structured data
        structured_data = {}
        for doc in ocr_results:
            if doc.get("text"):
                structured = await ocr_service.extract_structured_data(doc["text"])
                for category, data in structured.items():
                    if category not in structured_data:
                        structured_data[category] = []
                    structured_data[category].extend(data)
        
        update_workflow(task_id, "ocr", 100, "completed", "PDF解析完成", {
            "文档数": len(ocr_results),
            "表格数": sum(len(doc.get("tables", [])) for doc in ocr_results)
        })
        
        # ===== Step 3: AI Analysis (66-100%) =====
        update_workflow(task_id, "ai", 0, "active", "正在调用GLM-4.5生成分析...")
        
        # Prepare data for AI
        extracted_data = {
            "documents": ocr_results,
            "tables": [doc.get("tables", []) for doc in ocr_results],
            "structured_data": structured_data,
            "company_info": company_info
        }
        
        update_workflow(task_id, "ai", 30, "active", "整合企查查和OCR数据...")
        
        ai_analysis = await ai_service.analyze_financial_data(extracted_data)
        
        update_workflow(task_id, "ai", 70, "active", "生成尽调分析报告...")
        
        # ===== Generate Word Document =====
        update_workflow(task_id, "ai", 90, "active", "生成Word文档...")
        
        report_file = await word_generator.generate_due_diligence_report(
            company_info,
            {"documents": ocr_results, "tables": extracted_data["tables"], "structured_data": structured_data},
            ai_analysis,
            company_name
        )
        
        update_workflow(task_id, "ai", 100, "completed", "Word报告生成完成", {
            "文件名": report_file["fileName"]
        })
        
        # Complete
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["reportFile"] = report_file
        tasks[task_id]["workflow"]["overallProgress"] = 100
        
        # Add to history
        history.append({
            "id": task_id,
            "companyName": company_name,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "reportFile": report_file
        })
        
        if len(history) > 10:
            history.pop(0)
        
    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
        # Mark current step as failed
        current_step = tasks[task_id]["workflow"]["currentStep"]
        tasks[task_id]["workflow"]["steps"][current_step]["status"] = "failed"
        tasks[task_id]["workflow"]["steps"][current_step]["message"] = f"失败: {str(e)}"


def update_workflow(task_id: str, step: str, progress: int, status: str, message: str, result: Dict = None):
    """Update workflow step status and progress"""
    if task_id in tasks:
        # Update step
        tasks[task_id]["workflow"]["currentStep"] = step
        tasks[task_id]["workflow"]["steps"][step]["progress"] = progress
        tasks[task_id]["workflow"]["steps"][step]["status"] = status
        tasks[task_id]["workflow"]["steps"][step]["message"] = message
        if result:
            tasks[task_id]["workflow"]["steps"][step]["result"] = result
        
        # Calculate overall progress
        step_order = ["qcc", "ocr", "ai"]
        step_weights = [33, 33, 34]
        
        overall_progress = 0
        for i, s in enumerate(step_order):
            if s == step:
                overall_progress += step_weights[i] * (progress / 100)
            elif tasks[task_id]["workflow"]["steps"][s]["status"] == "completed":
                overall_progress += step_weights[i]
        
        tasks[task_id]["workflow"]["overallProgress"] = int(overall_progress)


@app.get("/api/status/{task_id}")
async def get_task_status(task_id: str):
    """Get detailed workflow status"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="任务未找到")
    
    task = tasks[task_id]
    return {
        "taskId": task_id,
        "status": task["status"],
        "workflow": task["workflow"],
        "reportFile": task.get("reportFile"),
        "error": task.get("error"),
        "companyName": task.get("companyName")
    }


@app.get("/api/download/{filename}")
async def download_report(filename: str):
    """Download generated Word report"""
    file_path = os.path.join(REPORTS_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="文件未找到")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


@app.get("/api/history")
async def get_history():
    """Get analysis history"""
    return history


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)