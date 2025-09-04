import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { translateService } from '../services/translateService'
import { useLanguageDetection } from './useLanguageDetection'
import { useTTS } from './useTTS'

export function useTextTranslation(serviceConfig) {
  const { t } = useTranslation()
  const {
    speak,
    stop,
    isSpeaking,
    isPaused,
    canSpeak,
    isSupported: ttsSupported,
    detectTextLanguage
  } = useTTS()
  const { getSmartTargetLanguage, updateLanguageFromDetection } = useLanguageDetection()

  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('zh-CN')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [detectedLanguage, setDetectedLanguage] = useState('')
  const [isTableFormatting, setIsTableFormatting] = useState(false)

  const autoSwitchLang = serviceConfig.autoSwitchLang !== false
  const autoTranslate = serviceConfig.autoTranslate !== false
  const autoTranslateRef = useRef(null)

  const handleTranslate = useCallback(async (isAutoTranslate = false) => {
    if (!inputText.trim()) return

    const actualTargetLang = getSmartTargetLanguage(inputText, targetLang, sourceLang, autoSwitchLang)

    setIsLoading(true)
    setError('')

    try {
      const result = await translateService.translate(
        inputText,
        sourceLang,
        actualTargetLang,
        serviceConfig
      )
      setOutputText(result.translatedText)

      if (isAutoTranslate) {
        console.log('自动翻译完成:', inputText.substring(0, 20) + '...')
      }

      if (result.detectedSourceLanguage) {
        setDetectedLanguage(result.detectedSourceLanguage)

        if (autoSwitchLang && sourceLang === 'auto') {
          const newTargetLang = updateLanguageFromDetection(
            result.detectedSourceLanguage,
            targetLang,
            autoSwitchLang
          )
          if (newTargetLang !== targetLang) {
            setTargetLang(newTargetLang)
          }
        }

        if (sourceLang === 'auto') {
          setSourceLang(result.detectedSourceLanguage)
        }
      }
    } catch (error) {
      console.error('Translation error:', error)
      let errorMessage = error.message

      if (error.message.includes(t('errors.translate.apiKeyRequired'))) {
        errorMessage = t('messages.apiKeyRequired')
      }

      setError(errorMessage)
      setOutputText('')
    } finally {
      setIsLoading(false)
    }
  }, [inputText, targetLang, sourceLang, autoSwitchLang, serviceConfig, getSmartTargetLanguage, updateLanguageFromDetection, t])

  const triggerAutoTranslate = useCallback((isLanguageChange = false) => {
    if (!autoTranslate || !inputText.trim()) return

    if (autoTranslateRef.current) {
      clearTimeout(autoTranslateRef.current)
    }

    const delay = isLanguageChange ? 0 : 2000
    autoTranslateRef.current = setTimeout(() => {
      handleTranslate(true)
    }, delay)
  }, [autoTranslate, inputText, handleTranslate])

  const prevLanguageRef = useRef({ sourceLang, targetLang })

  useEffect(() => {
    const prevLanguage = prevLanguageRef.current
    const isLanguageChange = prevLanguage.sourceLang !== sourceLang || prevLanguage.targetLang !== targetLang

    prevLanguageRef.current = { sourceLang, targetLang }

    triggerAutoTranslate(isLanguageChange)

    return () => {
      if (autoTranslateRef.current) {
        clearTimeout(autoTranslateRef.current)
      }
    }
  }, [inputText, autoTranslate, sourceLang, targetLang, triggerAutoTranslate])

  const swapLanguages = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang)
      setTargetLang(sourceLang)
      setInputText(outputText)
      setOutputText(inputText)
    }
  }

  const handleSpeak = async (text, language = null) => {
    if (!text || !text.trim()) return

    try {
      if (isSpeaking || isPaused) {
        stop()
        return
      }

      let speakLang = language
      if (!speakLang) {
        speakLang = detectTextLanguage(text)
      }

      await speak(text, { language: speakLang })
    } catch (error) {
      console.error('TTS错误:', error)
      setError(`朗读失败: ${error.message}`)
    }
  }

  const handleSpeakInput = () => {
    const lang = sourceLang === 'auto' ? detectedLanguage || sourceLang : sourceLang
    handleSpeak(inputText, lang)
  }

  const handleSpeakOutput = () => {
    handleSpeak(outputText, targetLang)
  }

  const handleTableFormat = async () => {
    if (!outputText.trim()) return

    setIsTableFormatting(true)
    setError('')

    try {
      const result = await translateService.formatToTable(outputText, serviceConfig)
      setOutputText(result.formattedText)
    } catch (error) {
      console.error('Table format error:', error)
      let errorMessage = error.message

      if (error.message.includes(t('errors.tableFormat.apiKeyRequired'))) {
        errorMessage = t('messages.apiKeyRequired')
      }

      setError(errorMessage)
    } finally {
      setIsTableFormatting(false)
    }
  }

  return {
    // state
    inputText,
    outputText,
    sourceLang,
    targetLang,
    isLoading,
    error,
    detectedLanguage,
    isTableFormatting,
    // setters
    setInputText,
    setSourceLang,
    setTargetLang,
    setOutputText,
    // actions
    handleTranslate,
    handleTableFormat,
    swapLanguages,
    // tts
    handleSpeakInput,
    handleSpeakOutput,
    isSpeaking,
    isPaused,
    canSpeak,
    ttsSupported
  }
}


