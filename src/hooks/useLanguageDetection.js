import { useCallback } from 'react'

/**
 * 智能语言检测和切换的自定义Hook
 * 封装了中文字符检测、语言预判和智能切换逻辑
 */
export const useLanguageDetection = () => {
  // 检测文本中中文字符的比例
  const detectChineseRatio = useCallback((text) => {
    if (!text || text.trim().length === 0) return 0
    
    const chineseRegex = /[\u4e00-\u9fff]/g
    const chineseMatches = text.match(chineseRegex) || []
    const totalChars = text.replace(/\s/g, '').length // 排除空格
    
    return totalChars > 0 ? chineseMatches.length / totalChars : 0
  }, [])

  // 预判断源语言类型，用于智能切换
  const predictSourceLanguage = useCallback((text) => {
    const chineseRatio = detectChineseRatio(text)
    
    // 如果中文字符比例超过30%，认为是中文文本
    if (chineseRatio > 0.3) {
      return 'zh'
    }
    
    // 否则假设为英文（在auto模式下让API自己检测）
    return 'en'
  }, [detectChineseRatio])

  // 智能语言切换逻辑
  const getSmartTargetLanguage = useCallback((inputText, currentTargetLang, sourceLang, autoSwitchEnabled) => {
    if (!autoSwitchEnabled || sourceLang !== 'auto') {
      return currentTargetLang
    }

    const predictedLang = predictSourceLanguage(inputText)
    
    // 预测是中文，目标语言应该是英文
    if (predictedLang === 'zh' && currentTargetLang !== 'en') {
      return 'en'
    }
    // 预测是英文，目标语言应该是中文
    else if (predictedLang === 'en' && currentTargetLang !== 'zh-CN') {
      return 'zh-CN'
    }
    
    return currentTargetLang
  }, [predictSourceLanguage])

  // 根据检测到的语言更新UI状态
  const updateLanguageFromDetection = useCallback((detectedLanguage, currentTargetLang, autoSwitchEnabled) => {
    if (!autoSwitchEnabled) {
      return currentTargetLang
    }

    const detected = detectedLanguage.toLowerCase()
    
    // 检测到中文，确保UI显示目标语言为英文
    if (detected === 'zh' || detected === 'zh-cn' || detected === 'zh-tw') {
      return currentTargetLang !== 'en' ? 'en' : currentTargetLang
    }
    // 检测到英文，确保UI显示目标语言为中文  
    else if (detected === 'en') {
      return currentTargetLang !== 'zh-CN' ? 'zh-CN' : currentTargetLang
    }
    
    return currentTargetLang
  }, [])

  return {
    detectChineseRatio,
    predictSourceLanguage,
    getSmartTargetLanguage,
    updateLanguageFromDetection
  }
}