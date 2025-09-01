import { useTranslation } from 'react-i18next'
import LanguageTabs from './LanguageTabs'
import { Button } from '@/components/ui/button'

/**
 * 语言选择区域组件
 * 包含源语言选择、目标语言选择和语言交换按钮
 */
const LanguageSelector = ({ 
  languages,
  sourceLang,
  targetLang,
  onSourceLangChange,
  onTargetLangChange,
  onSwapLanguages,
  detectedLanguage,
  className = "border-b border-gray-200"
}) => {
  const { t } = useTranslation()

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        {/* 源语言标签区域 */}
        <div className="flex-1 min-w-0">
          <LanguageTabs
            languages={languages}
            selectedLanguage={sourceLang}
            onLanguageChange={onSourceLangChange}
            isSource={true}
            className="h-12"
          />
        </div>
        
        {/* 语言交换按钮 */}
        <div className="flex items-center justify-center px-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSwapLanguages}
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
            onLanguageChange={onTargetLangChange}
            isSource={false}
            className="h-12"
          />
        </div>
      </div>
      
      {/* 检测到的语言提示 */}
      {detectedLanguage && sourceLang === 'auto' && (
        <div className="px-4 pb-2">
          <span className="text-xs text-blue-600">
            {t('language.detected')}: {languages.find(lang => lang.code === detectedLanguage)?.name || detectedLanguage}
          </span>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector