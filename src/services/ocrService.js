import { createWorker } from 'tesseract.js'
import i18n from '../i18n'

export class OCRService {
  constructor() {
    this.worker = null
    this.isInitialized = false
    this.isPreWarming = false
    this.preWarmError = null
  }

  async initializeWorker(language = 'chi_sim+eng') {
    if (this.isInitialized && this.worker) {
      return this.worker
    }

    try {
      console.log(i18n.t('console.ocr.init'))
      
      const workerOptions = {
        logger: m => {
          if (this.onProgress) {
            this.onProgress(m)
          }
        }
      }

      this.worker = await createWorker(language, 1, workerOptions)
      this.isInitialized = true
      console.log(i18n.t('console.ocr.initSuccess'))
      return this.worker

    } catch (error) {
      throw new Error(`${i18n.t('errors.ocr.initFailed')}: ${error.message}`)
    }
  }

  async recognizeText(imageFile, options = {}) {
    const {
      language = 'chi_sim+eng',
      onProgress = null
    } = options

    this.onProgress = onProgress

    try {
      const worker = await this.initializeWorker(language)
      
      const { data } = await worker.recognize(imageFile)
      
      return {
        text: data.text.trim(),
        confidence: data.confidence,
        words: data.words,
        paragraphs: data.paragraphs
      }
    } catch (error) {
      throw new Error(`${i18n.t('errors.ocr.recognitionFailed')}: ${error.message}`)
    }
  }

  // 静默预热OCR，在后台初始化但不显示进度
  async preWarm(language = 'chi_sim+eng') {
    if (this.isInitialized || this.isPreWarming) {
      return
    }
    
    this.isPreWarming = true
    this.preWarmError = null
    
    try {
      console.log(i18n.t('console.ocr.prewarming'))
      await this.initializeWorker(language)
      console.log(i18n.t('console.ocr.prewarmComplete'))
    } catch (error) {
      console.warn(`${i18n.t('errors.ocr.initFailed').replace('，所有CDN都无法访问', '')}，将在实际使用时初始化:`, error.message)
      this.preWarmError = error
    } finally {
      this.isPreWarming = false
    }
  }

  // 获取预热状态
  getPreWarmStatus() {
    return {
      isPreWarming: this.isPreWarming,
      isReady: this.isInitialized,
      hasError: !!this.preWarmError
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
      this.isInitialized = false
      this.isPreWarming = false
      this.preWarmError = null
    }
  }

  getSupportedLanguages() {
    return [
      { code: 'chi_sim+eng', name: '中英混合' },
      { code: 'chi_sim', name: '简体中文' },
      { code: 'chi_tra', name: '繁体中文' },
      { code: 'eng', name: 'English' },
      { code: 'jpn', name: '日本語' },
      { code: 'kor', name: '한국어' },
      { code: 'fra', name: 'Français' },
      { code: 'deu', name: 'Deutsch' },
      { code: 'spa', name: 'Español' },
      { code: 'rus', name: 'Русский' },
      { code: 'ara', name: 'العربية' },
      { code: 'hin', name: 'हिन्दी' },
      { code: 'por', name: 'Português' },
      { code: 'ita', name: 'Italiano' },
      { code: 'tha', name: 'ไทย' },
      { code: 'vie', name: 'Tiếng Việt' }
    ]
  }

  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(i18n.t('errors.ocr.unsupportedFormat'))
    }

    if (file.size > maxSize) {
      throw new Error('图片文件过大。请选择小于 10MB 的图片。')
    }

    return true
  }
}

export const ocrService = new OCRService()