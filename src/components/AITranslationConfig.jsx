import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'

const AITranslationConfig = ({ config, onConfigChange }) => {
  const { t } = useTranslation()

  const handleFieldChange = (field, value) => {
    onConfigChange({ ...config, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">{t('config.ai.title', 'AI翻译设置')}</h3>
        <p className="text-sm text-gray-500">{t('config.ai.description', '配置AI翻译的行为和智能功能')}</p>
      </div>

      {/* 智能语言切换设置 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-sm font-medium">{t('settings.smartSwitch', '智能语言切换')}</Label>
            <p className="text-xs text-gray-500 mt-1">{t('settings.smartSwitchDesc', '输入中文自动切换为英文翻译，输入英文自动切换为中文翻译')}</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoSwitchLang || false}
              onChange={(e) => handleFieldChange('autoSwitchLang', e.target.checked)}
              className="sr-only"
            />
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.autoSwitchLang ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.autoSwitchLang ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
          </label>
        </div>
      </div>

      {/* 未来可以添加更多AI相关设置 */}
      <div className="pt-4 border-t">
        <div className="space-y-2 text-sm text-gray-600">
          <h4 className="font-medium text-gray-900">{t('config.ai.tips', '使用提示')}</h4>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>{t('config.ai.tip1', '智能语言切换可以根据输入内容自动选择合适的目标语言')}</li>
            <li>{t('config.ai.tip2', '当检测到中文输入时，会自动切换到英文翻译')}</li>
            <li>{t('config.ai.tip3', '当检测到英文输入时，会自动切换到中文翻译')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AITranslationConfig