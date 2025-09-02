import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTTS } from '../hooks/useTTS'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

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
          {t('common.reset')}
        </Button>
      </div>

      {/* 语速设置 */}
      <Slider
        label={t('tts.rate')}
        min={0.5}
        max={2.0}
        step={0.1}
        value={config.rate}
        onChange={(value) => handleConfigChange('rate', value)}
        valueFormatter={(val) => `${val}x`}
        showLabels={true}
      />

      {/* 音调设置 */}
      <Slider
        label={t('tts.pitch')}
        min={0.5}
        max={2.0}
        step={0.1}
        value={config.pitch}
        onChange={(value) => handleConfigChange('pitch', value)}
        valueFormatter={(val) => val.toString()}
        showLabels={true}
      />

      {/* 音量设置 */}
      <Slider
        label={t('tts.volume')}
        min={0}
        max={1}
        step={0.1}
        value={config.volume}
        onChange={(value) => handleConfigChange('volume', value)}
        valueFormatter={(val) => `${Math.round(val * 100)}%`}
        showLabels={true}
      />

      {/* 语音选择 */}
      {voices.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">{t('tts.voice')}</Label>
          <Select 
            value={config.voiceIndex.toString()} 
            onValueChange={(value) => handleConfigChange('voiceIndex', parseInt(value))}
          >
            <SelectItem value="-1">{t('tts.autoSelect')}</SelectItem>
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
          {t('tts.autoDetectDescription')}
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
            {t('tts.initializing')}
          </p>
        )}
      </div>
    </div>
  )
}

export default TTSSettings