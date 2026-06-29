from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class FileUploadResponse(BaseModel):
    taskId: str
    message: str
    files: List[str]

class AnalysisProgress(BaseModel):
    taskId: str
    progress: int
    stage: str
    status: str  # 'processing', 'completed', 'failed'
    report: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime

class Report(BaseModel):
    overview: str  # HTML formatted overview
    financial: str  # HTML formatted financial analysis
    risks: str  # HTML formatted risk assessment
    conclusion: str  # HTML formatted conclusion and recommendations
    keyMetrics: str  # Key financial metrics summary
    riskLevel: str  # Risk level classification
    score: str  # Overall score
    metadata: Dict[str, Any]  # Additional metadata

class HistoryItem(BaseModel):
    id: str
    files: List[str]
    timestamp: str
    report: Report

class ErrorResponse(BaseModel):
    error: str
    message: str
    timestamp: datetime