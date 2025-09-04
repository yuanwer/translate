import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'
import ConfigTabNavigation from './ConfigTabNavigation'
import APIConfig from './APIConfig'
import AIConfig from './AIConfig'
import VoiceConfig from './VoiceConfig'
import { useServiceConfig } from '@/hooks/useServiceConfig'

const ServiceConfig = ({ onConfigChange, isModal = false }) => {
  const { t } = useTranslation()
  const { success, error } = useToast()
  const {
    aiConfig,
    showConfig,
    setShowConfig,
    activeConfigTab,
    setActiveConfigTab,
    saveConfig,
    isConfigValid,
    exportConfig,
    importConfig,
    resetConfig,
    fileInputRef
  } = useServiceConfig(onConfigChange)

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
            onChange={(e) => importConfig(e, (msg) => error(t('messages.invalidFileType')), () => success(t('messages.importSuccess')))}
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
              onChange={(e) => importConfig(e, (msg) => error(t('messages.invalidFileType')), () => success(t('messages.importSuccess')))}
              style={{ display: 'none' }}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default ServiceConfig