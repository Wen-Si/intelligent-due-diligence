# 企业智能尽调平台

一个基于AI的企业财务尽调分析平台，支持上传PDF财务报表和审计报告，自动生成专业的尽调分析报告。

## 功能特性

- 📄 **PDF文档上传**：支持财务报表、审计报告等PDF文件上传
- 🔍 **智能OCR解析**：集成PaddleOCR-VL-1.6进行文档识别
- 🤖 **AI报告生成**：使用智谱GLM-4.5-Flash生成专业尽调报告
- 📊 **结构化分析**：自动提取关键财务指标和风险点
- 📋 **报告导出**：支持多种格式导出分析报告

## 技术栈

### 前端
- React 18 + Vite
- Tailwind CSS
- Axios

### 后端
- Python 3.10+
- FastAPI
- PaddleOCR MCP
- 智谱AI API

## 项目结构

```
intelligent-due-diligence/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   └── App.jsx         # 主应用
│   ├── package.json
│   └── vite.config.js
├── backend/                # 后端项目
│   ├── app/
│   │   ├── api/           # API路由
│   │   ├── services/      # 业务逻辑
│   │   ├── models/        # 数据模型
│   │   └── main.py        # 应用入口
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 快速开始

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

### 后端启动

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 环境配置

创建 `backend/.env` 文件：

```
ZHIPU_API_KEY=your_zhipu_api_key
PADDLEOCR_ACCESS_TOKEN=your_paddleocr_token
```

## API文档

启动后端后访问：http://localhost:8000/docs

## 许可证

MIT License