# GitHub 部署指南

本指南将帮助您将智能尽调平台部署到GitHub。

## 前提条件

- 已安装 Git
- GitHub 账号
- GitHub Personal Access Token（需要 `repo` 权限）

## 部署步骤

### 1. 在GitHub上创建新仓库

访问 https://github.com/new 创建名为 `intelligent-due-diligence` 的仓库。

设置：
- Repository name: `intelligent-due-diligence`
- Description: `企业智能尽调平台 - AI驱动的财务分析系统`
- Public/Private: 选择 Public
- 不要勾选 "Initialize with README"（因为我们已经有本地代码）

点击 "Create repository"

### 2. 配置Git并推送代码

在本地终端执行以下命令：

```bash
# 进入项目目录
cd intelligent-due-diligence

# 配置Git用户信息
git config user.email "your-email@example.com"
git config user.name "Your Name"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/intelligent-due-diligence.git

# 或者使用token方式认证：
git remote add origin https://YOUR_GITHUB_TOKEN@github.com/YOUR_USERNAME/intelligent-due-diligence.git

# 推送到GitHub
git push -u origin master
```

### 3. 使用GitHub CLI（可选）

如果您已安装 GitHub CLI (`gh`)，可以使用以下命令：

```bash
# 认证
gh auth login

# 创建仓库
gh repo create intelligent-due-diligence --public --description "企业智能尽调平台"

# 推送代码
git push -u origin master
```

### 4. 启用GitHub Pages

1. 进入仓库 Settings → Pages
2. Source: 选择 **GitHub Actions**
3. 点击 Save
4. 等待自动部署完成（3-5分钟）

### 5. 验证部署

访问您的仓库页面：`https://github.com/YOUR_USERNAME/intelligent-due-diligence`

访问GitHub Pages：`https://YOUR_USERNAME.github.io/intelligent-due-diligence/`

确认所有文件都已上传成功。

## 仓库结构

上传后，仓库应包含以下文件：

```
intelligent-due-diligence/
├── README.md                 # 项目说明文档
├── .gitignore               # Git忽略配置
├── .github/workflows/       # GitHub Actions配置
├── docker-compose.yml       # Docker编排文件
├── frontend/                # 前端项目
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   └── services/
│   └── index.html
└── backend/                 # 后端项目
    ├── Dockerfile
    ├── requirements.txt
    ├── .env.example
    └── app/
        ├── main.py
        ├── models/
        └── services/
```

## 安全注意事项

⚠️ **安全警告**：
- `.env` 文件包含敏感信息（API密钥），已被 `.gitignore` 排除，不会上传到GitHub
- 不要在公开仓库中暴露真实的API密钥
- 生产环境中使用GitHub Secrets或环境变量注入密钥

## 环境变量配置

在GitHub仓库设置中添加Secrets：

1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加以下Repository secrets：
   - `ZHIPU_API_KEY`: 您的智谱AI API密钥
   - `PADDLEOCR_ACCESS_TOKEN`: 您的PaddleOCR access token
   - `QCC_API_KEY`: 您的企查查API密钥

## API密钥获取

- 智谱AI: https://open.bigmodel.cn/
- PaddleOCR: https://aistudio.baidu.com/
- 企查查MCP: https://agent.qcc.com/

## 下一步

完成GitHub部署后，您可以：

1. **本地测试**：按照README.md中的说明启动服务
2. **云平台部署后端**：将后端部署到云平台（阿里云、AWS、Railway等）
3. **配置API地址**：在前端配置后端API地址
4. **自定义域名**：在GitHub Pages设置中添加自定义域名