import { useState, useEffect, useCallback, useRef } from 'react'
import { ttsService } from '../services/ttsService'

export function useTTS() {
  const [isSupported, setIsSupported] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState('')
  const [voices, setVoices] = useState([])
  const [config, setConfig] = useState(ttsService.getConfig())
  
  const statusCheckInterval = useRef(null)
  
  // 更新状态的函数
  const updateStatus = useCallback(() => {
    const status = ttsService.getStatus()
    setIsSupported(status.isSupported)
    setIsReady(status.isReady)
    setIsSpeaking(status.isSpeaking)
    setIsPaused(status.isPaused)
  }, [])
  
  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        const voiceList = await ttsService.initVoices()
        setVoices(voiceList)
        updateStatus()
      } catch (error) {
        console.error('TTS初始化失败:', error)
        setError(error.message)
      }
    }
    
    init()
    
    // 定期检查状态（用于捕获语音状态变化）
    statusCheckInterval.current = setInterval(updateStatus, 100)
    
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current)
      }
    }
  }, [updateStatus])
  
  // 朗读文本
  const speak = useCallback(async (text, options = {}) => {
    if (!isSupported) {
      throw new Error('浏览器不支持语音合成功能')
    }
    
    if (!isReady) {
      throw new Error('语音功能尚未准备就绪')
    }
    
    setError('')
    
    try {
      await ttsService.speak(text, options)
    } catch (error) {
      setError(error.message)
      throw error
    }
  }, [isSupported, isReady])
  
  // 停止朗读
  const stop = useCallback(() => {
    ttsService.stop()
    setError('')
    updateStatus()
  }, [updateStatus])
  
  // 暂停朗读
  const pause = useCallback(() => {
    ttsService.pause()
    updateStatus()
  }, [updateStatus])
  
  // 恢复朗读
  const resume = useCallback(() => {
    ttsService.resume()
    updateStatus()
  }, [updateStatus])
  
  // 更新配置
  const updateConfig = useCallback((newConfig) => {
    ttsService.updateConfig(newConfig)
    setConfig(ttsService.getConfig())
  }, [])
  
  // 重置配置
  const resetConfig = useCallback(() => {
    ttsService.resetConfig()
    setConfig(ttsService.getConfig())
  }, [])
  
  // 根据语言代码获取最佳语音
  const getBestVoiceForLanguage = useCallback((langCode) => {
    return ttsService.getBestVoiceForLanguage(langCode)
  }, [])
  
  // 检测文本语言
  const detectTextLanguage = useCallback((text) => {
    return ttsService.detectTextLanguage(text)
  }, [])
  
  return {
    // 状态
    isSupported,
    isReady,
    isSpeaking,
    isPaused,
    error,
    voices,
    config,
    
    // 操作方法
    speak,
    stop,
    pause,
    resume,
    updateConfig,
    resetConfig,
    getBestVoiceForLanguage,
    detectTextLanguage,
    
    // 便捷方法
    isActive: isSpeaking || isPaused,
    canSpeak: isSupported && isReady && !isSpeaking,
    canPause: isSupported && isReady && isSpeaking && !isPaused,
    canResume: isSupported && isReady && isPaused,
    canStop: isSupported && isReady && (isSpeaking || isPaused)
  }
}