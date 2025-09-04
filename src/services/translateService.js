import i18n from '../i18n'
import { translate as aiTranslate, formatToTable as aiFormatToTable, extractTextFromImage as aiExtractTextFromImage } from './providers/aiChatProvider'
import { convertToChromeLanguageCode, getLanguageName, SUPPORTED_LANGUAGES } from '../lib/language'

export class TranslateService {
  constructor() {
    this.aiService = new AITranslateService()
  }

  async translate(text, sourceLang, targetLang, config = {}) {
    return await this.aiService.translate(text, sourceLang, targetLang, config)
  }

  async formatToTable(text, config = {}) {
    return await this.aiService.formatToTable(text, config)
  }

  getSupportedLanguages() {
    return this.aiService.getSupportedLanguages()
  }

  async extractTextFromImage(image, config = {}) {
    return await this.aiService.extractTextFromImage(image, config)
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
      serviceName = this.defaultConfig.serviceName,
      enableWebSearch = false
    } = config

    // Chrome AI特殊处理
    if (serviceName === 'Chrome Built-in AI' || url === 'chrome://ai-translate') {
      return await this.translateWithChromeAI(text, sourceLang, targetLang)
    }

    return await aiTranslate(text, sourceLang, targetLang, {
      url,
      model,
      apiKey,
      serviceName,
      enableWebSearch
    })
  }

  async translateWithChromeAI(text, sourceLang, targetLang) {
    try {
      // 检查Chrome AI是否可用
      if (!window.ai || !window.ai.translator) {
        throw new Error(i18n.t('errors.translate.chromeAiNotAvailable'))
      }

      // 语言代码转换 (Chrome AI使用ISO 639-1标准)
      const chromeSourceLang = convertToChromeLanguageCode(sourceLang)
      const chromeTargetLang = convertToChromeLanguageCode(targetLang)

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

  getLanguageName(code) {
    return getLanguageName(code)
  }

  async formatToTable(text, config) {
    const {
      url = this.defaultConfig.url,
      model = this.defaultConfig.model,
      apiKey,
      serviceName = this.defaultConfig.serviceName
    } = config

    return await aiFormatToTable(text, {
      url,
      model,
      apiKey,
      serviceName
    })
  }

  async extractTextFromImage(image, config) {
    const {
      url = this.defaultConfig.url,
      model = this.defaultConfig.model,
      visionModel = '',
      apiKey,
      serviceName = this.defaultConfig.serviceName
    } = config

    return await aiExtractTextFromImage(image, {
      url,
      model,
      visionModel,
      apiKey,
      serviceName
    })
  }

  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES
  }
}

export const translateService = new TranslateService()