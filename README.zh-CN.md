# 🌍 AI智能翻译工具

一个功能强大的现代化翻译应用，集成AI智能翻译、视觉模型图片文本抽取和智能语言切换功能。

[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-green)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

### 🤖 AI智能翻译
- 支持多种AI翻译服务（OpenAI、Claude等兼容OpenAI API格式的服务）
- 自动检测源语言类型，支持16种主流语言互译
- 智能语言切换：中文内容自动切换到英文翻译，英文内容自动切换到中文翻译
- 实时翻译结果显示，支持复制和语音朗读

### 📸 视觉模型图片文本抽取
- 基于支持图片对话的多模态模型（如 gpt-4o-mini）
- 上传图片后直接调用视觉模型，返回图片中的文字内容
- 支持 data:URL 或公网 URL 的图片传入（推荐公网 URL）

### 🔊 TTS语音合成
- 基于浏览器原生Web Speech API的语音合成功能
- 支持输入文本和翻译结果的智能语音朗读
- 自动语言检测，选择合适的语音引擎
- 可调节语速、音调、音量等语音参数
- 支持多种语音选择（取决于系统和浏览器）

### 🎨 现代化界面
- 基于React 19 + Tailwind CSS 4构建
- 响应式设计，完美适配桌面和移动设备
- Google翻译风格的直观界面设计
- 优雅的动画和交互效果
- 支持中英文界面切换（基于i18next）

### 🔧 智能配置
- 本地存储配置信息，数据安全可控
- 自定义API服务配置，支持各种兼容服务
- 智能语言切换开关，个性化翻译体验
- 配置导入导出功能，方便备份和迁移

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

### 文本翻译
1. 在左侧文本框输入要翻译的文本
2. 选择源语言和目标语言（支持自动检测）
3. 点击"翻译"按钮获取结果
4. 使用右侧的复制和语音按钮处理翻译结果

### 图片文字识别（视觉模型）
1. 切换到"图片翻译"标签页
2. 点击"上传图片"按钮或直接拖拽图片到界面
3. 等待视觉模型抽取完成
4. 抽取的文字会自动显示，可进一步翻译

### 语音朗读功能
1. 翻译完成后，点击文本框右下角的语音按钮 🔊
2. 支持朗读输入文本和翻译结果
3. 可在设置中调节语速、音调、音量等参数
4. 点击相同按钮可停止当前朗读

### 智能语言切换
- 在设置中启用智能语言切换功能
- 系统会自动判断输入文本的语言类型
- 中文内容自动切换到英文翻译模式
- 英文内容自动切换到中文翻译模式
- 其他语言保持用户选择的设置

### 配置管理
1. 点击右上角的设置按钮 ⚙️ 打开配置面板
2. 配置AI翻译服务的API密钥和端点
3. 调整TTS语音参数和智能切换设置
4. 可导出配置备份或导入已有配置

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
├── public/                     # 静态资源
├── src/
│   ├── components/             # React组件
│   │   ├── ui/                # UI基础组件库
│   │   │   ├── button.jsx     # 按钮组件
│   │   │   ├── input.jsx      # 输入框组件
│   │   │   ├── modal.jsx      # 模态框组件
│   │   │   ├── toast.jsx      # 消息提示组件
│   │   │   └── ...            # 其他UI组件
│   │   ├── ImageTranslation.jsx   # 图片翻译组件
│   │   ├── EnhancedTextInput.jsx  # 增强文本输入组件
│   │   ├── LanguageSwitcher.jsx   # 语言切换器
│   │   ├── ServiceConfig.jsx      # 服务配置组件
│   │   ├── TTSSettings.jsx        # TTS语音设置组件
│   │   └── ...                    # 其他业务组件
│   ├── services/              # 核心服务层
│   │   ├── translateService.js   # AI翻译服务
│   │   ├── providers/aiChatProvider.js # AI 对话与图片对话调用
│   │   └── ttsService.js         # TTS语音合成服务
│   ├── contexts/              # React Context
│   │   └── ToastContext.jsx      # 全局消息提示上下文
│   ├── hooks/                 # 自定义Hooks
│   │   ├── useToast.js           # 消息提示Hook
│   │   └── useTTS.js             # TTS语音Hook
│   ├── i18n/                  # 国际化配置
│   │   ├── index.js              # i18n主配置
│   │   └── locales/              # 语言包
│   │       ├── zh.json           # 中文语言包
│   │       └── en.json           # 英文语言包
│   ├── App.jsx                # 主应用组件
│   ├── main.jsx              # 应用入口
│   └── index.css             # 全局样式
├── vite.config.js            # Vite配置文件
├── eslint.config.js          # ESLint配置文件
├── package.json              # 项目依赖和脚本
├── CLAUDE.md                 # Claude Code开发指南
└── README.md                 # 项目说明文档
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
- **Axios** - HTTP客户端，用于AI API调用
- **i18next** + **react-i18next** - 完整的国际化解决方案
- **@fortawesome/fontawesome-free** - 图标库

### 状态管理与工具
- **React Context** - ToastContext全局消息提示
- **Custom Hooks** - useToast、useTTS等业务逻辑封装
- **Web Speech API** - 浏览器原生TTS语音合成

### 开发工具
- **ESLint** - 代码质量检查和规范
- **@vitejs/plugin-react** - Vite的React插件，支持Fast Refresh
- **@tailwindcss/vite** - Tailwind CSS的Vite集成插件

## ❓ 常见问题

### API配置问题
**Q: 翻译提示"需要配置API密钥"？**  
A: 请在设置中配置您的AI服务API密钥。目前支持OpenAI和兼容服务。

**Q: 支持哪些AI服务？**  
A: 支持OpenAI官方API，以及任何兼容OpenAI格式的第三方服务。

### 图片抽取问题
**Q: 400 错误？**  
A: 确保 `image_url` 采用对象形式：`{"url": "..."}`，并选择支持图片对话的视觉模型（如 `gpt-4o-mini`）。

### TTS语音问题
**Q: 语音朗读功能无法使用？**  
A: 确保浏览器支持Web Speech API。推荐使用Chrome、Edge、Safari等现代浏览器。

**Q: 找不到合适的语音？**  
A: 语音选择取决于操作系统和浏览器。Windows用户可安装语音包，macOS和移动设备通常内置多种语音。

**Q: 语音朗读被中断？**  
A: 某些浏览器要求用户交互才能播放语音。确保在用户操作后触发语音功能。

### 网络连接问题
**Q: data:URL 无法解析？**  
A: 部分服务商不支持 data:URL，建议使用可公网访问的图片 URL。

### 浏览器兼容性
**Q: 哪些浏览器支持完整功能？**  
A: 推荐使用Chrome 88+、Firefox 85+、Safari 14+、Edge 88+。OCR功能需要WebAssembly支持，TTS需要Web Speech API支持。

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
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架

---

如果这个项目对您有帮助，请考虑给它一个 ⭐ Star！


