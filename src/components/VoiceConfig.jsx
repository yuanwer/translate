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

    </div>
  )
}

export default VoiceConfig