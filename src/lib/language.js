// 语言与代码转换相关的工具

export const LANGUAGE_NAME_MAP = {
  'zh': '中文',
  'zh-CN': '简体中文',
  'zh-TW': '繁体中文',
  'en': '英文',
  'ja': '日文',
  'ko': '韩文',
  'fr': '法文',
  'de': '德文',
  'es': '西班牙文',
  'ru': '俄文',
  'ar': '阿拉伯文',
  'hi': '印地文',
  'pt': '葡萄牙文',
  'it': '意大利文',
  'th': '泰文',
  'vi': '越南文'
}

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: '自动检测' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁体中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本语' },
  { code: 'ko', name: '한국어' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' }
]

export function getLanguageName(code) {
  return LANGUAGE_NAME_MAP[code] || code
}

export function convertToChromeLanguageCode(code) {
  const conversionMap = {
    'auto': 'auto',
    'zh-CN': 'zh',
    'zh-TW': 'zh-Hant',
    'en': 'en',
    'ja': 'ja',
    'ko': 'ko',
    'fr': 'fr',
    'de': 'de',
    'es': 'es',
    'ru': 'ru',
    'ar': 'ar',
    'hi': 'hi',
    'pt': 'pt',
    'it': 'it',
    'th': 'th',
    'vi': 'vi'
  }
  return conversionMap[code] || code.split('-')[0]
}


