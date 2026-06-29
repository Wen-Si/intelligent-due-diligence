"""
AI Service using Zhipu GLM-4.5-Flash
"""
import os
import json
from typing import Dict, Any, List
from dotenv import load_dotenv
import httpx

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("ZHIPU_API_KEY", "")
        self.model = os.getenv("ZHIPU_MODEL", "glm-4-flash")
        self.base_url = "https://open.bigmodel.cn/api/paas/v4"
    
    async def analyze_financial_data(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze financial data using GLM-4.5-Flash
        """
        # Prepare the prompt
        prompt = self._build_analysis_prompt(extracted_data)
        
        # Call Zhipu API
        try:
            analysis_result = await self.call_zhipu_api(prompt)
            return analysis_result
        except Exception as e:
            print(f"AI analysis failed: {str(e)}")
            # Return fallback analysis
            return self._generate_fallback_analysis(extracted_data)
    
    async def call_zhipu_api(self, prompt: str) -> Dict[str, Any]:
        """
        Call Zhipu GLM-4.5-Flash API
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": """你是一位专业的财务分析师和尽职调查专家。你的任务是分析企业的财务报表和审计报告，并生成专业的尽调分析报告。

报告应该包含以下部分：
1. 企业概况和财务概览
2. 关键财务指标分析（包括资产负债表、利润表、现金流量表）
3. 风险评估和预警
4. 结论和建议

分析要点：
- 关注企业的盈利能力、偿债能力、运营能力和发展能力
- 识别潜在的财务风险和经营风险
- 提供专业的分析和建议

请用专业、客观的语言进行分析，并提供具体的数字和指标支持。"""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 4000
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                raise Exception(f"Zhipu API error: {response.status_code} - {response.text}")
            
            result = response.json()
            
            # Extract the analysis content
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Parse the content into structured sections
            return self._parse_analysis_result(content)
    
    def _build_analysis_prompt(self, extracted_data: Dict[str, Any]) -> str:
        """
        Build the analysis prompt from extracted data
        """
        prompt_parts = ["请分析以下企业的财务数据，并生成专业的尽职调查报告：\n\n"]
        
        # Add document information
        prompt_parts.append("## 文档信息\n")
        for doc in extracted_data.get("documents", []):
            prompt_parts.append(f"- 文件名: {doc.get('file', '未知')}\n")
            prompt_parts.append(f"- 提取方法: {doc.get('method', '未知')}\n")
        
        # Add text content summary
        prompt_parts.append("\n## 提取的文本内容\n")
        for doc in extracted_data.get("documents", []):
            text_data = doc.get("text", [])
            for page_data in text_data:
                text = page_data.get("text", "")
                if text:
                    prompt_parts.append(f"\n### 第{page_data.get('page', '?')}页\n")
                    prompt_parts.append(text[:500] + "...\n" if len(text) > 500 else text + "\n")
        
        # Add table data
        if extracted_data.get("tables"):
            prompt_parts.append("\n## 提取的表格数据\n")
            for table in extracted_data.get("tables", []):
                prompt_parts.append(f"\n### 第{table.get('page', '?')}页表格\n")
                table_data = table.get("data", [])
                if table_data:
                    # Format table as markdown
                    prompt_parts.append("| " + " | ".join(table_data[0]) + " |\n")
                    prompt_parts.append("| " + " | ".join(["---"] * len(table_data[0])) + " |\n")
                    for row in table_data[1:5]:  # Show first 5 rows
                        prompt_parts.append("| " + " | ".join(row) + " |\n")
        
        # Add structured data
        if extracted_data.get("structured_data"):
            prompt_parts.append("\n## 结构化财务数据\n")
            for category, data in extracted_data.get("structured_data", {}).items():
                if data:
                    prompt_parts.append(f"\n### {category}\n")
                    for item in data[:10]:  # Show first 10 items
                        prompt_parts.append(f"- 关键词: {item.get('keyword')}\n")
        
        prompt_parts.append("\n\n请根据以上数据，生成详细的尽调分析报告。")
        
        return "".join(prompt_parts)
    
    def _parse_analysis_result(self, content: str) -> Dict[str, Any]:
        """
        Parse the AI analysis result into structured sections
        """
        # Split by common section headers
        sections = {
            "overview": "",
            "financial": "",
            "risks": "",
            "conclusion": "",
            "key_metrics": "",
            "risk_level": "",
            "score": ""
        }
        
        # Simple parsing based on keywords
        lines = content.split("\n")
        
        current_section = "overview"
        section_content = []
        
        for line in lines:
            # Detect section changes
            if "概况" in line or "概览" in line or "一、" in line:
                if current_section != "overview":
                    sections[current_section] = "\n".join(section_content)
                current_section = "overview"
                section_content = [line]
            elif "财务" in line or "指标" in line or "二、" in line:
                if current_section != "financial":
                    sections[current_section] = "\n".join(section_content)
                current_section = "financial"
                section_content = [line]
            elif "风险" in line or "评估" in line or "三、" in line:
                if current_section != "risks":
                    sections[current_section] = "\n".join(section_content)
                current_section = "risks"
                section_content = [line]
            elif "结论" in line or "建议" in line or "四、" in line:
                if current_section != "conclusion":
                    sections[current_section] = "\n".join(section_content)
                current_section = "conclusion"
                section_content = [line]
            else:
                section_content.append(line)
        
        # Save the last section
        sections[current_section] = "\n".join(section_content)
        
        # Convert to HTML (simple markdown conversion)
        result = {}
        for key, value in sections.items():
            if value:
                # Simple markdown to HTML conversion
                html = self._markdown_to_html(value)
                result[key] = html
        
        # Extract key metrics, risk level, and score
        result["key_metrics"] = self._extract_key_metrics(content)
        result["risk_level"] = self._extract_risk_level(content)
        result["score"] = self._extract_score(content)
        
        return result
    
    def _markdown_to_html(self, text: str) -> str:
        """
        Convert markdown text to HTML
        """
        import re
        
        # Headers
        text = re.sub(r'^### (.+)$', r'<h3>\1</h3>', text)
        text = re.sub(r'^## (.+)$', r'<h2>\1</h2>', text)
        text = re.sub(r'^# (.+)$', r'<h1>\1</h1>', text)
        
        # Bold
        text = re.sub(r'\*\*(.+)\*\*', r'<strong>\1</strong>', text)
        
        # Lists
        text = re.sub(r'^- (.+)$', r'<li>\1</li>', text)
        
        # Paragraphs
        paragraphs = text.split("\n\n")
        html_paragraphs = []
        for p in paragraphs:
            if p.strip() and not p.strip().startswith("<"):
                html_paragraphs.append(f"<p>{p.strip()}</p>")
            else:
                html_paragraphs.append(p)
        
        return "\n".join(html_paragraphs)
    
    def _extract_key_metrics(self, content: str) -> str:
        """
        Extract key metrics summary
        """
        # Look for numerical metrics in the content
        import re
        
        metrics = []
        patterns = [
            r'总资产[：:]\s*([\d.]+)',
            r'净利润[：:]\s*([\d.]+)',
            r'营业收入[：:]\s*([\d.]+)',
            r'资产负债率[：:]\s*([\d.]+)%'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content)
            if matches:
                metrics.append(matches[0])
        
        return ", ".join(metrics[:3]) if metrics else "需进一步分析"
    
    def _extract_risk_level(self, content: str) -> str:
        """
        Extract risk level
        """
        if "高风险" in content or "重大风险" in content:
            return "高风险"
        elif "中风险" in content or "一般风险" in content:
            return "中等风险"
        elif "低风险" in content or "风险较小" in content:
            return "低风险"
        else:
            return "待评估"
    
    def _extract_score(self, content: str) -> str:
        """
        Extract overall score
        """
        import re
        
        # Look for score pattern
        match = re.search(r'综合评分[：:]\s*([\d.]+)', content)
        if match:
            return match.group(1)
        
        # Look for rating
        if "优秀" in content or "良好" in content:
            return "A"
        elif "一般" in content or "中等" in content:
            return "B"
        elif "较差" in content:
            return "C"
        else:
            return "待评估"
    
    def _generate_fallback_analysis(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate fallback analysis when AI API fails
        """
        return {
            "overview": "<h1>财务概况</h1><p>基于上传的财务报表和审计报告，本报告将对企业财务状况进行全面分析。</p>",
            "financial": "<h2>财务分析</h2><p>详细财务数据分析需要AI处理，当前使用基础分析模式。</p>",
            "risks": "<h2>风险评估</h2><p>风险评估需要更详细的数据分析，建议重新提交文档进行完整分析。</p>",
            "conclusion": "<h2>结论建议</h2><p>建议进行更深入的尽职调查，获取更详细的财务信息。</p>",
            "key_metrics": "需完整分析",
            "risk_level": "待评估",
            "score": "待评估"
        }


# Export service instance
ai_service = AIService()