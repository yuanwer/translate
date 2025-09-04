import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { translateService } from './services/translateService'
import ServiceConfig from './components/ServiceConfig'
import TextTranslation from './components/TextTranslation'
import ImageTranslation from './components/ImageTranslation'
import LanguageSwitcher from './components/LanguageSwitcher'
import TabNavigation from './components/TabNavigation'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import '@fortawesome/fontawesome-free/css/all.min.css'

function App() {
  const { t } = useTranslation()
  
  // 全局应用状态
  const [serviceConfig, setServiceConfig] = useState({})
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [activeTab, setActiveTab] = useState('text')

  const languages = translateService.getSupportedLanguages()



  const handleConfigChange = useCallback((newConfig) => {
    console.log('配置已更新:', newConfig)
    setServiceConfig(newConfig)
  }, [])

  useEffect(() => {
    const loadSavedConfig = () => {
      try {
        const savedConfig = localStorage.getItem('aiTranslationConfig')
        let config = {}
        
        if (savedConfig) {
          config = JSON.parse(savedConfig)
          console.log('已加载保存的配置:', config)
        } else {
          console.log('未找到已保存的配置')
        }
        
        // 迁移旧的智能切换设置
        if (config.autoSwitchLang === undefined) {
          try {
            const oldAutoSwitchSetting = localStorage.getItem('autoSwitchLang')
            if (oldAutoSwitchSetting !== null) {
              config.autoSwitchLang = JSON.parse(oldAutoSwitchSetting)
              console.log('已迁移旧的智能切换设置:', config.autoSwitchLang)
              // 删除旧的独立设置
              localStorage.removeItem('autoSwitchLang')
            } else {
              config.autoSwitchLang = true // 默认值
            }
          } catch (error) {
            console.error('迁移智能切换设置失败:', error)
            config.autoSwitchLang = true
          }
        }
        
        setServiceConfig(config)
        
        // 保存更新后的配置（包含迁移的设置）
        localStorage.setItem('aiTranslationConfig', JSON.stringify(config))
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    }


    loadSavedConfig()

    return () => {}
  }, [])


  return (
    <div className="min-h-screen bg-white">
      {/* Google 翻译风格的头部 */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl text-gray-700">{t('app.title', '翻译')}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                onClick={() => setShowConfigModal(true)}
                className="w-10 h-10 text-gray-600 hover:bg-gray-100"
                title={t('settings.title')}
              >
                <i className="fas fa-cog"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="max-w-6xl mx-auto px-4">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* 主内容区域 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 根据活动标签渲染不同内容 */}
        {activeTab === 'text' ? (
          <TextTranslation 
            serviceConfig={serviceConfig}
            languages={languages}
          />
        ) : (
          <ImageTranslation 
            serviceConfig={serviceConfig}
            languages={languages}
          />
        )}

      </div>
      
      {/* 配置弹窗 */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title={t('settings.configTitle')}
      >
        <div className="p-6">
          <ServiceConfig 
            config={serviceConfig}
            onConfigChange={handleConfigChange}
            isModal={true}
          />
        </div>
      </Modal>
    </div>
  )
}

export default App
