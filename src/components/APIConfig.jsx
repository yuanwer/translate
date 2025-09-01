import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Select, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const APIConfig = ({ config, onConfigChange }) => {
  const { t } = useTranslation()
  const [selectedPreset, setSelectedPreset] = useState('openai')
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [testStatus, setTestStatus] = useState({
    testing: false,
    result: null,
    message: ''
  })

  const presetConfigs = useMemo(() => ({
    openai: {
      serviceName: t('presets.openai'),
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini']
    },
    ollama: {
      serviceName: t('presets.ollama'),
      url: 'http://localhost:11434/v1/chat/completions',
      model: 'llama3',
      models: ['llama3', 'mistral', 'codellama', 'gemma']
    },
    chrome_ai: {
      serviceName: t('presets.chrome_ai'),
      url: 'chrome://ai-translate',
      model: 'built-in',
      models: ['built-in']
    },
    openai_compatible: {
      serviceName: t('presets.openai_compatible'),
      url: '',
      model: '',
      models: []
    }
  }), [t])

  useEffect(() => {
    // 确定当前使用的预设
    const matchedPreset = Object.entries(presetConfigs).find(([key, preset]) => 
      preset.url === config.url && key !== 'openai_compatible'
    )
    setSelectedPreset(matchedPreset ? matchedPreset[0] : 'openai_compatible')
    
    // 检查是否使用自定义模型
    if (matchedPreset && config.customModel) {
      const preset = matchedPreset[1]
      const isCustomModel = !preset.models?.includes(config.model)
      setUseCustomModel(isCustomModel)
    }
  }, [config, presetConfigs])

  const handleFieldChange = (field, value) => {
    onConfigChange({ ...config, [field]: value })
  }

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey)
    setUseCustomModel(false)
    const preset = presetConfigs[presetKey]
    const newConfig = {
      ...config,
      serviceName: preset.serviceName,
      url: preset.url,
      model: preset.model,
      customModel: ''
    }
    onConfigChange(newConfig)
  }

  const testConnection = async () => {
    // Chrome AI特殊处理
    if (selectedPreset === 'chrome_ai') {
      return testChromeAI()
    }
    
    if (!config.apiKey || !config.url) {
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
        config.url,
        {
          model: config.model,
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
            'Authorization': `Bearer ${config.apiKey}`,
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

  const testChromeAI = async () => {
    setTestStatus({
      testing: true,
      result: null,
      message: t('settings.testing')
    })

    try {
      if (!window.ai || !window.ai.translator) {
        setTestStatus({
          testing: false,
          result: 'error',
          message: t('messages.chromeAiNotAvailable')
        })
        return
      }

      // 测试简单的语言对
      const canTranslate = await window.ai.translator.canTranslate({
        sourceLanguage: 'en',
        targetLanguage: 'zh'
      })

      if (canTranslate === 'no') {
        setTestStatus({
          testing: false,
          result: 'error',
          message: t('messages.languagePairNotSupported')
        })
        return
      }

      setTestStatus({
        testing: false,
        result: 'success',
        message: t('messages.testSuccess')
      })
    } catch {
      setTestStatus({
        testing: false,
        result: 'error',
        message: t('messages.chromeAiNotAvailable')
      })
    }
  }

  const getCurrentPreset = () => presetConfigs[selectedPreset]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">{t('config.api.title', 'API配置')}</h3>
        <p className="text-sm text-gray-500">{t('config.api.description', '配置AI服务提供商和API密钥')}</p>
      </div>

      <div className="space-y-2">
        <Label>{t('settings.preset')}</Label>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectItem value="openai">{t('presets.openai')}</SelectItem>
          <SelectItem value="openai_compatible">{t('presets.openai_compatible')}</SelectItem>
          <SelectItem value="ollama">{t('presets.ollama')}</SelectItem>
          <SelectItem value="chrome_ai">{t('presets.chrome_ai')}</SelectItem>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('settings.serviceName')}</Label>
        <Input
          value={config.serviceName || ''}
          onChange={(e) => handleFieldChange('serviceName', e.target.value)}
          placeholder={t('settings.serviceNamePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('settings.apiUrl')}</Label>
        <Input
          type="url"
          value={config.url || ''}
          onChange={(e) => handleFieldChange('url', e.target.value)}
          placeholder={t('settings.apiUrlPlaceholder')}
        />
        {selectedPreset === 'chrome_ai' && (
          <p className="text-sm text-muted-foreground">
            {t('settings.chromeAiNote')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t('settings.model')}</Label>
        {getCurrentPreset().models?.length > 0 && selectedPreset !== 'openai_compatible' ? (
          <>
            <Select
              value={useCustomModel ? 'custom' : config.model}
              onValueChange={(value) => {
                if (value === 'custom') {
                  setUseCustomModel(true)
                  handleFieldChange('model', config.customModel || '')
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
                value={config.customModel || ''}
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
            value={config.model || ''}
            onChange={(e) => handleFieldChange('model', e.target.value)}
            placeholder={t('settings.modelPlaceholder')}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>{t('settings.apiKey')}</Label>
        <Input
          type="password"
          value={config.apiKey || ''}
          onChange={(e) => handleFieldChange('apiKey', e.target.value)}
          placeholder={t('settings.apiKeyPlaceholder')}
        />
        {selectedPreset === 'openai' && (
          <p className="text-sm text-muted-foreground">
            {t('settings.openaiDescription')}: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">{t('settings.openaiLink')}</a>
          </p>
        )}
        {selectedPreset === 'ollama' && (
          <p className="text-sm text-muted-foreground">{t('settings.ollamaNote')}</p>
        )}
        {selectedPreset === 'chrome_ai' && (
          <p className="text-sm text-muted-foreground">{t('settings.chromeAiDescription')}</p>
        )}
        {selectedPreset === 'openai_compatible' && (
          <p className="text-sm text-muted-foreground">{t('settings.openaiCompatibleNote')}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button 
          onClick={testConnection}
          variant={testStatus.result === 'success' ? 'default' : testStatus.result === 'error' ? 'destructive' : 'outline'}
          disabled={selectedPreset === 'chrome_ai' ? false : (!config.url || !config.apiKey || testStatus.testing)}
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

      <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
        <p><strong>{t('settings.securityNote').split(':')[0]}:</strong>{t('settings.securityNote').split(':').slice(1).join(':')}</p>
        <p><strong>{t('settings.supportedServices').split(':')[0]}:</strong>{t('settings.supportedServices').split(':').slice(1).join(':')}</p>
      </div>
    </div>
  )
}

export default APIConfig