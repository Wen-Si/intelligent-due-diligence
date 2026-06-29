# GitHub Pages 部署指南

## 🌐 访问URL

部署成功后，用户可以通过以下URL访问平台：

```
https://[YOUR_USERNAME].github.io/intelligent-due-diligence/
```

## 📋 部署步骤

### 1️⃣ 在GitHub创建仓库

1. 访问 https://github.com/new
2. 仓库名设置为：`intelligent-due-diligence`
3. 设置为 **Public**（GitHub Pages要求）
4. 不要勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

### 2️⃣ 推送代码到GitHub

在本地执行以下命令：

```bash
# 进入项目目录
cd intelligent-due-diligence

# 配置Git用户信息（如果尚未配置）
git config user.email "your-email@example.com"
git config user.name "Your Name"

# 添加远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/intelligent-due-diligence.git

# 或使用token认证
git remote add origin https://YOUR_GITHUB_TOKEN@github.com/YOUR_USERNAME/intelligent-due-diligence.git

# 推送代码
git push -u origin master
```

### 3️⃣ 启用GitHub Pages

1. 进入仓库页面：`https://github.com/YOUR_USERNAME/intelligent-due-diligence`
2. 点击 **Settings** 标签
3. 在左侧菜单找到 **Pages**
4. 在 "Build and deployment" 部分：
   - Source: 选择 **GitHub Actions**
5. 点击 **Save**

### 4️⃣ 触发自动部署

GitHub Actions会自动部署，也可以手动触发：

**方式一：自动触发**
- 每次推送到master分支，GitHub Actions会自动构建和部署

**方式二：手动触发**
1. 进入仓库的 **Actions** 标签
2. 选择 "Deploy to GitHub Pages" workflow
3. 点击 "Run workflow"

### 5️⃣ 查看部署状态

1. 进入 **Actions** 标签查看部署进度
2. 部署完成后（通常3-5分钟），在 **Pages** 设置中会显示访问URL

## 🔗 最终访问URL

部署成功后，访问地址为：

```
https://[YOUR_USERNAME].github.io/intelligent-due-diligence/
```

例如，如果你的GitHub用户名是 `wen-si`，则URL为：

```
https://wen-si.github.io/intelligent-due-diligence/
```

## ⚠️ 重要说明

### 前端与后端分离部署

GitHub Pages仅部署前端静态文件，后端服务需要单独部署：

**方案一：本地运行后端**
```bash
# 在本地或服务器上运行后端
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

然后在前端配置中设置API URL为实际后端地址。

**方案二：部署后端到云平台**
- AWS: 使用EC2或Lambda
- 阿里云: 使用ECS或函数计算
- Railway: 一键部署FastAPI应用
- Vercel: 支持Python应用部署

### 配置环境变量

在GitHub仓库设置中添加Secrets：

1. 进入 Settings → Secrets and variables → Actions
2. 添加以下Repository secrets：
   - `ZHIPU_API_KEY`: 智谱AI密钥
   - `PADDLEOCR_ACCESS_TOKEN`: PaddleOCR token
   - `QCC_API_KEY`: 企查查API密钥
   - `VITE_API_URL`: 后端API地址（可选）

## 🎯 部署流程图

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Repository (Public)                              │
│  https://github.com/YOUR_USERNAME/intelligent-due-diligence │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Push to master branch
                           ↓
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions Workflow                                 │
│  .github/workflows/deploy.yml                            │
│                                                          │
│  1. Setup Node.js 18                                     │
│  2. Install dependencies (npm ci)                        │
│  3. Build React app (npm run build)                      │
│  4. Upload artifact to GitHub Pages                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│  GitHub Pages Deployment                                 │
│                                                          │
│  URL: https://YOUR_USERNAME.github.io/intelligent-due-diligence/ │
│                                                          │
│  Static files served from frontend/dist                  │
└─────────────────────────────────────────────────────────┘
```

## 📊 部署配置文件说明

### 1. GitHub Actions Workflow (.github/workflows/deploy.yml)

自动构建和部署配置：
- **触发条件**: push到master分支或手动触发
- **构建环境**: Ubuntu + Node.js 18
- **构建步骤**: 安装依赖 → 构建应用 → 上传artifact
- **部署**: 自动发布到GitHub Pages

### 2. Vite配置 (frontend/vite.config.js)

关键配置：
- **base**: 设置为 `/intelligent-due-diligence/`（GitHub Pages子路径）
- **build**: 生产构建配置（代码分割、压缩）
- **proxy**: 本地开发API代理

## 🚀 快速部署命令

完整的部署命令序列：

```bash
# 1. 初始化Git仓库
cd intelligent-due-diligence
git init

# 2. 配置用户信息
git config user.email "your-email@example.com"
git config user.name "Your Name"

# 3. 添加所有文件
git add -A

# 4. 创建提交
git commit -m "Deploy intelligent due diligence platform"

# 5. 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/intelligent-due-diligence.git

# 6. 推送到GitHub
git push -u origin master

# 7. 查看部署状态
# 访问 https://github.com/YOUR_USERNAME/intelligent-due-diligence/actions
```

## 🔍 验证部署

部署完成后，访问以下地址验证：

1. **主页面**: https://YOUR_USERNAME.github.io/intelligent-due-diligence/

确认：
- ✅ 页面正常加载
- ✅ UI样式正确显示
- ✅ 文件上传功能可用（需要配置API）
- ✅ 所有静态资源正常加载

## 🛠️ 常见问题

### Q1: 页面显示404错误
**原因**: GitHub Pages未正确配置
**解决**: 确保在Settings → Pages中选择了"GitHub Actions"作为Source

### Q2: API调用失败
**原因**: GitHub Pages无法访问本地API
**解决**: 将后端部署到云平台，并在环境变量中配置API URL

### Q3: 样式或资源加载失败
**原因**: Vite base路径配置错误
**解决**: 确保vite.config.js中base设置为 `/intelligent-due-diligence/`

### Q4: GitHub Actions构建失败
**原因**: 依赖安装或构建错误
**解决**: 检查Actions日志，确保package.json配置正确

## 📝 后续优化

部署成功后，可以进一步优化：

1. **配置自定义域名**
   - 在GitHub Pages设置中添加自定义域名
   - 配置DNS CNAME记录

2. **启用HTTPS**
   - GitHub Pages自动启用HTTPS
   - 确保API服务也使用HTTPS

3. **配置CDN加速**
   - GitHub Pages自带CDN
   - 可进一步配置Cloudflare等CDN服务