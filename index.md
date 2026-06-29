---
layout: default
title: 智能尽调平台
description: AI驱动的企业财务分析系统
---

<!-- GitHub Pages使用的简化入口页面 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>智能尽调平台 - AI驱动的企业财务分析</title>
    <meta name="description" content="上传PDF财务报表和审计报告，AI自动生成专业尽调分析报告">
    <link rel="icon" type="image/svg+xml" href="/intelligent-due-diligence/vite.svg">
    
    <!-- 美化的样式 -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            max-width: 900px;
            padding: 60px;
            border-radius: 30px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.3);
        }
        
        h1 {
            color: #2c3e50;
            font-size: 48px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .subtitle {
            color: #7f8c8d;
            font-size: 18px;
            text-align: center;
            margin-bottom: 40px;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin: 40px 0;
        }
        
        .feature {
            text-align: center;
            padding: 30px;
            border-radius: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .feature-icon {
            font-size: 50px;
            margin-bottom: 15px;
        }
        
        .feature h3 {
            color: #34495e;
            font-size: 20px;
            margin-bottom: 10px;
        }
        
        .feature p {
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .cta {
            text-align: center;
            margin-top: 40px;
        }
        
        .btn {
            display: inline-block;
            padding: 18px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 20px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 15px;
            transition: transform 0.3s, box-shadow 0.3s;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        
        .btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
        }
        
        .info {
            background: #fff3cd;
            padding: 20px;
            border-radius: 15px;
            margin-top: 30px;
            border-left: 5px solid #f39c12;
        }
        
        .info h4 {
            color: #856404;
            margin-bottom: 10px;
        }
        
        .info p {
            color: #856404;
            font-size: 14px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #eee;
            color: #7f8c8d;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 30px;
            }
            
            h1 {
                font-size: 32px;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 智能尽调平台</h1>
        <p class="subtitle">AI驱动的企业财务尽调分析系统</p>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">📄</div>
                <h3>智能解析</h3>
                <p>PaddleOCR高精度识别</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🤖</div>
                <h3>AI分析</h3>
                <p>智谱GLM-4.5深度分析</p>
            </div>
            <div class="feature">
                <div class="feature-icon">📊</div>
                <h3>专业报告</h3>
                <p>结构化尽调报告生成</p>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>实时反馈</h3>
                <p>可视化分析进度</p>
            </div>
        </div>
        
        <div class="cta">
            <a href="/intelligent-due-diligence/" class="btn">
                🚀 开始使用
            </a>
        </div>
        
        <div class="info">
            <h4>💡 使用说明</h4>
            <p><strong>功能：</strong>上传PDF财务报表和审计报告，AI自动生成专业尽调分析报告</p>
            <p><strong>流程：</strong>OCR识别 → 数据提取 → AI分析 → 报告生成</p>
            <p><strong>注意：</strong>需要后端API服务支持，请参考README.md配置后端</p>
        </div>
        
        <div class="footer">
            <p>© 2024 智能尽调平台 | 专业财务分析解决方案</p>
            <p>技术支持：PaddleOCR + 智谱AI</p>
        </div>
    </div>
</body>
</html>