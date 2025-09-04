import { useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

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
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList variant="default">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              icon={tab.icon}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

export default ConfigTabNavigation