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
    
    // Chrome AI特殊处理
    if (serviceName === 'Chrome Built-in AI' || url === 'chrome://ai-translate') {
      return await this.translateWithChromeAI(text, sourceLang, targetLang)
    }
    
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

  async translateWithChromeAI(text, sourceLang, targetLang) {
    try {
      // 检查Chrome AI是否可用
      if (!window.ai || !window.ai.translator) {
        throw new Error(i18n.t('errors.translate.chromeAiNotAvailable'))
      }

      // 语言代码转换 (Chrome AI使用ISO 639-1标准)
      const chromeSourceLang = this.convertToChromeLanguageCode(sourceLang)
      const chromeTargetLang = this.convertToChromeLanguageCode(targetLang)

      // 检查语言对是否支持
      const canTranslate = await window.ai.translator.canTranslate({
        sourceLanguage: chromeSourceLang,
        targetLanguage: chromeTargetLang
      })

      if (canTranslate === 'no') {
        throw new Error(i18n.t('errors.translate.languagePairNotSupported'))
      }

      // 创建翻译器实例
      const translator = await window.ai.translator.create({
        sourceLanguage: chromeSourceLang,
        targetLanguage: chromeTargetLang
      })

      // 如果需要下载模型
      if (canTranslate === 'after-download') {
        // 这里可以添加下载进度提示
        console.log('Downloading translation model...')
      }

      // 执行翻译
      const translatedText = await translator.translate(text)
      
      // 清理资源
      translator.destroy()

      return {
        translatedText,
        detectedSourceLanguage: chromeSourceLang,
        service: 'chrome-ai'
      }
    } catch (error) {
      if (error.message.includes('not available')) {
        throw new Error(i18n.t('errors.translate.chromeAiNotAvailable'))
      }
      throw new Error(`Chrome AI ${i18n.t('errors.translate.apiError')}: ${error.message}`)
    }
  }

  convertToChromeLanguageCode(code) {
    // 将应用的语言代码转换为Chrome AI支持的语言代码
    const conversionMap = {
      'auto': 'auto', // Chrome AI可能会自动检测
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
    return conversionMap[code] || code.split('-')[0] // 如果没找到映射，使用语言代码的主要部分
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