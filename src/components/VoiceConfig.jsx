import { useTranslation } from 'react-i18next'
import TTSSettings from './TTSSettings'

const VoiceConfig = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">{t('config.voice.title', '语音设置')}</h3>
        <p className="text-sm text-gray-500">{t('config.voice.description', '配置文本转语音功能的参数和选项')}</p>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <TTSSettings />
      </div>

      <div className="pt-4 border-t">
        <div className="space-y-2 text-sm text-gray-600">
          <h4 className="font-medium text-gray-900">{t('config.voice.tips', '使用说明')}</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>{t('config.voice.tip1', '语音功能基于浏览器内置的Web Speech API')}</li>
            <li>{t('config.voice.tip2', '不同浏览器支持的语音数量和质量可能不同')}</li>
            <li>{t('config.voice.tip3', '自动语言检测可以根据文本内容选择合适的语音')}</li>
            <li>{t('config.voice.tip4', '可以通过测试按钮预览当前设置的语音效果')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default VoiceConfig