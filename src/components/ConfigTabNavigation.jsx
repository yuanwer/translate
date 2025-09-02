import { useTranslation } from 'react-i18next'

const ConfigTabNavigation = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation()
  
  const tabs = [
    {
      id: 'api',
      label: t('config.tabs.api', 'API配置'),
      icon: 'fas fa-cog'
    },
    {
      id: 'ai',
      label: t('config.tabs.ai', 'AI设置'),
      icon: 'fas fa-brain'
    },
    {
      id: 'voice',
      label: t('config.tabs.voice', '语音设置'),
      icon: 'fas fa-volume-up'
    }
  ]

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <i className={tab.icon}></i>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default ConfigTabNavigation