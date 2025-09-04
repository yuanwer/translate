import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const APIConfig = ({ config, onConfigChange }) => {
  const { t } = useTranslation()
  const [testStatus, setTestStatus] = useState({
    testing: false,
    result: null,
    message: ''
  })

  const handleFieldChange = (field, value) => {
    onConfigChange({ ...config, [field]: value })
  }

  const testConnection = async () => {
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">{t('config.api.title', 'API配置')}</h3>
        <p className="text-sm text-gray-500">{t('config.api.description', '配置AI服务提供商和API密钥')}</p>
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
      </div>

      <div className="space-y-2">
        <Label>{t('settings.model')}</Label>
        <Input
          value={config.model || ''}
          onChange={(e) => handleFieldChange('model', e.target.value)}
          placeholder={t('settings.modelPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('settings.visionModel')}</Label>
        <Input
          value={config.visionModel || ''}
          onChange={(e) => handleFieldChange('visionModel', e.target.value)}
          placeholder={t('settings.visionModelPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('settings.apiKey')}</Label>
        <Input
          type="password"
          value={config.apiKey || ''}
          onChange={(e) => handleFieldChange('apiKey', e.target.value)}
          placeholder={t('settings.apiKeyPlaceholder')}
        />
        <p className="text-sm text-muted-foreground">
          {t('settings.openaiDescription')}: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">{t('settings.openaiLink')}</a>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button 
          onClick={testConnection}
          variant={testStatus.result === 'success' ? 'default' : testStatus.result === 'error' ? 'destructive' : 'outline'}
          disabled={(!config.url || !config.apiKey || testStatus.testing)}
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

    </div>
  )
}

export default APIConfig