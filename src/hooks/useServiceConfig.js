import { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_CONFIG = {
  serviceName: 'OpenAI',
  url: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-3.5-turbo',
  apiKey: '',
  customModel: '',
  autoSwitchLang: true,
  enableWebSearch: false,
  autoTranslate: true
}

export function useServiceConfig(onConfigChange) {
  const fileInputRef = useRef(null)
  const [aiConfig, setAiConfig] = useState(DEFAULT_CONFIG)
  const [showConfig, setShowConfig] = useState(false)
  const [activeConfigTab, setActiveConfigTab] = useState('api')

  useEffect(() => {
    const savedConfig = localStorage.getItem('aiTranslationConfig')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      const newConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
        customModel: parsed.customModel || '',
        autoSwitchLang: parsed.autoSwitchLang !== undefined ? parsed.autoSwitchLang : DEFAULT_CONFIG.autoSwitchLang,
        enableWebSearch: parsed.enableWebSearch !== undefined ? parsed.enableWebSearch : DEFAULT_CONFIG.enableWebSearch,
        autoTranslate: parsed.autoTranslate !== undefined ? parsed.autoTranslate : DEFAULT_CONFIG.autoTranslate
      }
      setAiConfig(newConfig)
      onConfigChange?.(newConfig)
    } else {
      onConfigChange?.(DEFAULT_CONFIG)
    }
  }, [onConfigChange])

  const saveConfig = useCallback((newConfig) => {
    setAiConfig(newConfig)
    localStorage.setItem('aiTranslationConfig', JSON.stringify(newConfig))
    onConfigChange?.(newConfig)
  }, [onConfigChange])

  const isConfigValid = useCallback(() => aiConfig.apiKey && aiConfig.url && aiConfig.model, [aiConfig])

  const exportConfig = useCallback(() => {
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
  }, [aiConfig])

  const importConfig = useCallback((event, onError, onSuccess) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      onError?.('Invalid file type')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        let configToImport = imported.config || imported
        if (typeof configToImport !== 'object' || !configToImport) {
          throw new Error('Invalid configuration format')
        }
        const newConfig = {
          ...DEFAULT_CONFIG,
          ...configToImport
        }
        saveConfig(newConfig)
        onSuccess?.()
      } catch {
        onError?.('Import failed')
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.onerror = () => {
      onError?.('File read error')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }, [saveConfig])

  const resetConfig = useCallback(() => {
    saveConfig(DEFAULT_CONFIG)
  }, [saveConfig])

  return {
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
  }
}


