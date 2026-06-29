"""
Analysis Service - Orchestrates OCR, AI, and QCC services
"""
from typing import Dict, Any, List, Optional
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from app.services.qcc_service import QCCService

class AnalysisService:
    def __init__(self, ocr_service: OCRService, ai_service: AIService, qcc_service: QCCService = None):
        self.ocr_service = ocr_service
        self.ai_service = ai_service
        self.qcc_service = qcc_service or QCCService()
    
    async def extract_financial_data(self, ocr_results: List[Dict[str, Any]], company_name: str = None) -> Dict[str, Any]:
        """
        Extract and structure financial data from OCR results and QCC data
        """
        extracted_data = {
            "documents": ocr_results,
            "tables": [],
            "structured_data": {},
            "company_info": {}
        }
        
        # Collect all tables
        for doc in ocr_results:
            if doc.get("tables"):
                extracted_data["tables"].extend(doc["tables"])
        
        # Extract structured data from text
        for doc in ocr_results:
            text_data = doc.get("text", [])
            if text_data:
                structured = await self.ocr_service.extract_structured_data(text_data)
                
                # Merge structured data
                for category, data in structured.items():
                    if category not in extracted_data["structured_data"]:
                        extracted_data["structured_data"][category] = []
                    extracted_data["structured_data"][category].extend(data)
        
        # If company name is provided, query QCC for company info
        if company_name and self.qcc_service:
            try:
                extracted_data["company_info"] = await self.qcc_service.query_company_info(
                    company_name,
                    modules=["company", "risk", "operation"]
                )
            except Exception as e:
                extracted_data["company_info"] = {
                    "error": f"QCC query failed: {str(e)}",
                    "company_name": company_name
                }
        
        return extracted_data
    
    async def generate_report(
        self, 
        analysis_result: Dict[str, Any], 
        extracted_data: Dict[str, Any],
        company_name: str = None
    ) -> Dict[str, Any]:
        """
        Generate the final due diligence report including QCC data
        """
        report = {
            "overview": analysis_result.get("overview", ""),
            "financial": analysis_result.get("financial", ""),
            "risks": analysis_result.get("risks", ""),
            "conclusion": analysis_result.get("conclusion", ""),
            "companyInfo": self._format_company_info(extracted_data.get("company_info", {})),
            "keyMetrics": analysis_result.get("key_metrics", "需分析"),
            "riskLevel": analysis_result.get("risk_level", "待评估"),
            "score": analysis_result.get("score", "待评估"),
            "metadata": {
                "documentCount": len(extracted_data.get("documents", [])),
                "tableCount": len(extracted_data.get("tables", [])),
                "companyName": company_name,
                "analysisDate": self._get_current_date(),
                "model": "GLM-4.5-Flash",
                "ocrMethod": "PaddleOCR-VL-1.6",
                "dataSource": ["财务报表", "审计报告"] + (["企查查"] if company_name else [])
            }
        }
        
        return report
    
    def _format_company_info(self, company_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format company info from QCC for the report
        """
        if not company_info or "error" in company_info:
            return {}
        
        formatted = {
            "basic": {},
            "risk": {},
            "operation": {}
        }
        
        # Format basic info
        modules = company_info.get("modules", {})
        if "company" in modules:
            basic = modules["company"].get("basic_info", {})
            formatted["basic"] = {
                "companyName": basic.get("company_name", ""),
                "creditCode": basic.get("credit_code", ""),
                "legalPerson": basic.get("legal_person", ""),
                "registeredCapital": basic.get("registered_capital", ""),
                "establishmentDate": basic.get("establishment_date", ""),
                "status": basic.get("status", ""),
                "companyType": basic.get("company_type", ""),
                "industry": basic.get("industry", ""),
                "address": basic.get("address", "")
            }
        
        # Format risk info
        if "risk" in modules:
            risk = modules["risk"]
            formatted["risk"] = {
                "riskCount": risk.get("risk_count", 0),
                "riskSummary": risk.get("risk_summary", "未查询到风险信息")
            }
        
        # Format operation info
        if "operation" in modules:
            operation = modules["operation"]
            formatted["operation"] = {
                "bidCount": len(operation.get("bids", [])),
                "certificationCount": len(operation.get("certifications", [])),
                "operationSummary": operation.get("operation_summary", "")
            }
        
        return formatted
    
    def _get_current_date(self) -> str:
        """Get current date string"""
        from datetime import datetime
        return datetime.now().strftime("%Y年%m月%d日")


# Export service instance
analysis_service = None  # Will be initialized in main.py