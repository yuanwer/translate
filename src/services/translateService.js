import axios from 'axios'
import i18n from '../i18n'

export class TranslateService {
  constructor() {
    this.aiService = new AITranslateService()
  }

  async translate(text, sourceLang, targetLang, config = {}) {
    return await this.aiService.translate(text, sourceLang, targetLang, config)
  }

  getSupportedLanguages() {
    return this.aiService.getSupportedLanguages()
  }
}

class AITranslateService {
  constructor() {
    this.name = 'AI翻译'
    this.defaultConfig = {
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      apiKey: '',
      serviceName: 'OpenAI'
    }
  }

  async translate(text, sourceLang, targetLang, config) {
    const { 
      url = this.defaultConfig.url, 
      model = this.defaultConfig.model, 
      apiKey, 
      serviceName = this.defaultConfig.serviceName 
    } = config
    
    if (!apiKey) {
      throw new Error(i18n.t('errors.translate.apiKeyRequired'))
    }

    if (!url) {
      throw new Error(i18n.t('errors.translate.apiUrlRequired'))
    }

    try {
      const sourceLangName = this.getLanguageName(sourceLang)
      const targetLangName = this.getLanguageName(targetLang)
      
      let prompt
      if (sourceLang === 'auto') {
        prompt = `请将以下文本翻译成${targetLangName}。请按以下格式返回结果：

检测语言: [检测到的源语言代码，如zh、en、ja等]
翻译结果: [翻译后的文本]

原文：
${text}`
      } else {
        prompt = `请将以下${sourceLangName}文本翻译成${targetLangName}。请按以下格式返回结果：

检测语言: ${sourceLang}
翻译结果: [翻译后的文本]

原文：
${text}`
      }

      const response = await axios.post(
        url,
        {
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error(i18n.t('errors.translate.responseFormatError'))
      }

      const content = response.data.choices[0].message.content.trim()
      
      // 解析返回结果
      let translatedText = content
      let detectedLanguage = sourceLang
      
      // 尝试解析格式化的回复
      const detectMatch = content.match(/检测语言:\s*([a-zA-Z-]+)/)
      const translateMatch = content.match(/翻译结果:\s*([\s\S]+)/)
      
      if (detectMatch && translateMatch) {
        detectedLanguage = detectMatch[1].toLowerCase()
        translatedText = translateMatch[1].trim()
      } else {
        // 如果AI没有按格式返回，则使用整个内容作为翻译结果
        translatedText = content
      }

      return {
        translatedText,
        detectedSourceLanguage: detectedLanguage,
        service: serviceName.toLowerCase()
      }
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error(i18n.t('errors.translate.invalidApiKey'))
      } else if (error.response?.status === 429) {
        throw new Error(i18n.t('errors.translate.rateLimited'))
      } else if (error.response?.status === 403) {
        throw new Error(i18n.t('errors.translate.accessDenied'))
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error(i18n.t('errors.translate.networkError'))
      } else {
        throw new Error(`${serviceName}${i18n.t('errors.translate.apiError')}: ${error.response?.data?.error?.message || error.message}`)
      }
    }
  }

  getLanguageName(code) {
    const langMap = {
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
    return langMap[code] || code
  }

  getSupportedLanguages() {
    return [
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
  }
}

export const translateService = new TranslateService()