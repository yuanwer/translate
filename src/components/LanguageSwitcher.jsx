import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Select, SelectItem } from '@/components/ui/select'

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation()

  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode)
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleLanguageChange(i18n.language === 'zh' ? 'en' : 'zh')}
        className="flex items-center gap-2 px-3 py-1.5 h-8"
        title={t('language.switch')}
      >
        <span className="text-sm">{currentLanguage.flag}</span>
        <span className="text-xs font-medium">{currentLanguage.name}</span>
        <i className="fas fa-exchange-alt text-xs"></i>
      </Button>
    </div>
  )
}

export default LanguageSwitcher