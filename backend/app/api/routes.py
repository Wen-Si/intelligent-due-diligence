"""
API Routes
"""
from fastapi import APIRouter

# Create routers
analyze_router = APIRouter(prefix="/analyze", tags=["Analysis"])
report_router = APIRouter(prefix="/report", tags=["Report"])

# Routes will be defined in main.py