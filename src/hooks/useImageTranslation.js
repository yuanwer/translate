import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { translateService } from '../services/translateService'
import { ocrService } from '../services/ocrService'
import { useLanguageDetection } from './useLanguageDetection'

export function useImageTranslation(serviceConfig) {
  const { t } = useTranslation()
  const imageUploadRef = useRef(null)
  const { getSmartTargetLanguage, updateLanguageFromDetection } = useLanguageDetection()

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

  const autoSwitchLang = serviceConfig.autoSwitchLang !== false

  const handleImageUpload = async (imageFile) => {
    setIsOCRProcessing(true)
    setError('')
    setRecognizedText('')
    setTranslatedText('')
    setOcrProgress(t('ocr.initializing'))

    try {
      const result = await ocrService.recognizeText(imageFile, {
        language: 'chi_sim+eng',
        onProgress: (progress) => {
          if (progress.status === 'loading frugally') {
            setOcrProgress(t('ocr.loadingModel'))
          } else if (progress.status === 'initializing tesseract') {
            setOcrProgress(t('ocr.initializingEngine'))
          } else if (progress.status === 'initializing api') {
            setOcrProgress(t('ocr.preparingAPI'))
          } else if (progress.status === 'recognizing text') {
            const percent = Math.round(progress.progress * 100)
            setOcrProgress(t('ocr.recognizing', { percent }))
          }
        }
      })

      if (result.text && result.text.trim()) {
        setRecognizedText(result.text)
        setOcrProgress(t('ocr.completed'))
        setHasSelectedImage(true)

        if (autoSwitchLang && sourceLang === 'auto') {
          const newTargetLang = getSmartTargetLanguage(result.text, targetLang, sourceLang, autoSwitchLang)
          if (newTargetLang !== targetLang) {
            setTargetLang(newTargetLang)
          }
        }
      } else {
        setError(t('ocr.noTextFound'))
      }
    } catch (error) {
      console.error('OCR Error:', error)
      setError(error.message)
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
    setTimeout(() => {
      imageUploadRef.current?.triggerFileSelect()
    }, 100)
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
    getLanguageName
  }
}


