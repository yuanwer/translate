// 文本转语音服务
import i18n from '../i18n'
export class TTSService {
  constructor() {
    this.synthesis = window.speechSynthesis
    this.currentUtterance = null
    this.voices = []
    this.isSupported = 'speechSynthesis' in window
    this.isReady = false
    
    // 默认配置
    this.defaultConfig = {
      rate: 1.0,        // 语速 (0.1 - 10)
      pitch: 1.0,       // 音调 (0 - 2)
      volume: 1.0,      // 音量 (0 - 1)
      voiceIndex: -1,   // 语音索引 (-1表示使用默认语音)
      autoDetectLang: true // 是否自动检测语言
    }
    
    this.config = { ...this.defaultConfig }
    this.loadConfig()
    this.initVoices()
  }
  
  // 初始化语音列表
  async initVoices() {
    if (!this.isSupported) {
      console.warn(`TTS: ${i18n.t('console.tts.notSupported')}`)
      return
    }
    
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synthesis.getVoices()
        this.isReady = this.voices.length > 0
        resolve(this.voices)
      }
      
      // 某些浏览器需要等待 voiceschanged 事件
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = loadVoices
      }
      
      // 立即尝试获取语音列表
      loadVoices()
    })
  }
  
  // 获取支持的语音列表
  getVoices() {
    return this.voices
  }
  
  // 根据语言代码获取最佳语音
  getBestVoiceForLanguage(langCode) {
    if (!langCode || this.voices.length === 0) {
      return null
    }
    
    // 语言代码映射
    const langMap = {
      'zh': 'zh-CN',
      'zh-CN': 'zh-CN',
      'zh-TW': 'zh-TW',
      'en': 'en-US',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'es': 'es-ES',
      'ru': 'ru-RU',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'pt': 'pt-BR',
      'it': 'it-IT',
      'th': 'th-TH',
      'vi': 'vi-VN'
    }
    
    const targetLang = langMap[langCode] || langCode
    
    // 查找精确匹配的语音
    let voice = this.voices.find(voice => voice.lang === targetLang)
    
    // 如果没有精确匹配，尝试语言前缀匹配
    if (!voice) {
      const langPrefix = targetLang.split('-')[0]
      voice = this.voices.find(voice => voice.lang.startsWith(langPrefix))
    }
    
    // 如果还是没有找到，尝试查找包含目标语言的语音
    if (!voice) {
      voice = this.voices.find(voice => 
        voice.lang.toLowerCase().includes(langCode.toLowerCase()) ||
        voice.name.toLowerCase().includes(langCode.toLowerCase())
      )
    }
    
    return voice
  }
  
  // 检测文本语言
  detectTextLanguage(text) {
    if (!text || text.trim().length === 0) {
      return 'en'
    }
    
    // 中文字符检测
    const chineseRegex = /[\u4e00-\u9fff]/g
    const chineseMatches = text.match(chineseRegex) || []
    const chineseRatio = chineseMatches.length / text.replace(/\s/g, '').length
    
    if (chineseRatio > 0.3) {
      // 进一步判断是简体还是繁体中文
      const traditionalChars = /[繁體傳統]/g
      if (traditionalChars.test(text)) {
        return 'zh-TW'
      }
      return 'zh-CN'
    }
    
    // 日文检测
    const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/g
    if (japaneseRegex.test(text)) {
      return 'ja'
    }
    
    // 韩文检测
    const koreanRegex = /[\uac00-\ud7af]/g
    if (koreanRegex.test(text)) {
      return 'ko'
    }
    
    // 阿拉伯文检测
    const arabicRegex = /[\u0600-\u06ff]/g
    if (arabicRegex.test(text)) {
      return 'ar'
    }
    
    // 默认返回英文
    return 'en'
  }
  
  // 朗读文本
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error(i18n.t('errors.tts.notSupported')))
        return
      }
      
      if (!text || text.trim().length === 0) {
        reject(new Error(i18n.t('errors.tts.emptyText')))
        return
      }
      
      // 停止当前朗读
      this.stop()
      
      // 创建语音合成实例
      const utterance = new SpeechSynthesisUtterance(text)
      
      // 应用配置
      const config = { ...this.config, ...options }
      utterance.rate = Math.max(0.1, Math.min(10, config.rate))
      utterance.pitch = Math.max(0, Math.min(2, config.pitch))
      utterance.volume = Math.max(0, Math.min(1, config.volume))
      
      // 选择语音
      let selectedVoice = null
      
      if (config.voiceIndex >= 0 && config.voiceIndex < this.voices.length) {
        // 使用指定的语音
        selectedVoice = this.voices[config.voiceIndex]
      } else if (config.autoDetectLang) {
        // 自动检测语言并选择语音
        const detectedLang = options.language || this.detectTextLanguage(text)
        selectedVoice = this.getBestVoiceForLanguage(detectedLang)
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
        utterance.lang = selectedVoice.lang
      }
      
      // 设置事件监听器
      utterance.onstart = () => {
        console.log(`TTS: ${i18n.t('console.tts.starting')}`)
      }
      
      utterance.onend = () => {
        console.log(`TTS: ${i18n.t('console.tts.ended')}`)
        this.currentUtterance = null
        resolve()
      }
      
      utterance.onerror = (event) => {
        console.error('TTS错误:', event)
        this.currentUtterance = null
        reject(new Error(`${i18n.t('errors.tts.synthesisError')}: ${event.error}`))
      }
      
      utterance.onpause = () => {
        console.log(`TTS: ${i18n.t('console.tts.paused')}`)
      }
      
      utterance.onresume = () => {
        console.log(`TTS: ${i18n.t('console.tts.resumed')}`)
      }
      
      // 保存当前实例
      this.currentUtterance = utterance
      
      // 开始朗读
      this.synthesis.speak(utterance)
    })
  }
  
  // 停止朗读
  stop() {
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel()
    }
    this.currentUtterance = null
  }
  
  // 暂停朗读
  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause()
    }
  }
  
  // 恢复朗读
  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume()
    }
  }
  
  // 获取当前状态
  getStatus() {
    return {
      isSupported: this.isSupported,
      isReady: this.isReady,
      isSpeaking: this.synthesis.speaking,
      isPaused: this.synthesis.paused,
      isPending: this.synthesis.pending,
      voicesCount: this.voices.length
    }
  }
  
  // 更新配置
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
  }
  
  // 重置配置为默认值
  resetConfig() {
    this.config = { ...this.defaultConfig }
    this.saveConfig()
  }
  
  // 保存配置到本地存储
  saveConfig() {
    try {
      localStorage.setItem('ttsConfig', JSON.stringify(this.config))
    } catch (error) {
      console.error('保存TTS配置失败:', error)
    }
  }
  
  // 从本地存储加载配置
  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('ttsConfig')
      if (savedConfig) {
        this.config = { ...this.defaultConfig, ...JSON.parse(savedConfig) }
      }
    } catch (error) {
      console.error('加载TTS配置失败:', error)
      this.config = { ...this.defaultConfig }
    }
  }
  
  // 获取当前配置
  getConfig() {
    return { ...this.config }
  }
}

// 创建单例实例
export const ttsService = new TTSService()