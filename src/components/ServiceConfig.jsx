import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Select, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  const [selectedPreset, setSelectedPreset] = useState('openai')
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [testStatus, setTestStatus] = useState({
    testing: false,
    result: null,
    message: ''
  })

  useEffect(() => {
    const presetConfigs = {
      openai: {
        serviceName: 'OpenAI',
        url: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini']
      },
      claude: {
        serviceName: t('presets.claude'),
        url: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-haiku-20240307',
        models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-5-sonnet-20241022']
      },
      azure: {
        serviceName: t('presets.azure'),
        url: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2024-02-15-preview',
        model: 'gpt-35-turbo',
        models: ['gpt-35-turbo', 'gpt-4', 'gpt-4-32k']
      },
      ollama: {
        serviceName: t('presets.ollama'),
        url: 'http://localhost:11434/v1/chat/completions',
        model: 'llama3',
        models: ['llama3', 'mistral', 'codellama', 'gemma']
      },
      custom: {
        serviceName: t('presets.custom'),
        url: '',
        model: '',
        models: []
      }
    }

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
      
      // 确定当前使用的预设
      const matchedPreset = Object.entries(presetConfigs).find(([key, preset]) => 
        preset.url === parsed.url && key !== 'custom'
      )
      setSelectedPreset(matchedPreset ? matchedPreset[0] : 'custom')
      
      // 检查是否使用自定义模型
      if (matchedPreset && parsed.customModel) {
        const preset = matchedPreset[1]
        const isCustomModel = !preset.models?.includes(parsed.model)
        setUseCustomModel(isCustomModel)
      }
    } else {
      // 如果没有保存的配置，也要传递默认配置给父组件
      onConfigChange(aiConfig)
    }
  }, [onConfigChange, t]) // eslint-disable-line react-hooks/exhaustive-deps

  const presetConfigs = {
    openai: {
      serviceName: t('presets.openai'),
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini']
    },
    claude: {
      serviceName: t('presets.claude'),
      url: 'https://api.anthropic.com/v1/messages',
      model: 'claude-3-haiku-20240307',
      models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-5-sonnet-20241022']
    },
    azure: {
      serviceName: t('presets.azure'),
      url: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2024-02-15-preview',
      model: 'gpt-35-turbo',
      models: ['gpt-35-turbo', 'gpt-4', 'gpt-4-32k']
    },
    ollama: {
      serviceName: t('presets.ollama'),
      url: 'http://localhost:11434/v1/chat/completions',
      model: 'llama3',
      models: ['llama3', 'mistral', 'codellama', 'gemma']
    },
    custom: {
      serviceName: t('presets.custom'),
      url: '',
      model: '',
      models: []
    }
  }

  const saveConfig = (newConfig) => {
    setAiConfig(newConfig)
    localStorage.setItem('aiTranslationConfig', JSON.stringify(newConfig))
    onConfigChange(newConfig)
  }

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey)
    setUseCustomModel(false)
    const preset = presetConfigs[presetKey]
    const newConfig = {
      ...aiConfig,
      serviceName: preset.serviceName,
      url: preset.url,
      model: preset.model,
      customModel: ''
    }
    saveConfig(newConfig)
  }

  const handleFieldChange = (field, value) => {
    const newConfig = { ...aiConfig, [field]: value }
    saveConfig(newConfig)
  }

  const testConnection = async () => {
    if (!aiConfig.apiKey || !aiConfig.url) {
      setTestStatus({
        testing: false,
        result: 'error',
        message: t('messages.testRequired')
      })
      return
    }
    
    setTestStatus({
      testing: true,
      result: null,
      message: t('settings.testing')
    })
    
    try {
      const response = await axios.post(
        aiConfig.url,
        {
          model: aiConfig.model,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${aiConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      if (response.data?.choices?.[0]?.message) {
        setTestStatus({
          testing: false,
          result: 'success',
          message: t('messages.testSuccess')
        })
      } else {
        setTestStatus({
          testing: false,
          result: 'error',
          message: t('messages.responseFormatError')
        })
      }
    } catch (error) {
      let errorMessage = t('messages.testFailed')
      
      if (error.response?.status === 401) {
        errorMessage = t('messages.invalidApiKey')
      } else if (error.response?.status === 429) {
        errorMessage = t('messages.rateLimited')
      } else if (error.response?.status === 403) {
        errorMessage = t('messages.accessDenied')
      } else if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
        errorMessage = t('messages.timeout')
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = t('messages.networkError')
      } else if (error.response?.data?.error?.message) {
        errorMessage = t('messages.apiError', { message: error.response.data.error.message })
      }
      
      setTestStatus({
        testing: false,
        result: 'error',
        message: errorMessage
      })
    }
  }

  const getCurrentPreset = () => presetConfigs[selectedPreset]
  const isConfigValid = () => aiConfig.apiKey && aiConfig.url && aiConfig.model

  if (isModal) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t('settings.preset')}</Label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectItem value="openai">{t('presets.openai')}</SelectItem>
            <SelectItem value="claude">{t('presets.claude')}</SelectItem>
            <SelectItem value="azure">{t('presets.azure')}</SelectItem>
            <SelectItem value="ollama">{t('presets.ollama')}</SelectItem>
            <SelectItem value="custom">{t('presets.custom')}</SelectItem>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('settings.serviceName')}</Label>
          <Input
            value={aiConfig.serviceName}
            onChange={(e) => handleFieldChange('serviceName', e.target.value)}
            placeholder={t('settings.serviceNamePlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('settings.apiUrl')}</Label>
          <Input
            type="url"
            value={aiConfig.url}
            onChange={(e) => handleFieldChange('url', e.target.value)}
            placeholder={t('settings.apiUrlPlaceholder')}
          />
          {selectedPreset === 'azure' && (
            <p className="text-sm text-muted-foreground">
              {t('settings.azureFormat')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t('settings.model')}</Label>
          {getCurrentPreset().models?.length > 0 && selectedPreset !== 'custom' ? (
            <>
              <Select
                value={useCustomModel ? 'custom' : aiConfig.model}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setUseCustomModel(true)
                    handleFieldChange('model', aiConfig.customModel || '')
                  } else {
                    setUseCustomModel(false)
                    handleFieldChange('model', value)
                    handleFieldChange('customModel', '')
                  }
                }}
              >
                {getCurrentPreset().models.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
                <SelectItem value="custom">{t('settings.customModel')}</SelectItem>
              </Select>
              {useCustomModel && (
                <Input
                  value={aiConfig.customModel}
                  onChange={(e) => {
                    handleFieldChange('customModel', e.target.value)
                    handleFieldChange('model', e.target.value)
                  }}
                  placeholder={t('settings.customModelPlaceholder')}
                />
              )}
            </>
          ) : (
            <Input
              value={aiConfig.model}
              onChange={(e) => handleFieldChange('model', e.target.value)}
              placeholder={t('settings.modelPlaceholder')}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>{t('settings.apiKey')}</Label>
          <Input
            type="password"
            value={aiConfig.apiKey}
            onChange={(e) => handleFieldChange('apiKey', e.target.value)}
            placeholder={t('settings.apiKeyPlaceholder')}
          />
          {selectedPreset === 'openai' && (
            <p className="text-sm text-muted-foreground">
              {t('settings.openaiDescription')}: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">{t('settings.openaiLink')}</a>
            </p>
          )}
          {selectedPreset === 'claude' && (
            <p className="text-sm text-muted-foreground">
              {t('settings.claudeDescription')}: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">{t('settings.claudeLink')}</a>
            </p>
          )}
          {selectedPreset === 'azure' && (
            <p className="text-sm text-muted-foreground">{t('settings.azureNote')}</p>
          )}
          {selectedPreset === 'ollama' && (
            <p className="text-sm text-muted-foreground">{t('settings.ollamaNote')}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={testConnection}
            variant={testStatus.result === 'success' ? 'default' : testStatus.result === 'error' ? 'destructive' : 'outline'}
            disabled={!aiConfig.url || !aiConfig.apiKey || testStatus.testing}
            className="w-full"
          >
            {testStatus.testing ? (<><i className="fas fa-spinner fa-spin mr-2"></i>{t('settings.testing')}</>) : t('settings.testConnection')}
          </Button>
          
          {testStatus.message && (
            <Alert variant={testStatus.result === 'error' ? 'destructive' : 'default'}>
              {testStatus.result === 'success' ? (
                <i className="fas fa-check-circle text-green-600"></i>
              ) : testStatus.result === 'error' ? (
                <i className="fas fa-times-circle text-red-600"></i>
              ) : (
                <i className="fas fa-exclamation-triangle text-yellow-600"></i>
              )}
              <AlertDescription>{testStatus.message}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* 智能语言切换设置 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">{t('settings.smartSwitch')}</Label>
              <p className="text-xs text-gray-500 mt-1">{t('settings.smartSwitchDesc')}</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiConfig.autoSwitchLang}
                onChange={(e) => handleFieldChange('autoSwitchLang', e.target.checked)}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiConfig.autoSwitchLang ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                <div className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiConfig.autoSwitchLang ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
          <p><strong>{t('settings.securityNote').split(':')[0]}:</strong>{t('settings.securityNote').split(':').slice(1).join(':')}</p>
          <p><strong>{t('settings.supportedServices').split(':')[0]}:</strong>{t('settings.supportedServices').split(':').slice(1).join(':')}</p>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.preset')}</Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                <SelectItem value="azure">Azure OpenAI</SelectItem>
                <SelectItem value="ollama">Ollama (本地)</SelectItem>
                <SelectItem value="custom">自定义服务</SelectItem>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.serviceName')}</Label>
              <Input
                value={aiConfig.serviceName}
                onChange={(e) => handleFieldChange('serviceName', e.target.value)}
                placeholder={t('settings.serviceNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('settings.apiUrl')}</Label>
              <Input
                type="url"
                value={aiConfig.url}
                onChange={(e) => handleFieldChange('url', e.target.value)}
                placeholder={t('settings.apiUrlPlaceholder')}
              />
              {selectedPreset === 'azure' && (
                <p className="text-sm text-muted-foreground">
                  {t('settings.azureFormat')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('settings.model')}</Label>
              {getCurrentPreset().models?.length > 0 && selectedPreset !== 'custom' ? (
                <>
                  <Select
                    value={useCustomModel ? 'custom' : aiConfig.model}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setUseCustomModel(true)
                        handleFieldChange('model', aiConfig.customModel || '')
                      } else {
                        setUseCustomModel(false)
                        handleFieldChange('model', value)
                        handleFieldChange('customModel', '')
                      }
                    }}
                  >
                    {getCurrentPreset().models.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                    <SelectItem value="custom">{t('settings.customModel')}</SelectItem>
                  </Select>
                  {useCustomModel && (
                    <Input
                      value={aiConfig.customModel}
                      onChange={(e) => {
                        handleFieldChange('customModel', e.target.value)
                        handleFieldChange('model', e.target.value)
                      }}
                      placeholder={t('settings.customModelPlaceholder')}
                    />
                  )}
                </>
              ) : (
                <Input
                  value={aiConfig.model}
                  onChange={(e) => handleFieldChange('model', e.target.value)}
                  placeholder={t('settings.modelPlaceholder')}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('settings.apiKey')}</Label>
              <Input
                type="password"
                value={aiConfig.apiKey}
                onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                placeholder={t('settings.apiKeyPlaceholder')}
              />
              {selectedPreset === 'openai' && (
                <p className="text-sm text-muted-foreground">
                  {t('settings.openaiDescription')}: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">{t('settings.openaiLink')}</a>
                </p>
              )}
              {selectedPreset === 'claude' && (
                <p className="text-sm text-muted-foreground">
                  {t('settings.claudeDescription')}: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">{t('settings.claudeLink')}</a>
                </p>
              )}
              {selectedPreset === 'azure' && (
                <p className="text-sm text-muted-foreground">{t('settings.azureNote')}</p>
              )}
              {selectedPreset === 'ollama' && (
                <p className="text-sm text-muted-foreground">{t('settings.ollamaNote')}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={testConnection}
                variant={testStatus.result === 'success' ? 'default' : testStatus.result === 'error' ? 'destructive' : 'outline'}
                disabled={!aiConfig.url || !aiConfig.apiKey || testStatus.testing}
                className="w-full"
              >
                {testStatus.testing ? (<><i className="fas fa-spinner fa-spin mr-2"></i>{t('settings.testing')}</>) : t('settings.testConnection')}
              </Button>
              
              {testStatus.message && (
                <Alert variant={testStatus.result === 'error' ? 'destructive' : 'default'}>
                  {testStatus.result === 'success' ? (
                    <i className="fas fa-check-circle text-green-600"></i>
                  ) : testStatus.result === 'error' ? (
                    <i className="fas fa-times-circle text-red-600"></i>
                  ) : (
                    <i className="fas fa-exclamation-triangle text-yellow-600"></i>
                  )}
                  <AlertDescription>{testStatus.message}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* 智能语言切换设置 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">智能语言切换</Label>
                  <p className="text-xs text-gray-500 mt-1">输入中文自动切换为英文翻译，输入英文自动切换为中文翻译</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiConfig.autoSwitchLang}
                    onChange={(e) => handleFieldChange('autoSwitchLang', e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiConfig.autoSwitchLang ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <div className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiConfig.autoSwitchLang ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
              <p><strong>注意：</strong>您的API密钥将安全保存在本地浏览器中，不会上传到任何服务器。</p>
              <p><strong>支持的服务：</strong>OpenAI、Claude、Azure OpenAI、Ollama本地部署等兼容OpenAI API格式的服务。</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default ServiceConfig