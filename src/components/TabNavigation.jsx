import { useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

const TabNavigation = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation()
  
  const tabs = [
    { id: 'text', icon: 'fas fa-font', label: t('tabs.text', '文字') },
    { id: 'image', icon: 'fas fa-image', label: t('tabs.image', '图片') }
  ]

  return (
    <div className="pt-4 pb-2">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList variant="rounded">
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

export default TabNavigation