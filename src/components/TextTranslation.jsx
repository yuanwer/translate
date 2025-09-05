import { useTranslation } from 'react-i18next'
import { useTextTranslation } from '../hooks/useTextTranslation'
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
    inputText,
    outputText,
    sourceLang,
    targetLang,
    isLoading,
    error,
    detectedLanguage,
    isTableFormatting,
    setInputText,
    setSourceLang,
    setTargetLang,
    handleTranslate,
    handleTableFormat,
    swapLanguages,
    handleSpeakInput,
    handleSpeakOutput,
    isSpeaking,
    isPaused,
    canSpeak,
    ttsSupported
  } = useTextTranslation(serviceConfig)
  const autoTranslate = serviceConfig.autoTranslate !== false

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
          className="sm-btn sm-btn--primary px-8 py-3 rounded-full"
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