# 🌍 AI Translation Tool

English | [简体中文 (Chinese)](README.zh-CN.md)

A modern, powerful translation app featuring AI text translation, vision-based text extraction from images, and intelligent language switching.

[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-green)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🤖 AI Translation
- Supports multiple AI translation services (OpenAI and any service compatible with the OpenAI API format)
- Auto-detects source language and translates between major languages
- Smart language switching: Chinese → English, English → Chinese automatically
- Real-time translation display with copy and TTS support

### 📸 Vision OCR/Text Extraction
- Powered by multimodal models that support image understanding (e.g. gpt-4o-mini)
- Upload an image and get extracted text directly from the model
- Supports data:URL or public URL for images (public URL recommended)

### 🔊 Text-to-Speech (TTS)
- Uses browser-native Web Speech API
- Reads both input and translated text
- Auto-selects suitable voice based on detected language
- Adjustable rate, pitch, and volume
- Multiple voices available (varies by OS and browser)

### 🎨 Modern UI
- Built with React 19 + Tailwind CSS 4
- Responsive design for desktop and mobile
- Clean, Google Translate–style interface
- Smooth animations and interactions
- UI language switch (via i18next)

### 🔧 Smart Settings
- Store configuration locally for privacy and control
- Customizable API endpoints for various compatible services
- Smart language switch toggle
- Import/Export settings for backup and migration

## 🚀 Getting Started

### Requirements
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation
```bash
# Clone
git clone https://github.com/your-username/translate.git
cd translate

# Install deps
npm install
```

### Configure API Keys
1. Start the app and click the Settings button (⚙️) in the top-right
2. Choose a translation service (e.g. OpenAI)
3. Enter your API key
4. Optionally set a custom API base URL
5. Save

### Start Dev Server
```bash
npm run dev
```
App will run at http://localhost:5173

## 📋 Usage

### Text Translation
1. Enter text in the left input box
2. Choose source and target languages (auto-detect supported)
3. Click "Translate"
4. Use copy and TTS controls on the right

### Image Text Extraction (Vision)
1. Switch to the "Image Translation" tab
2. Click "Upload Image" or drag-and-drop an image
3. Wait for the vision model to extract text
4. Optionally translate the extracted text

### TTS
1. After translation, click the speaker icon 🔊 in the textbox
2. Reads both input and output text
3. Adjust rate/pitch/volume in Settings
4. Click again to stop

### Smart Language Switching
- Enable in Settings
- Language is auto-detected
- Chinese input switches to English target
- English input switches to Chinese target
- Other languages respect your current selection

### Configuration
1. Click ⚙️ to open the settings panel
2. Configure API key and endpoint
3. Adjust TTS and smart switch options
4. Import/Export settings as needed

## 🌐 Supported Languages

| Language | Code | Language | Code |
|----------|------|----------|------|
| 简体中文 | zh-CN | English  | en   |
| 繁体中文 | zh-TW | 日本語    | ja   |
| 한국어   | ko    | Français | fr   |
| Deutsch  | de    | Español  | es   |
| Русский  | ru    | العربية  | ar   |
| हिन्दी    | hi    | Português| pt   |
| Italiano | it    | ไทย      | th   |
| Tiếng Việt | vi  | Auto     | auto |

## 🤖 Supported AI Services

### OpenAI
- Models: gpt-3.5-turbo, gpt-4, gpt-4-turbo (vision models like gpt-4o-mini for images)
- Requires API key
- Custom API endpoint supported

### Other Compatible Services
- Any provider compatible with the OpenAI API format
- Custom model names supported
- Flexible endpoint configuration

## 📁 Project Structure

```
translate/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images and icons
│   ├── components/             # React components
│   │   ├── ui/                 # UI primitives
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   ├── modal.jsx
│   │   │   ├── toast.jsx
│   │   │   ├── card.jsx
│   │   │   └── ...
│   │   ├── ImageTranslation.jsx
│   │   ├── EnhancedTextInput.jsx
│   │   ├── TextTranslation.jsx
│   │   ├── TranslationPanel.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   ├── ServiceConfig.jsx
│   │   ├── TTSSettings.jsx
│   │   └── ...
│   ├── services/               # Core services
│   │   ├── ocrService.js
│   │   ├── ocrCorrectService.js
│   │   ├── translateService.js
│   │   └── ttsService.js
│   ├── contexts/
│   │   ├── toastContext.js
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   ├── useToast.js
│   │   ├── useTTS.js
│   │   ├── useCopyToClipboard.js
│   │   └── useLanguageDetection.js
│   ├── i18n/
│   │   ├── index.js
│   │   └── locales/
│   │       ├── zh.json
│   │       └── en.json
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vite.config.js
├── eslint.config.js
├── package.json
├── CLAUDE.md
└── README.md
```

## 🛠️ Scripts

```bash
# Dev
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## 🔧 Tech Stack

### Frontend
- React 19
- Vite 7

### UI
- Tailwind CSS 4
- FontAwesome

### Core Dependencies
- Axios
- i18next + react-i18next
- @fortawesome/fontawesome-free

### Tools
- ESLint
- @vitejs/plugin-react
- @tailwindcss/vite

## ❓ FAQ

### API Configuration
**Q: App says an API key is required.**  
A: Configure your AI service API key in Settings. OpenAI and compatible services are supported.

**Q: Which AI services are supported?**  
A: OpenAI official API and any provider compatible with the OpenAI format.

### Vision/OCR
**Q: Receiving HTTP 400?**  
A: Ensure `image_url` uses an object shape like `{"url": "..."}` and choose a vision-capable model (e.g. `gpt-4o-mini`).

### TTS
**Q: TTS does not play?**  
A: Make sure your browser supports the Web Speech API. Chrome, Edge, and Safari are recommended.

**Q: No suitable voice found?**  
A: Available voices depend on OS and browser. Windows may require installing voice packs.

**Q: TTS stops unexpectedly?**  
A: Some browsers require a user gesture to start audio. Trigger playback after user interaction.

### Connectivity
**Q: data:URL not working?**  
A: Some providers do not support data:URL. Prefer a publicly accessible image URL.

### Browser Support
Modern browsers recommended: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+. OCR requires WebAssembly; TTS requires Web Speech API.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

Issues and PRs are welcome!

### Workflow
1. Fork this repo
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ESLint
- Follow React Hooks best practices
- Keep code clean and readable

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)