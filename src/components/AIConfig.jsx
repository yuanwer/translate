import { useTranslation } from 'react-i18next'

const AIConfig = ({ config, onConfigChange }) => {
  const { t } = useTranslation()

  const handleAutoSwitchChange = (enabled) => {
    onConfigChange({
      ...config,
      autoSwitchLang: enabled
    })
  }

  const handleWebSearchChange = (enabled) => {
    onConfigChange({
      ...config,
      enableWebSearch: enabled
    })
  }

  const handleAutoTranslateChange = (enabled) => {
    onConfigChange({
      ...config,
      autoTranslate: enabled
    })
  }

  return (
    <div className="space-y-6">
      {/* 智能语言切换 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {t('config.ai.smartSwitch', '智能语言切换')}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {t('config.ai.smartSwitchDesc', '输入中文自动切换为英文翻译，输入英文自动切换为中文翻译')}
            </p>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSwitchLang"
              checked={config.autoSwitchLang}
              onChange={(e) => handleAutoSwitchChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoSwitchLang" className="ml-2 sr-only">
              智能语言切换
            </label>
          </div>
        </div>
      </div>

      {/* 联网对话 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {t('config.ai.webSearch', '联网对话')}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {t('config.ai.webSearchDesc', '为AI翻译开启联网功能，结合最新信息对原文进行翻译')}
            </p>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableWebSearch"
              checked={config.enableWebSearch}
              onChange={(e) => handleWebSearchChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enableWebSearch" className="ml-2 sr-only">
              联网对话
            </label>
          </div>
        </div>
      </div>

      {/* 自动翻译 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {t('config.ai.autoTranslate', '自动翻译')}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {t('config.ai.autoTranslateDesc', '停止输入2秒后自动触发翻译，无需手动点击翻译按钮')}
            </p>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoTranslate"
              checked={config.autoTranslate !== false}
              onChange={(e) => handleAutoTranslateChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoTranslate" className="ml-2 sr-only">
              自动翻译
            </label>
          </div>
        </div>
      </div>

    </div>
  )
}

export default AIConfig