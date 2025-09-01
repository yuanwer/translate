import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { translateService } from '../services/translateService'
import { useLanguageDetection } from '../hooks/useLanguageDetection'
import { useTTS } from '../hooks/useTTS'
import LanguageSelector from './LanguageSelector'
import TranslationPanel from './TranslationPanel'
import { StatusAlert } from '@/components/ui/status-alert'
import { Button } from '@/components/ui/button'

/**
 * 文本翻译组件
 * 从 App.jsx 中提取出来的专门处理文本翻译的组件
 */
const TextTranslation = ({ serviceConfig, languages }) => {
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

  // 文本翻译相关状态
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('zh-CN')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [detectedLanguage, setDetectedLanguage] = useState('')

  const autoSwitchLang = serviceConfig.autoSwitchLang !== false

  const handleTranslate = async () => {
    if (!inputText.trim()) return
    
    // 智能语言切换的预判断
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
      
      // 更新检测到的语言信息
      if (result.detectedSourceLanguage) {
        setDetectedLanguage(result.detectedSourceLanguage)
        
        // 智能语言切换UI状态更新
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
        
        // 如果是自动检测，更新源语言显示
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
  }

  const swapLanguages = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang)
      setTargetLang(sourceLang)
      setInputText(outputText)
      setOutputText(inputText)
    }
  }

  // 处理文本朗读
  const handleSpeak = async (text, language = null) => {
    if (!text || !text.trim()) return
    
    try {
      // 停止当前朗读
      if (isSpeaking || isPaused) {
        stop()
        return
      }
      
      // 确定语言
      let speakLang = language
      if (!speakLang) {
        speakLang = detectTextLanguage(text)
      }
      
      // 开始朗读
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
      {error && (
        <StatusAlert variant="error">
          {error}
        </StatusAlert>
      )}

      {/* 翻译面板 */}
      <TranslationPanel
        inputValue={inputText}
        onInputChange={(e) => setInputText(e.target.value)}
        inputPlaceholder={t('translation.inputPlaceholder', '输入文本')}
        inputLanguageName={getLanguageName(sourceLang)}
        inputDisabled={isLoading}
        
        outputValue={outputText}
        outputPlaceholder={isLoading ? t('translation.translating', '翻译中...') : t('translation.outputPlaceholder', '翻译结果')}
        outputLanguageName={getLanguageName(targetLang)}
        
        onSpeakInput={handleSpeakInput}
        onSpeakOutput={handleSpeakOutput}
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        canSpeak={canSpeak}
        ttsSupported={ttsSupported}
      />

      {/* 翻译按钮 */}
      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleTranslate}
          disabled={!inputText.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
        >
          {isLoading ? (
            <><i className="fas fa-spinner fa-spin mr-2"></i>{t('translation.translating', '翻译中...')}</>
          ) : (
            <><i className="fas fa-language mr-2"></i>{t('translation.translateButton', '翻译')}</>
          )}
        </Button>
      </div>
    </div>
  )
}

export default TextTranslation