import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import ConfigTabNavigation from './ConfigTabNavigation'
import AITranslationConfig from './AITranslationConfig'
import APIConfig from './APIConfig'
import VoiceConfig from './VoiceConfig'

const ServiceConfig = ({ onConfigChange, isModal = false }) => {
  const { t } = useTranslation()
  const [aiConfig, setAiConfig] = useState({
    serviceName: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    apiKey: '',
    customModel: '',
    autoSwitchLang: true
  })

  const [showConfig, setShowConfig] = useState(false)
  const [activeConfigTab, setActiveConfigTab] = useState('api')

  useEffect(() => {
    const savedConfig = localStorage.getItem('aiTranslationConfig')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      const newConfig = {
        ...parsed,
        customModel: parsed.customModel || '',
        autoSwitchLang: parsed.autoSwitchLang !== undefined ? parsed.autoSwitchLang : true
      }
      setAiConfig(newConfig)
      // 立即将配置传递给父组件
      onConfigChange(newConfig)
    } else {
      // 如果没有保存的配置，也要传递默认配置给父组件
      onConfigChange(aiConfig)
    }
  }, [onConfigChange]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveConfig = (newConfig) => {
    setAiConfig(newConfig)
    localStorage.setItem('aiTranslationConfig', JSON.stringify(newConfig))
    onConfigChange(newConfig)
  }

  const isConfigValid = () => aiConfig.apiKey && aiConfig.url && aiConfig.model

  const renderTabContent = () => {
    switch (activeConfigTab) {
      case 'ai':
        return <AITranslationConfig config={aiConfig} onConfigChange={saveConfig} />
      case 'api':
        return <APIConfig config={aiConfig} onConfigChange={saveConfig} />
      case 'voice':
        return <VoiceConfig />
      default:
        return <APIConfig config={aiConfig} onConfigChange={saveConfig} />
    }
  }

  if (isModal) {
    return (
      <div className="space-y-4">
        <ConfigTabNavigation activeTab={activeConfigTab} onTabChange={setActiveConfigTab} />
        {renderTabContent()}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <Button
          variant="outline"
          onClick={() => setShowConfig(!showConfig)}
          className={`w-full justify-between ${!isConfigValid() ? 'border-red-300 text-red-700' : ''}`}
        >
          <div className="flex items-center gap-2">
            <i className="fas fa-cog"></i> {t('settings.configTitle')}
            {!isConfigValid() && <i className="fas fa-exclamation-triangle text-red-600"></i>}
          </div>
          {showConfig ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
        </Button>
      </CardHeader>
      
      {showConfig && (
        <CardContent className="space-y-4">
          <ConfigTabNavigation activeTab={activeConfigTab} onTabChange={setActiveConfigTab} />
          {renderTabContent()}
        </CardContent>
      )}
    </Card>
  )
}

export default ServiceConfig