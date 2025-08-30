import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { translateService } from '../services/translateService'
import { ocrService } from '../services/ocrService'
import { ImageUpload } from './ImageUpload'
import LanguageTabs from './LanguageTabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ImageTranslation({ serviceConfig, languages }) {
  const { t } = useTranslation()
  const imageUploadRef = useRef(null)
  
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

  // 检测文本中中文字符的比例
  const detectChineseRatio = (text) => {
    if (!text || text.trim().length === 0) return 0
    
    const chineseRegex = /[\u4e00-\u9fff]/g
    const chineseMatches = text.match(chineseRegex) || []
    const totalChars = text.replace(/\s/g, '').length
    
    return totalChars > 0 ? chineseMatches.length / totalChars : 0
  }

  // 智能语言切换预判
  const predictSourceLanguage = (text) => {
    const chineseRatio = detectChineseRatio(text)
    return chineseRatio > 0.3 ? 'zh' : 'en'
  }

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
        const autoSwitchLang = serviceConfig.autoSwitchLang !== false
        if (autoSwitchLang && sourceLang === 'auto') {
          const predictedLang = predictSourceLanguage(result.text)
          if (predictedLang === 'zh' && targetLang !== 'en') {
            setTargetLang('en')
          } else if (predictedLang === 'en' && targetLang !== 'zh-CN') {
            setTargetLang('zh-CN')
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
    
    let actualTargetLang = targetLang
    const autoSwitchLang = serviceConfig.autoSwitchLang !== false
    
    if (autoSwitchLang && sourceLang === 'auto') {
      const predictedLang = predictSourceLanguage(recognizedText)
      if (predictedLang === 'zh' && targetLang !== 'en') {
        actualTargetLang = 'en'
      } else if (predictedLang === 'en' && targetLang !== 'zh-CN') {
        actualTargetLang = 'zh-CN'
      }
    }
    
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
          const detected = result.detectedSourceLanguage.toLowerCase()
          
          if (detected === 'zh' || detected === 'zh-cn' || detected === 'zh-tw') {
            if (targetLang !== 'en') {
              setTargetLang('en')
            }
          } else if (detected === 'en') {
            if (targetLang !== 'zh-CN') {
              setTargetLang('zh-CN')
            }
          }
        }
        
        if (sourceLang === 'auto') {
          setSourceLang(result.detectedSourceLanguage)
        }
      }
    } catch (error) {
      console.error('Translation error:', error)
      let errorMessage = error.message
      
      if (error.message.includes('AI翻译需要配置API密钥')) {
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

  return (
    <div className="space-y-6">
      {/* 语言选择区域 */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* 源语言标签区域 */}
          <div className="flex-1 min-w-0">
            <LanguageTabs
              languages={languages}
              selectedLanguage={sourceLang}
              onLanguageChange={setSourceLang}
              isSource={true}
              className="h-12"
            />
          </div>
          
          {/* 语言交换按钮 */}
          <div className="flex items-center justify-center px-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={swapLanguages}
              disabled={sourceLang === 'auto'}
              className="w-10 h-10 rounded-full disabled:opacity-50 text-gray-600 hover:bg-gray-100"
              title={t('language.swap')}
            >
              <i className="fas fa-exchange-alt"></i>
            </Button>
          </div>
          
          {/* 目标语言标签区域 */}
          <div className="flex-1 min-w-0">
            <LanguageTabs
              languages={languages.filter(lang => lang.code !== 'auto')}
              selectedLanguage={targetLang}
              onLanguageChange={setTargetLang}
              isSource={false}
              className="h-12"
            />
          </div>
        </div>
      </div>

      {/* 状态提示区域 */}
      {(ocrProgress || error) && (
        <div>
          {ocrProgress && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-2">
              <div className="flex items-center">
                <i className="fas fa-spinner fa-spin text-blue-600 mr-2"></i>
                <span className="text-blue-800 text-sm">{ocrProgress}</span>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>
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
        <div className="grid lg:grid-cols-2 gap-0 border border-gray-300 rounded-lg overflow-hidden">
          {/* 左侧识别结果 */}
          <div className="bg-white relative">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 uppercase">
                  {sourceLang === 'auto' ? t('language.detectLanguage', '检测语言') : (languages.find(lang => lang.code === sourceLang)?.name || sourceLang)}
                </span>
                {detectedLanguage && sourceLang === 'auto' && (
                  <span className="text-xs text-blue-600">
                    {t('language.detected')}: {languages.find(lang => lang.code === detectedLanguage)?.name || detectedLanguage}
                  </span>
                )}
              </div>
              <Textarea
                value={recognizedText}
                onChange={(e) => setRecognizedText(e.target.value)}
                className="min-h-[300px] resize-none border-0"
                placeholder={t('ocr.recognizedText', '识别出的文本')}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{recognizedText.length} 字符</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard?.writeText(recognizedText)}
                    className="text-gray-500 hover:text-gray-700"
                    title="复制识别结果"
                  >
                    <i className="fas fa-copy text-xs"></i>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧翻译结果 */}
          <div className="bg-gray-50 border-l border-gray-300 relative">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 uppercase">
                  {languages.find(lang => lang.code === targetLang)?.name || targetLang}
                </span>
                {translatedText && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard?.writeText(translatedText)}
                      className="text-gray-500 hover:text-gray-700"
                      title="复制翻译结果"
                    >
                      <i className="fas fa-copy text-xs"></i>
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                value={translatedText}
                readOnly
                placeholder={isTranslating ? t('translation.translating', '翻译中...') : t('translation.outputPlaceholder', '翻译结果')}
                className="min-h-[300px] resize-none border-0 bg-transparent text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
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
            <i className="fas fa-image mr-2"></i>重新选择图片
          </Button>
        </div>
      )}
    </div>
  )
}

export default ImageTranslation