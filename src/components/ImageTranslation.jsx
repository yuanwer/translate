import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { translateService } from '../services/translateService'
import { ocrService } from '../services/ocrService'
import { useLanguageDetection } from '../hooks/useLanguageDetection'
import { ImageUpload } from './ImageUpload'
import LanguageSelector from './LanguageSelector'
import TranslationPanel from './TranslationPanel'
import OCRCorrectButton from './OCRCorrectButton'
import { StatusAlert } from '@/components/ui/status-alert'
import { Button } from '@/components/ui/button'

export function ImageTranslation({ serviceConfig, languages }) {
  const { t } = useTranslation()
  const imageUploadRef = useRef(null)
  const { getSmartTargetLanguage, updateLanguageFromDetection } = useLanguageDetection()
  
  // 图片翻译专用状态
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

  // 处理图片上传和OCR识别
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
        
        // 智能语言切换
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

  // 处理OCR错误
  const handleOCRError = (errorMessage) => {
    setError(errorMessage)
  }

  // 翻译识别出的文本
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

  // 语言交换
  const swapLanguages = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang)
      setTargetLang(sourceLang)
      setRecognizedText(translatedText)
      setTranslatedText(recognizedText)
    }
  }

  // 重置图片选择
  const resetImageSelection = () => {
    setHasSelectedImage(false)
    setRecognizedText('')
    setTranslatedText('')
    setError('')
    setDetectedLanguage('')
    // 直接触发文件选择器弹出
    setTimeout(() => {
      imageUploadRef.current?.triggerFileSelect()
    }, 100) // 添加小延迟确保状态更新完成
  }

  // 处理OCR文字修正
  const handleTextCorrected = (correctedText, corrections) => {
    setRecognizedText(correctedText)
    setTranslatedText('') // 清空已有的翻译结果，因为原文已改变
    // 可以在这里添加修正历史记录
    console.log('Applied corrections:', corrections)
  }

  // 获取语言名称
  const getLanguageName = (langCode) => {
    if (langCode === 'auto') {
      return t('language.detectLanguage', '检测语言')
    }
    return languages.find(lang => lang.code === langCode)?.name || langCode
  }

  return (
    <div className="space-y-6">
      {/* 语言选择区域 */}
      <LanguageSelector
        languages={languages}
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceLangChange={setSourceLang}
        onTargetLangChange={setTargetLang}
        onSwapLanguages={swapLanguages}
        detectedLanguage={detectedLanguage}
      />

      {/* 状态提示区域 */}
      {ocrProgress && (
        <StatusAlert variant="loading">
          {ocrProgress}
        </StatusAlert>
      )}
      {error && (
        <StatusAlert variant="error">
          {error}
        </StatusAlert>
      )}

      {/* 图片上传区域 - 只在未选择图片时显示 */}
      {!hasSelectedImage && (
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="p-6">
            <ImageUpload
              ref={imageUploadRef}
              onImageUpload={handleImageUpload}
              onError={handleOCRError}
              isProcessing={isOCRProcessing}
              onReset={resetImageSelection}
            />
          </div>
        </div>
      )}

      {/* OCR识别结果和翻译区域 */}
      {recognizedText && (
        <TranslationPanel
          inputValue={recognizedText}
          onInputChange={(e) => setRecognizedText(e.target.value)}
          inputPlaceholder={t('ocr.recognizedText')}
          inputLanguageName={getLanguageName(sourceLang)}
          inputReadOnly={false}
          
          outputValue={translatedText}
          outputPlaceholder={isTranslating ? t('translation.translating', '翻译中...') : t('translation.outputPlaceholder', '翻译结果')}
          outputLanguageName={getLanguageName(targetLang)}
          
          extraInputButtons={[
            <OCRCorrectButton
              key="ocr-correct"
              recognizedText={recognizedText}
              onTextCorrected={handleTextCorrected}
              serviceConfig={serviceConfig}
              disabled={isTranslating}
            />
          ]}
        />
      )}

      {/* 翻译按钮和重新选择按钮 */}
      {recognizedText && (
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleTranslate}
            disabled={!recognizedText.trim() || isTranslating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
          >
            {isTranslating ? (
              <><i className="fas fa-spinner fa-spin mr-2"></i>{t('translation.translating', '翻译中...')}</>
            ) : (
              <><i className="fas fa-language mr-2"></i>{t('translation.translateButton', '翻译')}</>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={resetImageSelection}
            className="px-6 py-3 rounded-full"
          >
            <i className="fas fa-image mr-2"></i>{t('ocr.reselectImage')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ImageTranslation