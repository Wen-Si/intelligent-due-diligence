# 智能尽调平台 - 快速启动指南

## 项目概述

这是一个基于AI的企业财务尽调分析平台，支持上传PDF财务报表和审计报告，自动生成专业的尽调分析报告。

## 快速启动

### 方式一：使用Docker（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/YOUR_USERNAME/intelligent-due-diligence.git
cd intelligent-due-diligence

# 2. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入以下内容：
# ZHIPU_API_KEY=325d6fa364954d2e871c30ba95b553bd.KBdQdqgJgELJBhnv
# PADDLEOCR_ACCESS_TOKEN=6b9d335137579d7d288aba97647652b8e91f2a15

# 3. 启动服务
docker-compose up -d

# 4. 访问应用
# 前端：http://localhost:3000
# 后端API：http://localhost:8000/docs
```

### 方式二：本地开发

#### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

#### 后端启动

```bash
cd backend

# 创建虚拟环境（可选）
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件填入API密钥

# 启动服务
uvicorn app.main:app --reload

# 访问 http://localhost:8000/docs 查看API文档
```

## 功能特性

### 📄 文档上传
- 支持PDF格式的财务报表、审计报告
- 批量上传，单文件最大50MB
- 实时显示上传进度

### 🔍 OCR识别
- 集成PaddleOCR-VL-1.6
- 高精度文字识别
- 自动提取表格数据

### 🤖 AI分析
- 使用智谱GLM-4.5-Flash模型
- 自动分析财务状况
- 识别风险点和机会

### 📋 报告生成
- 自动生成结构化报告
- 包含财务概览、风险评估、结论建议
- 支持导出和分享

## API密钥配置

### 智谱AI API

平台使用智谱AI的GLM-4.5-Flash模型进行财务分析。

配置方式：
```env
ZHIPU_API_KEY=325d6fa364954d2e871c30ba95b553bd.KBdQdqgJgELJBhnv
ZHIPU_MODEL=glm-4-flash
```

### PaddleOCR MCP

平台集成PaddleOCR进行PDF文档解析。

配置方式：
```env
PADDLEOCR_ACCESS_TOKEN=6b9d335137579d7d288aba97647652b8e91f2a15
PADDLEOCR_MCP_MODEL=PaddleOCR-VL-1.6
PADDLEOCR_MCP_PPOCR_SOURCE=aistudio
```

## 项目结构

```
intelligent-due-diligence/
├── frontend/                # React前端应用
│   ├── src/
│   │   ├── components/     # UI组件
│   │   ├── services/       # API服务
│   │   └── App.jsx         # 主应用
│   └── Dockerfile          # 前端容器配置
│
├── backend/                # Python后端应用
│   ├── app/
│   │   ├── api/           # API路由
│   │   ├── models/        # 数据模型
│   │   ├── services/      # 业务服务
│   │   │   ├── ocr_service.py      # OCR处理
│   │   │   ├── ai_service.py       # AI分析
│   │   │   └── analysis_service.py # 综合分析
│   │   └── main.py        # FastAPI主入口
│   ├── requirements.txt   # Python依赖
│   └── Dockerfile         # 后端容器配置
│
├── docker-compose.yml     # Docker编排
├── README.md              # 项目说明
└── DEPLOYMENT.md          # 部署指南
```

## 技术栈

### 前端
- **React 18** - UI框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Axios** - HTTP客户端

### 后端
- **Python 3.10** - 开发语言
- **FastAPI** - Web框架
- **Uvicorn** - ASGI服务器
- **pdfplumber** - PDF处理
- **httpx** - HTTP客户端

### AI服务
- **智谱GLM-4.5-Flash** - 大语言模型
- **PaddleOCR-VL-1.6** - OCR识别

### 部署
- **Docker** - 容器化
- **Docker Compose** - 服务编排

## API文档

启动后端后，访问以下地址查看交互式API文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 主要API端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/analyze` | POST | 上传并分析文档 |
| `/api/status/{task_id}` | GET | 获取分析进度 |
| `/api/report/{task_id}` | GET | 获取完整报告 |
| `/api/history` | GET | 获取历史记录 |
| `/health` | GET | 健康检查 |

## 使用流程

1. **上传文档**
   - 点击上传区域或拖拽PDF文件
   - 支持批量上传多个文件

2. **开始分析**
   - 点击"开始分析"按钮
   - 系统自动处理文档

3. **查看报告**
   - 实时查看分析进度
   - 完成后浏览详细报告
   - 切换不同报告标签页

4. **导出报告**
   - 点击"导出报告"按钮
   - 下载完整分析报告

## 常见问题

### Q: 支持哪些文件格式？
A: 目前仅支持PDF格式文件，包括财务报表、审计报告等。

### Q: 文件大小限制是多少？
A: 单个文件最大50MB，支持批量上传。

### Q: 分析需要多长时间？
A: 一般3-5分钟，具体取决于文档复杂度和大小。

### Q: 报告包含哪些内容？
A: 包含企业概况、财务分析、风险评估、结论建议四个部分。

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过GitHub Issues联系我们。