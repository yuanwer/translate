import { createWorker } from 'tesseract.js'

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

    // CDN降级配置列表，优先使用国内可访问的CDN
    const cdnConfigs = [
      {
        name: 'UNPKG镜像',
        workerPath: 'https://unpkg.com/tesseract.js@5/dist/worker.min.js',
        langPath: 'https://unpkg.com/tessdata@4',
        corePath: 'https://unpkg.com/tesseract.js-core@5/tesseract-core.wasm.js'
      },
      {
        name: '七牛云CDN',
        workerPath: 'https://cdn.staticfile.org/tesseract.js/5.0.0/worker.min.js',
        langPath: 'https://cdn.staticfile.org/tessdata/4.0.0',
        corePath: 'https://cdn.staticfile.org/tesseract.js-core/5.0.0/tesseract-core.wasm.js'
      },
      {
        name: '默认CDN',
        // 不设置CDN路径，使用默认配置
        workerPath: undefined,
        langPath: undefined,
        corePath: undefined
      }
    ]

    let lastError = null

    for (const config of cdnConfigs) {
      try {
        console.log(`尝试使用${config.name}初始化OCR...`)
        
        const workerOptions = {
          logger: m => {
            if (this.onProgress) {
              this.onProgress(m)
            }
          }
        }

        // 只有在配置了CDN路径时才添加到选项中
        if (config.workerPath) workerOptions.workerPath = config.workerPath
        if (config.langPath) workerOptions.langPath = config.langPath
        if (config.corePath) workerOptions.corePath = config.corePath

        this.worker = await createWorker(language, 1, workerOptions)
        this.isInitialized = true
        console.log(`OCR初始化成功，使用${config.name}`)
        return this.worker

      } catch (error) {
        console.warn(`${config.name}初始化失败:`, error.message)
        lastError = error
        continue
      }
    }

    throw new Error(`OCR初始化失败，所有CDN都无法访问: ${lastError?.message}`)
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
      throw new Error(`文字识别失败: ${error.message}`)
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
      console.log('开始OCR预热...')
      await this.initializeWorker(language)
      console.log('OCR预热完成')
    } catch (error) {
      console.warn('OCR预热失败，将在实际使用时初始化:', error.message)
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
      throw new Error('不支持的图片格式。请使用 JPG、PNG 或 WEBP 格式。')
    }

    if (file.size > maxSize) {
      throw new Error('图片文件过大。请选择小于 10MB 的图片。')
    }

    return true
  }
}

export const ocrService = new OCRService()