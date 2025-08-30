import { useTranslation } from 'react-i18next'

const TabNavigation = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation()
  
  const tabs = [
    { id: 'text', icon: 'fas fa-font', label: t('tabs.text', '文字') },
    { id: 'image', icon: 'fas fa-image', label: t('tabs.image', '图片') }
  ]

  return (
    <div className="flex gap-2 pt-4 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
          }`}
        >
          <i className={tab.icon}></i>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TabNavigation