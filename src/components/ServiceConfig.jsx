import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'
import ConfigTabNavigation from './ConfigTabNavigation'
import APIConfig from './APIConfig'
import AIConfig from './AIConfig'
import VoiceConfig from './VoiceConfig'

const ServiceConfig = ({ onConfigChange, isModal = false }) => {
  const { t } = useTranslation()
  const { success, error } = useToast()
  const fileInputRef = useRef(null)
  const [aiConfig, setAiConfig] = useState({
    serviceName: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    apiKey: '',
    customModel: '',
    autoSwitchLang: true,
    enableWebSearch: false
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
        autoSwitchLang: parsed.autoSwitchLang !== undefined ? parsed.autoSwitchLang : true,
        enableWebSearch: parsed.enableWebSearch !== undefined ? parsed.enableWebSearch : false
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

  const exportConfig = () => {
    try {
      const configData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        config: aiConfig
      }
      
      const dataStr = JSON.stringify(configData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-translate-config-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      success(t('messages.exportSuccess'))
    } catch {
      error(t('messages.exportError'))
    }
  }

  const importConfig = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      error(t('messages.invalidFileType'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        
        // 验证配置格式
        let configToImport = imported.config || imported
        
        // 验证必要字段
        if (typeof configToImport !== 'object' || !configToImport) {
          throw new Error('Invalid configuration format')
        }

        // 合并配置，保留当前的默认值
        const newConfig = {
          serviceName: configToImport.serviceName || aiConfig.serviceName,
          url: configToImport.url || aiConfig.url,
          model: configToImport.model || aiConfig.model,
          apiKey: configToImport.apiKey || '',
          customModel: configToImport.customModel || '',
          autoSwitchLang: configToImport.autoSwitchLang !== undefined ? configToImport.autoSwitchLang : aiConfig.autoSwitchLang,
          enableWebSearch: configToImport.enableWebSearch !== undefined ? configToImport.enableWebSearch : aiConfig.enableWebSearch
        }

        saveConfig(newConfig)
        success(t('messages.importSuccess'))
      } catch {
        error(t('messages.importError'))
      }
      
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    
    reader.onerror = () => {
      error(t('messages.fileReadError'))
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    
    reader.readAsText(file)
  }

  const resetConfig = () => {
    if (window.confirm(t('messages.resetConfigConfirm'))) {
      const defaultConfig = {
        serviceName: 'OpenAI',
        url: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        apiKey: '',
        customModel: '',
        autoSwitchLang: true,
        enableWebSearch: false
      }
      saveConfig(defaultConfig)
      success(t('messages.resetConfigSuccess'))
    }
  }

  const renderTabContent = () => {
    switch (activeConfigTab) {
      case 'api':
        return <APIConfig config={aiConfig} onConfigChange={saveConfig} />
      case 'ai':
        return <AIConfig config={aiConfig} onConfigChange={saveConfig} />
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
        
        <div className="pt-4 border-t space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={exportConfig}
              className="flex-1 flex items-center gap-2"
            >
              <i className="fas fa-download"></i>
              {t('settings.exportConfig')}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center gap-2"
            >
              <i className="fas fa-upload"></i>
              {t('settings.importConfig')}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetConfig}
              className="flex-1 flex items-center gap-2 text-orange-600 hover:text-orange-700"
            >
              <i className="fas fa-undo"></i>
              {t('settings.resetConfig')}
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={importConfig}
            style={{ display: 'none' }}
          />
        </div>
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
          
          <div className="pt-4 border-t space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={exportConfig}
                className="flex-1 flex items-center gap-2"
              >
                <i className="fas fa-download"></i>
                {t('settings.exportConfig')}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center gap-2"
              >
                <i className="fas fa-upload"></i>
                {t('settings.importConfig')}
              </Button>
              
              <Button
                variant="outline"
                onClick={resetConfig}
                className="flex-1 flex items-center gap-2 text-orange-600 hover:text-orange-700"
              >
                <i className="fas fa-undo"></i>
                {t('settings.resetConfig')}
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={importConfig}
              style={{ display: 'none' }}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default ServiceConfig