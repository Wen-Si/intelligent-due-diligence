"""
Word Document Generator Service
Uses docx-js (Node.js) via subprocess to generate professional Word documents
"""
import os
import json
import subprocess
import tempfile
from typing import Dict, Any
from datetime import datetime

class WordGeneratorService:
    """Generate professional Word documents from analysis results"""
    
    def __init__(self):
        self.script_dir = os.path.dirname(__.abspath(__file__))
        self.template_script = os.path.join(self.script_dir, "generate_docx.js")
    
    async def generate_due_diligence_report(
        self, 
        company_info: Dict[str, Any],
        ocr_results: Dict[str, Any],
        ai_analysis: Dict[str, Any],
        company_name: str
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive due diligence report in Word format
        
        Args:
            company_info: QCC company information
            ocr_results: OCR extracted data from PDFs
            ai_analysis: AI generated analysis
            company_name: Company name
            
        Returns:
            Dict with file path and download information
        """
        # Prepare data for document generation
        doc_data = {
            "companyName": company_name,
            "generatedAt": datetime.now().strftime("%Y年%m月%d日 %H:%M:%S"),
            "companyInfo": company_info,
            "ocrResults": ocr_results,
            "aiAnalysis": ai_analysis
        }
        
        # Create temporary JSON file with data
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(doc_data, f, ensure_ascii=False)
            json_path = f.name
        
        # Generate output file path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_company_name = company_name.replace("/", "_").replace("\\", "_")
        output_filename = f"尽调报告_{safe_company_name}_{timestamp}.docx"
        output_path = os.path.join(self.script_dir, "..", "..", "reports", output_filename)
        
        # Ensure reports directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Call Node.js script to generate docx
        try:
            result = subprocess.run(
                ["node", self.template_script, json_path, output_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                raise Exception(f"Word generation failed: {result.stderr}")
            
            # Clean up temp file
            os.unlink(json_path)
            
            # Return file info
            return {
                "fileName": output_filename,
                "filePath": output_path,
                "downloadUrl": f"/api/download/{output_filename}",
                "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "documentCount": len(ocr_results.get("documents", [])),
                "companyName": company_name
            }
            
        except subprocess.TimeoutExpired:
            os.unlink(json_path)
            raise Exception("Word generation timeout")
        except Exception as e:
            os.unlink(json_path)
            raise Exception(f"Word generation error: {str(e)}")


# Create service instance
word_generator = WordGeneratorService()