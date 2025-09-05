import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { translateService } from '../services/translateService'
import { useLanguageDetection } from './useLanguageDetection'
import { useSpeakHandlers } from './useSpeakHandlers'
import { useTableFormat } from './useTableFormat'

export function useImageTranslation(serviceConfig) {
  const { t } = useTranslation()
  const imageUploadRef = useRef(null)
  const { getSmartTargetLanguage, updateLanguageFromDetection } = useLanguageDetection()
  const {
    handleSpeak,
    isSpeaking,
    isPaused,
    canSpeak,
    ttsSupported,
    detectTextLanguage
  } = useSpeakHandlers()

  const [recognizedText, setRecognizedText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('zh-CN')
  const [isOCRProcessing, setIsOCRProcessing] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [ocrProgress, setOcrProgress] = useState('')
  const [error, setError] = useState('')
  const [detectedLanguage, setDetectedLanguage] = useState('')
  const [hasSelectedImage, setHasSelectedImage] = useState(false)
  const { isTableFormatting, formatToTable } = useTableFormat(serviceConfig)

  const autoSwitchLang = serviceConfig.autoSwitchLang !== false

  const handleImageUpload = async (imageFile) => {
    setIsOCRProcessing(true)
    setError('')
    setRecognizedText('')
    setTranslatedText('')
    setOcrProgress(t('ocr.processing'))

    try {
      const result = await translateService.extractTextFromImage(imageFile, serviceConfig)

      const extractedText = result?.text || ''
      if (extractedText.trim()) {
        setRecognizedText(extractedText)
        setOcrProgress(t('ocr.completed'))
        setHasSelectedImage(true)

        if (autoSwitchLang && sourceLang === 'auto') {
          const newTargetLang = getSmartTargetLanguage(extractedText, targetLang, sourceLang, autoSwitchLang)
          if (newTargetLang !== targetLang) {
            setTargetLang(newTargetLang)
          }
        }
      } else {
        setError(t('ocr.noTextFound'))
      }
    } catch (error) {
      console.error('Vision Extract Error:', error)
      let errorMessage = error.message
      if (error.message.includes(t('errors.translate.apiKeyRequired'))) {
        errorMessage = t('messages.apiKeyRequired')
      }
      setError(errorMessage)
    } finally {
      setIsOCRProcessing(false)
      setTimeout(() => setOcrProgress(''), 3000)
    }
  }

  const handleOCRError = (errorMessage) => {
    setError(errorMessage)
  }

  const handleTranslate = async () => {
    if (!recognizedText.trim()) return

    const actualTargetLang = getSmartTargetLanguage(recognizedText, targetLang, sourceLang, autoSwitchLang)

    setIsTranslating(true)
    setError('')

    try {
      const result = await translateService.translate(
        recognizedText,
        sourceLang,
        actualTargetLang,
        serviceConfig
      )

      setTranslatedText(result.translatedText)

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
      setTranslatedText('')
    } finally {
      setIsTranslating(false)
    }
  }

  const swapLanguages = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang)
      setTargetLang(sourceLang)
      setRecognizedText(translatedText)
      setTranslatedText(recognizedText)
    }
  }

  const resetImageSelection = () => {
    setHasSelectedImage(false)
    setRecognizedText('')
    setTranslatedText('')
    setError('')
    setDetectedLanguage('')
  }

  const handleTextCorrected = (correctedText) => {
    setRecognizedText(correctedText)
    setTranslatedText('')
  }

  const getLanguageName = (langCode, languages) => {
    if (langCode === 'auto') {
      return t('language.detectLanguage', '检测语言')
    }
    return languages.find(lang => lang.code === langCode)?.name || langCode
  }

  // TTS 相关由通用 hook 提供的 handleSpeak 实现

  const handleSpeakInput = () => {
    const lang = sourceLang === 'auto' ? detectedLanguage || sourceLang : sourceLang
    handleSpeak(recognizedText, lang)
  }

  const handleSpeakOutput = () => {
    handleSpeak(translatedText, targetLang)
  }

  // 表格化格式
  const handleTableFormat = async () => {
    if (!translatedText.trim()) return
    setError('')
    try {
      const result = await formatToTable(translatedText)
      if (result?.formattedText) {
        setTranslatedText(result.formattedText)
      }
    } catch (error) {
      console.error('Table format error:', error)
      let errorMessage = error.message
      if (error.message.includes(t('errors.tableFormat.apiKeyRequired'))) {
        errorMessage = t('messages.apiKeyRequired')
      }
      setError(errorMessage)
    }
  }

  return {
    imageUploadRef,
    recognizedText,
    translatedText,
    sourceLang,
    targetLang,
    isOCRProcessing,
    isTranslating,
    ocrProgress,
    error,
    detectedLanguage,
    hasSelectedImage,
    setSourceLang,
    setTargetLang,
    setRecognizedText,
    setTranslatedText,
    handleImageUpload,
    handleOCRError,
    handleTranslate,
    swapLanguages,
    resetImageSelection,
    handleTextCorrected,
    getLanguageName,
    // tts
    handleSpeakInput,
    handleSpeakOutput,
    isSpeaking,
    isPaused,
    canSpeak,
    ttsSupported,
    // table format
    isTableFormatting,
    handleTableFormat
  }
}


