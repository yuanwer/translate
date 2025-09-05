import { useTranslation } from 'react-i18next'
import { EnhancedTextInput } from './EnhancedTextInput'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

/**
 * 通用翻译面板组件
 * 可用于文本翻译和图片翻译的输入输出区域
 */
const TranslationPanel = ({
  // 输入侧配置
  inputValue,
  onInputChange,
  inputPlaceholder,
  inputLanguageName,
  inputReadOnly = false,
  inputDisabled = false,
  
  // 输出侧配置  
  outputValue,
  outputPlaceholder,
  outputLanguageName,
  outputReadOnly = true, // eslint-disable-line no-unused-vars
  
  // TTS相关
  onSpeakInput,
  onSpeakOutput,
  isSpeaking,
  isPaused,
  canSpeak,
  ttsSupported,
  
  // 其他功能按钮
  extraInputButtons = [],
  extraOutputButtons = [],
  
  // 样式
  className = "grid lg:grid-cols-2 gap-0 border border-gray-300 rounded-lg overflow-hidden",
  minHeight = "min-h-[300px]"
}) => {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()

  const handleCopyInput = () => {
    if (inputValue) {
      copyToClipboard(inputValue)
    }
  }

  const handleCopyOutput = () => {
    if (outputValue) {
      copyToClipboard(outputValue)
    }
  }

  const renderTTSButton = (text, onSpeak, title) => {
    if (!text || !ttsSupported) return null
    
    return (
      <Button
        variant="ghost"
        onClick={() => onSpeak?.(text)}
        disabled={!canSpeak}
        className={`text-xs ${
          isSpeaking || isPaused
            ? 'text-[--sm-primary] hover:opacity-90' 
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title={
          !ttsSupported 
            ? t('tts.notSupported', '浏览器不支持语音合成')
            : isSpeaking 
              ? t('tts.stop', '停止朗读')
              : title
        }
      >
        <i className={`fas ${
          isSpeaking 
            ? 'fa-stop' 
            : isPaused 
              ? 'fa-play' 
              : 'fa-volume-up'
        } text-xs`}></i>
      </Button>
    )
  }

  return (
    <div className={`${className} ${minHeight}`}>
      {/* 左侧输入区域 */}
      <div className="bg-white relative flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2 h-8">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 uppercase">
                {inputLanguageName}
              </span>
            </div>
            <div className="flex items-center gap-1 h-8">
              {extraInputButtons}
              {inputValue && !inputReadOnly && (
                <Button
                  variant="ghost"
                  onClick={handleCopyInput}
                  className="text-gray-500 hover:text-gray-700"
                  title={t('common.copy')}
                >
                  <i className="fas fa-copy text-xs"></i>
                </Button>
              )}
              {renderTTSButton(
                inputValue, 
                onSpeakInput, 
                t('tts.speak', '朗读输入文本')
              )}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 flex-1 min-h-0">
          {inputReadOnly ? (
            <Textarea
              value={inputValue}
              onChange={onInputChange}
              readOnly={inputReadOnly}
              disabled={inputDisabled}
              placeholder={inputPlaceholder}
              className={`h-full resize-none border-0`}
            />
          ) : (
            <EnhancedTextInput
              value={inputValue}
              onChange={onInputChange}
              placeholder={inputPlaceholder}
              disabled={inputDisabled}
              className="border-0 h-full"
            />
          )}
        </div>
      </div>

      {/* 右侧输出区域 */}
      <div className="bg-white border-l border-gray-300 relative flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2 h-8">
            <span className="text-xs text-gray-600 uppercase">
              {outputLanguageName}
            </span>
            <div className="flex items-center gap-1 h-8">
              {extraOutputButtons}
              {outputValue && (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleCopyOutput}
                    className="text-gray-500 hover:text-gray-700"
                    title={t('common.copy')}
                  >
                    <i className="fas fa-copy text-xs"></i>
                  </Button>
                  {renderTTSButton(
                    outputValue, 
                    onSpeakOutput, 
                    t('tts.speak', '朗读翻译结果')
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 flex-1 min-h-0">
          {outputValue ? (
            <MarkdownRenderer minHeight={minHeight} className="border-0 bg-transparent h-full">
              {outputValue}
            </MarkdownRenderer>
          ) : (
            <div className={`h-full flex items-center justify-center border-0 bg-transparent text-gray-400 text-sm`}>
              {outputPlaceholder}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TranslationPanel