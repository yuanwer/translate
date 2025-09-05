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
  // 输入增强参数
  onSubmit,
  onClear,
  onSwap,
  autoFocus = false,
  showCharCount = true,
  
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

  const createSyntheticEvent = (nextValue) => ({ target: { value: nextValue } })

  const handlePasteInput = async () => {
    if (inputReadOnly || inputDisabled) return
    try {
      const text = await navigator.clipboard.readText()
      if (typeof onInputChange === 'function') {
        onInputChange(createSyntheticEvent((inputValue || '') + text))
      }
    } catch (err) {
      // 读取失败时忽略，可能非安全上下文或未授权
      // 可选：未来集成 toast 提示
    }
  }

  const handleClearInput = () => {
    if (inputReadOnly || inputDisabled) return
    if (typeof onClear === 'function') {
      onClear()
    }
    if (typeof onInputChange === 'function') {
      onInputChange(createSyntheticEvent(''))
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
              {!inputReadOnly && (
                <>
                  <Button
                    variant="ghost"
                    onClick={handlePasteInput}
                    disabled={inputDisabled}
                    className="text-gray-500 hover:text-gray-700"
                    title={t('common.paste', '粘贴')}
                  >
                    <i className="fas fa-clipboard text-xs"></i>
                  </Button>
                  {inputValue && (
                    <Button
                      variant="ghost"
                      onClick={handleClearInput}
                      disabled={inputDisabled}
                      className="text-gray-500 hover:text-gray-700"
                      title={t('common.clear', '清空')}
                    >
                      <i className="fas fa-eraser text-xs"></i>
                    </Button>
                  )}
                </>
              )}
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
                t('tts.speakInput', '朗读输入文本')
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
              onSubmit={onSubmit}
              onClear={handleClearInput}
              onSwap={onSwap}
              autoFocus={autoFocus}
              showCharCount={showCharCount}
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
                    t('tts.speakOutput', '朗读翻译结果')
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