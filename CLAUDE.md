# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用开发命令

- `npm run dev` - 启动开发服务器 (http://localhost:5173)
- `npm run build` - 构建生产版本到 dist/ 目录
- `npm run preview` - 预览构建后的应用
- `npm run lint` - 运行 ESLint 检查代码规范

## 项目概述

这是一个功能强大的AI智能翻译工具，集成了多种现代化功能：

### 🤖 AI智能翻译
- 支持多种AI翻译服务（OpenAI、Claude等兼容OpenAI API格式的服务）
- 自动检测源语言类型，支持16种主流语言互译
- 智能语言切换：中英文自动切换功能

### 📸 视觉模型图片文本抽取
- 基于支持图片对话的多模态模型（如 gpt-4o-mini）
- 上传图片后直接调用视觉模型，返回图片中的文字内容

### 🔊 TTS语音合成
- 基于浏览器原生Web Speech API的语音合成
- 智能语言检测和语音播放
- 支持输入文本和翻译结果的语音朗读

### 🔧 图片文字修正（已移除）
- 旧的 OCR 修正功能已移除

### 🎨 现代化界面
- 响应式设计，适配各种设备
- 支持中英文界面切换（基于i18next）
- Google翻译风格的界面设计

## 技术架构

### 前端框架
- **React 19** - 使用函数式组件和 hooks，支持并发特性
- **Vite 7** - 快速的开发服务器和构建工具，支持ES modules和HMR
- **Tailwind CSS 4** - 原子化CSS框架，集成@tailwindcss/vite插件

### 核心服务层
- **translateService** (`src/services/translateService.js`) - AI翻译与视觉图片文本抽取
- **providers/aiChatProvider** (`src/services/providers/aiChatProvider.js`) - 对话与图片对话调用实现
- **ttsService** (`src/services/ttsService.js`) - TTS语音合成服务

### 状态管理
- **React Context** 模式：ToastContext用于全局消息提示
- **localStorage** 持久化：API配置、智能切换设置等
- **Custom Hooks**：useToast、useTTS等业务逻辑封装

### 国际化支持
- **i18next** + **react-i18next** - 完整的国际化解决方案
- 支持中英文界面切换，配置文件在 `src/i18n/locales/`
- 自动语言检测和本地存储

### 组件架构
- **UI组件库** (`src/components/ui/`) - 基础UI组件（Button、Input、Modal、Toast等）
- **业务组件** - EnhancedTextInput、ImageTranslation、ServiceConfig、OCRCorrectButton等
- **配置组件** - APIConfig、AIConfig、VoiceConfig、TTSSettings等
- **路径别名** - `@` 指向 `src` 目录（vite.config.js配置）

## 代码规范

项目使用 ESLint 进行代码规范检查：
- 基于 `@eslint/js` 推荐规则
- 启用 React Hooks 相关规则检查
- 支持 React Fast Refresh
- 自定义规则：允许大写开头的变量不使用（`varsIgnorePattern: '^[A-Z_]'`）

## 关键依赖

### 核心功能依赖
- **axios** - HTTP客户端，用于AI API调用
- **@fortawesome/fontawesome-free** - 图标库
- **react-markdown** + **remark-gfm** - Markdown渲染支持

### React生态
- **react-i18next** - React国际化集成
- **i18next-browser-languagedetector** - 浏览器语言检测

### OCR数据包（已移除）
- 旧的 tesseract.js 数据包依赖已移除

### 开发工具
- **@vitejs/plugin-react** - Vite的React插件
- **@tailwindcss/vite** - Tailwind CSS的Vite集成

## 特殊机制说明

### 视觉图片文本抽取
- 通过 Chat Completions 的图片对话，将图片 (image_url) 与文本 prompt 同时发送
- 注意 image_url 需要对象形式 { url: '...' }

### 智能语言切换
- 自动检测输入文本的中文字符比例（`App.jsx:51`）
- 中文内容自动切换到英文翻译，英文内容自动切换到中文翻译
- 可在配置中开启/关闭此功能

### API配置管理
- 支持自定义API端点和模型配置
- 配置信息存储在localStorage中
- 支持导入导出配置功能

## 文件结构

```
src/
├── components/
│   ├── ui/                 # 基础UI组件库
│   ├── ImageTranslation.jsx   # 图片翻译组件
│   ├── EnhancedTextInput.jsx  # 增强文本输入组件
│   ├── ServiceConfig.jsx      # 服务配置组件
│   └── ...
├── services/              # 核心服务层
│   ├── translateService.js   # AI翻译服务
│   ├── ocrService.js        # OCR识别服务
│   └── ttsService.js        # TTS语音服务
├── contexts/              # React Context
│   └── ToastContext.jsx
├── hooks/                 # 自定义Hooks
│   ├── useToast.js
│   └── useTTS.js
├── i18n/                  # 国际化配置
│   ├── index.js
│   └── locales/
├── App.jsx               # 主应用组件
└── main.jsx              # 应用入口
```

## 构建配置

### Vite配置 (vite.config.js)
- **base路径**: `/translate/` - 用于GitHub Pages等部署场景
- **路径别名**: `@` 指向 `src` 目录，便于相对路径导入
- **插件集成**: React + Tailwind CSS完整支持

### ESLint配置 (eslint.config.js)
- 基于最新的Flat Config格式
- 集成React Hooks推荐规则和React Fast Refresh
- 自定义规则：允许大写常量不使用 (`varsIgnorePattern: '^[A-Z_]'`)

## 提示

不要启动开发服务，我想自己启动