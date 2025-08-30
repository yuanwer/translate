# 🌍 AI智能翻译工具

一个功能强大的现代化翻译应用，集成AI智能翻译、OCR图片识别和智能语言切换功能。

[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-green)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

### 🤖 AI智能翻译
- 支持多种AI翻译服务（OpenAI、Claude等）
- 自动检测源语言类型
- 支持16种主流语言互译
- 智能语言切换（中英文自动切换）

### 📸 OCR图片识别
- 基于Tesseract.js的客户端文字识别
- 支持中英文混合识别
- 拖拽上传图片功能
- 多种图片格式支持（JPG、PNG、WEBP）
- CDN降级机制确保稳定访问

### 🎨 现代化界面
- 基于React 19 + Tailwind CSS 4
- 响应式设计，适配各种设备
- 优雅的动画和交互效果
- 支持中英文界面切换

### 🔧 智能配置
- 本地存储配置信息
- 自定义API服务配置
- 智能语言切换开关
- 配置导入导出功能

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/your-username/translate.git
cd translate

# 安装依赖
npm install
```

### 配置API密钥
1. 启动应用后，点击右上角的设置按钮 ⚙️
2. 选择翻译服务（如OpenAI）
3. 输入您的API密钥
4. 配置API地址（可选，支持自定义端点）
5. 保存配置

### 启动开发服务器
```bash
npm run dev
```
应用将在 http://localhost:5173 启动

## 📋 使用指南

### 基本翻译
1. 在左侧文本框输入要翻译的文本
2. 选择源语言和目标语言
3. 点击"翻译"按钮获取结果

### 图片文字识别
1. 点击文本框中的"上传图片"按钮
2. 或直接拖拽图片到文本框
3. 等待OCR识别完成
4. 识别的文字会自动填入文本框

### 智能语言切换
- 启用后，系统会自动判断输入文本的语言
- 中文内容自动切换到英文翻译
- 英文内容自动切换到中文翻译

## 🌐 支持的语言

| 语言 | 代码 | 语言 | 代码 |
|------|------|------|------|
| 简体中文 | zh-CN | English | en |
| 繁体中文 | zh-TW | 日本語 | ja |
| 한국어 | ko | Français | fr |
| Deutsch | de | Español | es |
| Русский | ru | العربية | ar |
| हिन्दी | hi | Português | pt |
| Italiano | it | ไทย | th |
| Tiếng Việt | vi | 自动检测 | auto |

## 🤖 支持的AI服务

### OpenAI
- 模型：gpt-3.5-turbo, gpt-4, gpt-4-turbo
- 需要API密钥
- 支持自定义API端点

### 其他兼容服务
- 任何兼容OpenAI API格式的服务
- 支持自定义模型名称
- 灵活的端点配置

## 📁 项目结构

```
translate/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── ui/            # UI基础组件
│   │   ├── ImageUpload.jsx # 图片上传组件
│   │   ├── EnhancedTextInput.jsx # 增强文本输入
│   │   ├── LanguageSwitcher.jsx  # 语言切换器
│   │   └── ServiceConfig.jsx     # 服务配置
│   ├── services/          # 服务层
│   │   ├── translateService.js # 翻译服务
│   │   └── ocrService.js      # OCR服务
│   ├── i18n/             # 国际化配置
│   ├── App.jsx           # 主应用组件
│   └── main.jsx          # 应用入口
├── package.json
└── README.md
```

## 🛠️ 开发脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码格式检查
npm run lint
```

## 🔧 技术栈

### 前端框架
- **React 19** - 最新的React版本，支持并发特性
- **Vite 7** - 极速的构建工具和开发服务器

### UI框架
- **Tailwind CSS 4** - 原子化CSS框架
- **FontAwesome** - 图标库

### 核心依赖
- **Tesseract.js** - 客户端OCR文字识别
- **i18next** - 国际化框架
- **Axios** - HTTP客户端
- **react-i18next** - React国际化集成

### 开发工具
- **ESLint** - 代码质量检查
- **Vite插件** - React Fast Refresh支持

## ❓ 常见问题

### API配置问题
**Q: 翻译提示"需要配置API密钥"？**  
A: 请在设置中配置您的AI服务API密钥。目前支持OpenAI和兼容服务。

**Q: 支持哪些AI服务？**  
A: 支持OpenAI官方API，以及任何兼容OpenAI格式的第三方服务。

### OCR识别问题
**Q: 图片识别速度慢？**  
A: 首次使用需要下载识别模型，后续使用会更快。应用启动时会自动预热OCR引擎。

**Q: 识别准确度不高？**  
A: 建议上传清晰、对比度高的图片，避免模糊或倾斜的文字。

### 网络连接问题
**Q: OCR模型下载失败？**  
A: 应用内置CDN降级机制，会自动尝试多个CDN源，确保模型能够成功下载。

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 代码规范
- 使用ESLint进行代码检查
- 遵循React Hooks最佳实践
- 保持代码简洁易读

## 🙏 致谢

- [React](https://reactjs.org/) - 用于构建用户界面
- [Vite](https://vitejs.dev/) - 现代化的前端构建工具
- [Tesseract.js](https://tesseract.projectnaptha.com/) - 强大的OCR识别库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架

---

如果这个项目对您有帮助，请考虑给它一个 ⭐ Star！