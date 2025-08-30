import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTTS } from '../hooks/useTTS'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'

const TTSSettings = () => {
  const { t } = useTranslation()
  const { 
    voices, 
    config, 
    updateConfig, 
    resetConfig, 
    isSupported, 
    isReady,
    speak,
    canSpeak
  } = useTTS()
  
  const [testText] = useState(t('tts.testVoice'))

  const handleConfigChange = (key, value) => {
    updateConfig({ [key]: value })
  }

  const handleTestVoice = async () => {
    if (!canSpeak) return
    
    try {
      await speak(testText, { 
        language: 'zh-CN',
        rate: config.rate,
        pitch: config.pitch,
        volume: config.volume,
        voiceIndex: config.voiceIndex
      })
    } catch (error) {
      console.error('测试语音失败:', error)
    }
  }

  if (!isSupported) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <i className="fas fa-exclamation-triangle"></i>
          <span className="text-sm">{t('tts.notSupported')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{t('tts.settings')}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetConfig}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-undo mr-1"></i>
          重置
        </Button>
      </div>

      {/* 语速设置 */}
      <div className="space-y-2">
        <Label className="text-sm">{t('tts.rate')}</Label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-8">0.5x</span>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={config.rate}
            onChange={(e) => handleConfigChange('rate', parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-8">2.0x</span>
          <span className="text-xs font-mono w-10 text-center">{config.rate}x</span>
        </div>
      </div>

      {/* 音调设置 */}
      <div className="space-y-2">
        <Label className="text-sm">{t('tts.pitch')}</Label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-8">0.5</span>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={config.pitch}
            onChange={(e) => handleConfigChange('pitch', parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-8">2.0</span>
          <span className="text-xs font-mono w-10 text-center">{config.pitch}</span>
        </div>
      </div>

      {/* 音量设置 */}
      <div className="space-y-2">
        <Label className="text-sm">{t('tts.volume')}</Label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-8">0</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.volume}
            onChange={(e) => handleConfigChange('volume', parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-8">1</span>
          <span className="text-xs font-mono w-10 text-center">{Math.round(config.volume * 100)}%</span>
        </div>
      </div>

      {/* 语音选择 */}
      {voices.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">{t('tts.voice')}</Label>
          <Select 
            value={config.voiceIndex.toString()} 
            onValueChange={(value) => handleConfigChange('voiceIndex', parseInt(value))}
          >
            <SelectItem value="-1">自动选择</SelectItem>
            {voices.map((voice, index) => (
              <SelectItem key={index} value={index.toString()}>
                {voice.name} ({voice.lang})
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* 自动语言检测 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">{t('tts.autoDetect')}</Label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoDetectLang}
              onChange={(e) => handleConfigChange('autoDetectLang', e.target.checked)}
              className="sr-only"
            />
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              config.autoDetectLang ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                config.autoDetectLang ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-500">
          根据文本内容自动选择合适的语音
        </p>
      </div>

      {/* 测试按钮 */}
      <div className="pt-4 border-t">
        <Button
          onClick={handleTestVoice}
          disabled={!isReady || !canSpeak}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <i className="fas fa-volume-up mr-2"></i>
          {t('tts.testVoice')}
        </Button>
        {!isReady && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            语音功能准备中...
          </p>
        )}
      </div>
    </div>
  )
}

export default TTSSettings