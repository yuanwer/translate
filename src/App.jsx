import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { translateService } from './services/translateService'
import { ocrService } from './services/ocrService'
import ServiceConfig from './components/ServiceConfig'
import { EnhancedTextInput } from './components/EnhancedTextInput'
import ImageTranslation from './components/ImageTranslation'
import LanguageSwitcher from './components/LanguageSwitcher'
import TabNavigation from './components/TabNavigation'
import LanguageTabs from './components/LanguageTabs'
import { Button } from '@/components/ui/button'
import { Select, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Modal } from '@/components/ui/modal'
import '@fortawesome/fontawesome-free/css/all.min.css'

function App() {
  const { t } = useTranslation()
  // 文本翻译相关状态
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('zh-CN')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoSwitchLang, setAutoSwitchLang] = useState(true)
  const [detectedLanguage, setDetectedLanguage] = useState('')
  
  // 全局应用状态
  const [serviceConfig, setServiceConfig] = useState({})
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [activeTab, setActiveTab] = useState('text')
  const [_OcrPreWarmStatus, setOcrPreWarmStatus] = useState({ isPreWarming: false, isReady: false, hasError: false })

  const languages = translateService.getSupportedLanguages()

  // 检测文本中中文字符的比例
  const detectChineseRatio = (text) => {
    if (!text || text.trim().length === 0) return 0
    
    const chineseRegex = /[\u4e00-\u9fff]/g
    const chineseMatches = text.match(chineseRegex) || []
    const totalChars = text.replace(/\s/g, '').length // 排除空格
    
    return totalChars > 0 ? chineseMatches.length / totalChars : 0
  }

  // 预判断源语言类型，用于智能切换
  const predictSourceLanguage = (text) => {
    const chineseRatio = detectChineseRatio(text)
    
    // 如果中文字符比例超过30%，认为是中文文本
    if (chineseRatio > 0.3) {
      return 'zh'
    }
    
    // 否则假设为英文（在auto模式下让API自己检测）
    return 'en'
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return
    
    console.log('开始翻译，当前配置:', serviceConfig)
    console.log('配置中的apiKey:', serviceConfig.apiKey ? '已配置' : '未配置')
    
    // 智能语言切换的预判断
    let actualTargetLang = targetLang
    if (autoSwitchLang && sourceLang === 'auto') {
      const predictedLang = predictSourceLanguage(inputText)
      
      // 预测是中文，目标语言应该是英文
      if (predictedLang === 'zh' && targetLang !== 'en') {
        actualTargetLang = 'en'
      }
      // 预测是英文，目标语言应该是中文
      else if (predictedLang === 'en' && targetLang !== 'zh-CN') {
        actualTargetLang = 'zh-CN'
      }
    }
    
    setIsLoading(true)
    setError('')
    try {
      const result = await translateService.translate(
        inputText,
        sourceLang,
        actualTargetLang, // 使用预计算的目标语言
        serviceConfig
      )
      setOutputText(result.translatedText)
      
      // 更新检测到的语言信息
      if (result.detectedSourceLanguage) {
        setDetectedLanguage(result.detectedSourceLanguage)
        
        // 智能语言切换UI状态更新（已经在翻译中使用了正确的目标语言）
        if (autoSwitchLang && sourceLang === 'auto') {
          const detected = result.detectedSourceLanguage.toLowerCase()
          
          // 检测到中文，确保UI显示目标语言为英文
          if (detected === 'zh' || detected === 'zh-cn' || detected === 'zh-tw') {
            if (targetLang !== 'en') {
              setTargetLang('en')
            }
          }
          // 检测到英文，确保UI显示目标语言为中文  
          else if (detected === 'en') {
            if (targetLang !== 'zh-CN') {
              setTargetLang('zh-CN')
            }
          }
        }
        
        // 如果是自动检测，更新源语言显示
        if (sourceLang === 'auto') {
          setSourceLang(result.detectedSourceLanguage)
        }
      }
    } catch (error) {
      console.error('Translation error:', error)
      let errorMessage = error.message
      
      if (error.message.includes('AI翻译需要配置API密钥')) {
        errorMessage = t('messages.apiKeyRequired')
      }
      
      setError(errorMessage)
      setOutputText('')
    } finally {
      setIsLoading(false)
    }
  }

  const swapLanguages = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang)
      setTargetLang(sourceLang)
      setInputText(outputText)
      setOutputText(inputText)
    }
  }


  const handleConfigChange = useCallback((newConfig) => {
    console.log('配置已更新:', newConfig)
    setServiceConfig(newConfig)
    // 更新智能切换设置
    if (newConfig.autoSwitchLang !== undefined) {
      setAutoSwitchLang(newConfig.autoSwitchLang)
    }
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
        setAutoSwitchLang(config.autoSwitchLang)
        
        // 保存更新后的配置（包含迁移的设置）
        localStorage.setItem('aiTranslationConfig', JSON.stringify(config))
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    }


    const startOCRPreWarming = async () => {
      // 延迟500ms启动预热，让界面先渲染完成
      setTimeout(async () => {
        setOcrPreWarmStatus({ isPreWarming: true, isReady: false, hasError: false })
        
        // 开始静默预热
        await ocrService.preWarm('chi_sim+eng')
        
        // 更新状态
        const status = ocrService.getPreWarmStatus()
        setOcrPreWarmStatus(status)
        
        if (status.isReady) {
          console.log('OCR预热完成，用户可以无感知快速识别图片')
        }
      }, 500)
    }

    loadSavedConfig()
    startOCRPreWarming()

    return () => {
      ocrService.terminate()
    }
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
                size="icon"
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
          <>
            {/* 文本翻译 - 语言选择区域 */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex items-center justify-between">
                {/* 源语言标签区域 */}
                <div className="flex-1 min-w-0">
                  <LanguageTabs
                    languages={languages}
                    selectedLanguage={sourceLang}
                    onLanguageChange={setSourceLang}
                    isSource={true}
                    className="h-12"
                  />
                </div>
                
                {/* 语言交换按钮 */}
                <div className="flex items-center justify-center px-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={swapLanguages}
                    disabled={sourceLang === 'auto'}
                    className="w-10 h-10 rounded-full disabled:opacity-50 text-gray-600 hover:bg-gray-100"
                    title={t('language.swap')}
                  >
                    <i className="fas fa-exchange-alt"></i>
                  </Button>
                </div>
                
                {/* 目标语言标签区域 */}
                <div className="flex-1 min-w-0">
                  <LanguageTabs
                    languages={languages.filter(lang => lang.code !== 'auto')}
                    selectedLanguage={targetLang}
                    onLanguageChange={setTargetLang}
                    isSource={false}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* 文本翻译 - 状态提示区域 */}
            {error && (
              <div className="mb-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-3">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 文本翻译 - 主翻译区域 */}
            <div className="grid lg:grid-cols-2 gap-0 border border-gray-300 rounded-lg overflow-hidden">
              {/* 左侧输入区域 */}
              <div className="bg-white relative">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 uppercase">
                      {sourceLang === 'auto' ? t('language.detectLanguage', '检测语言') : (languages.find(lang => lang.code === sourceLang)?.name || sourceLang)}
                    </span>
                    {detectedLanguage && sourceLang === 'auto' && (
                      <span className="text-xs text-blue-600">
                        {t('language.detected')}: {languages.find(lang => lang.code === detectedLanguage)?.name || detectedLanguage}
                      </span>
                    )}
                  </div>
                  <EnhancedTextInput
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t('translation.inputPlaceholder', '输入文本')}
                    disabled={isLoading}
                    className="border-0"
                  />
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-gray-400 text-xs">
                  <span>{inputText.length} / 5000</span>
                </div>
              </div>

              {/* 右侧输出区域 */}
              <div className="bg-white border-l border-gray-300 relative">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 uppercase">
                      {languages.find(lang => lang.code === targetLang)?.name || targetLang}
                    </span>
                    {outputText && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard?.writeText(outputText)}
                          className="text-gray-500 hover:text-gray-700"
                          title="复制"
                        >
                          <i className="fas fa-copy text-xs"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="text-gray-400 cursor-not-allowed"
                          title="朗读（待实现）"
                        >
                          <i className="fas fa-volume-up text-xs"></i>
                        </Button>
                      </div>
                    )}
                  </div>
                  <Textarea
                    value={outputText}
                    readOnly
                    placeholder={isLoading ? t('translation.translating', '翻译中...') : t('translation.outputPlaceholder', '翻译结果')}
                    className="min-h-[300px] resize-none border-0 bg-transparent text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* 文本翻译 - 翻译按钮 */}
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleTranslate}
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
              >
                {isLoading ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>{t('translation.translating', '翻译中...')}</>
                ) : (
                  <><i className="fas fa-language mr-2"></i>{t('translation.translateButton', '翻译')}</>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* 图片翻译模式 */}
            <ImageTranslation 
              serviceConfig={serviceConfig}
              languages={languages}
            />
          </>
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
