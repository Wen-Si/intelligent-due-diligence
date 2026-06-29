"""
OCR Service using PaddleOCR MCP
"""
import os
import json
import asyncio
from typing import List, Dict, Any
import httpx
from dotenv import load_dotenv

load_dotenv()

class OCRService:
    def __init__(self):
        self.access_token = os.getenv("PADDLEOCR_ACCESS_TOKEN", "")
        self.model = os.getenv("PADDLEOCR_MCP_MODEL", "PaddleOCR-VL-1.6")
        self.source = os.getenv("PADDLEOCR_MCP_PPOCR_SOURCE", "aistudio")
        
        # MCP command configuration
        self.mcp_config = {
            "command": "uvx",
            "args": ["--from", "paddleocr-mcp", "paddleocr_mcp"],
            "env": {
                "PADDLEOCR_MCP_MODEL": self.model,
                "PADDLEOCR_MCP_PPOCR_SOURCE": self.source,
                "PADDLEOCR_MCP_AISTUDIO_ACCESS_TOKEN": self.access_token
            }
        }
    
    async def process_files(self, file_paths: List[str]) -> List[Dict[str, Any]]:
        """
        Process multiple PDF files and extract text using OCR
        """
        results = []
        
        for file_path in file_paths:
            try:
                # Process each file
                ocr_result = await self.process_single_file(file_path)
                results.append(ocr_result)
            except Exception as e:
                # If OCR fails, try to extract text directly
                print(f"OCR failed for {file_path}: {str(e)}")
                try:
                    fallback_result = await self.fallback_text_extraction(file_path)
                    results.append(fallback_result)
                except Exception as e2:
                    results.append({
                        "file": os.path.basename(file_path),
                        "text": "",
                        "error": str(e2)
                    })
        
        return results
    
    async def process_single_file(self, file_path: str) -> Dict[str, Any]:
        """
        Process a single PDF file using PaddleOCR MCP
        """
        # Since we're in a FastAPI context and can't directly run MCP tools,
        # we'll use an alternative approach:
        # 1. Convert PDF pages to images
        # 2. Use PaddleOCR API directly or call MCP via subprocess
        
        try:
            # Try using pdfplumber for text extraction first (fastest)
            import pdfplumber
            
            text_content = []
            tables = []
            
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append({
                            "page": page_num + 1,
                            "text": page_text
                        })
                    
                    # Extract tables
                    page_tables = page.extract_tables()
                    if page_tables:
                        for table in page_tables:
                            tables.append({
                                "page": page_num + 1,
                                "data": table
                            })
            
            # If pdfplumber succeeds, return the result
            if text_content:
                return {
                    "file": os.path.basename(file_path),
                    "text": text_content,
                    "tables": tables,
                    "method": "pdfplumber"
                }
            
            # If no text extracted, use OCR (for scanned documents)
            # In a real production environment, you would integrate with PaddleOCR MCP here
            # For now, we'll simulate the OCR process
            
            # Alternative: Use PaddleOCR via HTTP API if available
            ocr_result = await self.call_paddleocr_api(file_path)
            
            return ocr_result
            
        except Exception as e:
            raise Exception(f"OCR processing failed: {str(e)}")
    
    async def fallback_text_extraction(self, file_path: str) -> Dict[str, Any]:
        """
        Fallback method using pdfplumber
        """
        import pdfplumber
        
        text_content = []
        tables = []
        
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text_content.append({
                        "page": page_num + 1,
                        "text": page_text
                    })
                
                page_tables = page.extract_tables()
                if page_tables:
                    for table in page_tables:
                        tables.append({
                            "page": page_num + 1,
                            "data": table
                        })
        
        return {
            "file": os.path.basename(file_path),
            "text": text_content,
            "tables": tables,
            "method": "pdfplumber_fallback"
        }
    
    async def call_paddleocr_api(self, file_path: str) -> Dict[str, Any]:
        """
        Call PaddleOCR API for OCR processing
        (This is a placeholder - in production, integrate with actual MCP)
        """
        # Convert PDF to images first
        from PIL import Image
        import pdf2image
        import io
        import base64
        
        # Convert PDF to images
        images = pdf2image.convert_from_path(file_path)
        
        ocr_results = []
        
        for page_num, image in enumerate(images):
            # Convert image to base64
            buffered = io.BytesIO()
            image.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # In production, call PaddleOCR MCP here
            # For now, return empty placeholder
            ocr_results.append({
                "page": page_num + 1,
                "text": "[OCR processing would be done by PaddleOCR MCP]",
                "method": "ocr_placeholder"
            })
        
        return {
            "file": os.path.basename(file_path),
            "text": ocr_results,
            "tables": [],
            "method": "paddleocr"
        }
    
    async def extract_structured_data(self, text_content: List[Dict]) -> Dict[str, Any]:
        """
        Extract structured financial data from OCR text
        """
        # This will be called by analysis service
        structured_data = {
            "balance_sheet": [],
            "income_statement": [],
            "cash_flow": [],
            "other_data": []
        }
        
        # Simple keyword-based extraction (will be enhanced by AI)
        keywords = {
            "balance_sheet": ["资产", "负债", "所有者权益", "总资产", "流动资产", "固定资产"],
            "income_statement": ["营业收入", "营业成本", "利润", "净利润", "毛利率"],
            "cash_flow": ["现金流量", "经营活动", "投资活动", "筹资活动"]
        }
        
        for page_data in text_content:
            text = page_data.get("text", "")
            
            for category, kws in keywords.items():
                for kw in kws:
                    if kw in text:
                        structured_data[category].append({
                            "page": page_data.get("page"),
                            "keyword": kw,
                            "context": text[:200]  # First 200 chars as context
                        })
        
        return structured_data


# Export service instance
ocr_service = OCRService()