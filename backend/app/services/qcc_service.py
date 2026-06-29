"""
企查查 MCP 服务集成
用于查询企业工商、风险、知识产权、经营、高管、历史等信息
"""
import os
import json
import asyncio
from typing import Dict, Any, List, Optional
import httpx
from dotenv import load_dotenv

from app.services.qcc_config import (
    QCC_MCP_CONFIG,
    QCC_AUTHORIZATION,
    QCC_TOOLS
)

load_dotenv()

class QCCService:
    """企查查MCP服务类"""
    
    def __init__(self):
        self.authorization = QCC_AUTHORIZATION
        self.mcp_config = QCC_MCP_CONFIG
        self.available_tools = QCC_TOOLS
        self.headers = {
            "Authorization": self.authorization,
            "Content-Type": "application/json"
        }
    
    async def query_company_info(self, company_name: str, modules: List[str] = None) -> Dict[str, Any]:
        """
        查询企业综合信息
        
        Args:
            company_name: 企业名称
            modules: 要查询的模块列表，默认查询所有模块
            
        Returns:
            综合企业信息字典
        """
        if modules is None:
            modules = ["company", "risk", "ipr", "operation", "executive", "history"]
        
        results = {}
        tasks = []
        
        # 并行查询各模块
        for module in modules:
            if module in self.mcp_config:
                task = self._query_module(company_name, module)
                tasks.append((module, task))
        
        # 等待所有查询完成
        for module, task in tasks:
            try:
                results[module] = await task
            except Exception as e:
                results[module] = {
                    "error": str(e),
                    "module": module
                }
        
        return {
            "company_name": company_name,
            "query_time": self._get_current_time(),
            "modules": results
        }
    
    async def _query_module(self, company_name: str, module: str) -> Dict[str, Any]:
        """
        查询单个模块信息
        """
        # 构建MCP请求
        if module == "company":
            return await self._query_company_basic(company_name)
        elif module == "risk":
            return await self._query_risk_info(company_name)
        elif module == "ipr":
            return await self._query_ipr_info(company_name)
        elif module == "operation":
            return await self._query_operation_info(company_name)
        elif module == "executive":
            return await self._query_executive_info(company_name)
        elif module == "history":
            return await self._query_history_info(company_name)
        else:
            return {"error": f"Unknown module: {module}"}
    
    async def _query_company_basic(self, company_name: str) -> Dict[str, Any]:
        """查询企业基本信息"""
        # 这里模拟MCP调用，实际使用时通过SSE/HTTP调用企查查MCP
        # 真实实现需要使用MCP协议进行通信
        
        # 模拟数据
        return {
            "basic_info": {
                "company_name": company_name,
                "credit_code": f"91330100MA2{''.join(['0' for _ in range(10)])}X",
                "legal_person": "待查询",
                "registered_capital": "待查询",
                "establishment_date": "待查询",
                "status": "存续",
                "company_type": "有限责任公司",
                "industry": "待查询",
                "address": "待查询"
            },
            "shareholders": [],
            "branches": [],
            "changes": []
        }
    
    async def _query_risk_info(self, company_name: str) -> Dict[str, Any]:
        """查询企业风险信息"""
        return {
            "risk_count": 0,
            "lawsuits": [],
            "violations": [],
            "punishments": [],
            "risk_summary": "未发现明显风险信息"
        }
    
    async def _query_ipr_info(self, company_name: str) -> Dict[str, Any]:
        """查询知识产权信息"""
        return {
            "trademarks": [],
            "patents": [],
            "copyrights": [],
            "software_copyrights": [],
            "ipr_summary": "知识产权信息待查询"
        }
    
    async def _query_operation_info(self, company_name: str) -> Dict[str, Any]:
        """查询经营信息"""
        return {
            "bids": [],
            "contracts": [],
            "certifications": [],
            "tax_credit": [],
            "operation_summary": "经营信息待查询"
        }
    
    async def _query_executive_info(self, company_name: str) -> Dict[str, Any]:
        """查询高管信息"""
        return {
            "executives": [],
            "investments": [],
            "related_companies": [],
            "executive_summary": "高管信息待查询"
        }
    
    async def _query_history_info(self, company_name: str) -> Dict[str, Any]:
        """查询历史信息"""
        return {
            "history_changes": [],
            "cancellation": None,
            "bankruptcy": None,
            "history_summary": "历史信息待查询"
        }
    
    async def call_mcp_tool(self, module: str, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        通用MCP工具调用方法
        
        Args:
            module: MCP模块名
            tool_name: 工具名
            params: 参数
            
        Returns:
            工具调用结果
        """
        if module not in self.mcp_config:
            raise ValueError(f"Unknown MCP module: {module}")
        
        url = self.mcp_config[module]["url"]
        
        # 构建MCP JSON-RPC请求
        request_body = {
            "jsonrpc": "2.0",
            "id": self._generate_request_id(),
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": params
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # SSE流式请求处理
                async with client.stream(
                    "POST",
                    url,
                    headers=self.headers,
                    json=request_body
                ) as response:
                    response.raise_for_status()
                    
                    # 处理SSE响应
                    result = await self._process_sse_response(response)
                    return result
                    
        except Exception as e:
            print(f"MCP call failed: {str(e)}")
            return {
                "error": str(e),
                "module": module,
                "tool": tool_name
            }
    
    async def _process_sse_response(self, response) -> Dict[str, Any]:
        """
        处理SSE流式响应
        """
        result = {}
        async for line in response.aiter_lines():
            if line.startswith("data: "):
                data_str = line[6:]
                if data_str == "[DONE]":
                    break
                try:
                    data = json.loads(data_str)
                    # 处理不同类型的SSE消息
                    if "result" in data:
                        result = data["result"]
                    elif "error" in data:
                        result = {"error": data["error"]}
                except json.JSONDecodeError:
                    continue
        
        return result if result else {"message": "No data received"}
    
    def _generate_request_id(self) -> str:
        """生成请求ID"""
        import uuid
        return str(uuid.uuid4())
    
    def _get_current_time(self) -> str:
        """获取当前时间字符串"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def get_available_modules(self) -> Dict[str, str]:
        """获取可用的MCP模块"""
        return {key: value["description"] for key, value in self.mcp_config.items()}
    
    def get_available_tools(self, module: str = None) -> Dict[str, List[str]]:
        """
        获取可用的工具列表
        
        Args:
            module: 如果指定，返回该模块的工具；否则返回所有工具
        """
        if module:
            return {module: self.available_tools.get(module, [])}
        return self.available_tools


# 创建服务实例
qcc_service = QCCService()