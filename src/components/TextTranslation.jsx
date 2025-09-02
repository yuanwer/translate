import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [isTableFormatting, setIsTableFormatting] = useState(false)

  const autoSwitchLang = serviceConfig.autoSwitchLang !== false
  const autoTranslate = serviceConfig.autoTranslate !== false // 自动翻译开关，默认开启
  const autoTranslateRef = useRef(null) // 防抖定时器引用

  const handleTranslate = useCallback(async (isAutoTranslate = false) => {
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
      
      // 如果是自动翻译，在控制台记录
      if (isAutoTranslate) {
        console.log('自动翻译完成:', inputText.substring(0, 20) + '...')
      }
      
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
  }, [inputText, targetLang, sourceLang, autoSwitchLang, serviceConfig, getSmartTargetLanguage, updateLanguageFromDetection, t])

  // 自动翻译防抖函数
  const triggerAutoTranslate = useCallback((isLanguageChange = false) => {
    if (!autoTranslate || !inputText.trim()) return
    
    // 清除之前的定时器
    if (autoTranslateRef.current) {
      clearTimeout(autoTranslateRef.current)
    }
    
    // 如果是语言切换，立即翻译；否则使用防抖延迟
    const delay = isLanguageChange ? 0 : 2000
    autoTranslateRef.current = setTimeout(() => {
      handleTranslate(true) // 标记为自动翻译
    }, delay)
  }, [autoTranslate, inputText, handleTranslate])

  // 使用 useRef 来跟踪前一次的语言状态
  const prevLanguageRef = useRef({ sourceLang, targetLang })
  
  // 监听输入文本和语言变化，触发自动翻译
  useEffect(() => {
    const prevLanguage = prevLanguageRef.current
    const isLanguageChange = prevLanguage.sourceLang !== sourceLang || prevLanguage.targetLang !== targetLang
    
    // 更新语言状态引用
    prevLanguageRef.current = { sourceLang, targetLang }
    
    triggerAutoTranslate(isLanguageChange)
    
    // 清理函数
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

  // 处理表格整理
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
        
        extraOutputButtons={[
          outputText && (
            <Button
              key="table-format"
              variant="ghost"
              size="sm"
              onClick={handleTableFormat}
              disabled={isTableFormatting || !outputText.trim()}
              className="text-gray-500 hover:text-gray-700"
              title={t('translation.tableFormatTooltip')}
            >
              {isTableFormatting ? (
                <i className="fas fa-spinner fa-spin text-xs"></i>
              ) : (
                <i className="fas fa-table text-xs"></i>
              )}
            </Button>
          )
        ]}
      />

      {/* 翻译按钮 */}
      {/* 翻译按钮和自动翻译状态 */}
      <div className="flex flex-col items-center mt-6 space-y-3">
        {/* 自动翻译提示 */}
        {autoTranslate && inputText.trim() && !isLoading && (
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <i className="fas fa-clock"></i>
            <span>{t('translation.autoTranslateHint', '停止输入2秒后自动翻译')}</span>
          </div>
        )}
        
        {/* 手动翻译按钮 */}
        <Button 
          onClick={() => handleTranslate(false)}
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