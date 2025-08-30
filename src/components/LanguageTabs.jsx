import { useState } from 'react'
import { Modal } from './ui/modal'

const LanguageTabs = ({ 
  languages, 
  selectedLanguage, 
  onLanguageChange, 
  isSource = false,
  className = "" 
}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false)

  // 根据isSource参数决定显示的常用语言
  const getCommonLanguages = () => {
    if (isSource) {
      // 源语言常用选项：检测语言、英语、中文简体
      const commonSourceLangs = ['auto', 'en', 'zh-CN']
      return languages.filter(lang => commonSourceLangs.includes(lang.code))
    } else {
      // 目标语言常用选项：中文简体、英语、日语
      const commonTargetLangs = ['zh-CN', 'en', 'ja']
      return languages.filter(lang => commonTargetLangs.includes(lang.code))
    }
  }

  // 获取其他语言（不包括常用的3个）
  const getOtherLanguages = () => {
    const commonCodes = getCommonLanguages().map(lang => lang.code)
    return languages.filter(lang => !commonCodes.includes(lang.code))
  }

  const commonLanguages = getCommonLanguages()
  const otherLanguages = getOtherLanguages()

  // 检查当前选中的语言是否在常用语言中
  const isSelectedInCommon = commonLanguages.some(lang => lang.code === selectedLanguage)

  const handleMoreClick = () => {
    setShowLanguageModal(true)
  }

  const handleLanguageSelect = (langCode) => {
    onLanguageChange(langCode)
    setShowLanguageModal(false)
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* 语言标签容器 */}
      <div className="flex gap-1 px-2">
        {/* 常用语言标签 */}
        {commonLanguages.map((lang) => {
          const isActive = selectedLanguage === lang.code
          
          return (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`
                relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer
                ${isActive 
                  ? 'text-blue-600 language-tab-active' 
                  : 'text-gray-600 hover:text-gray-800'
                }
                hover:bg-gray-50 rounded-t-md
              `}
            >
              {lang.name}
            </button>
          )
        })}
        
        {/* "更多"按钮 */}
        <button
          onClick={handleMoreClick}
          className={`
            relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer
            ${(!isSelectedInCommon && selectedLanguage !== 'auto') 
              ? 'text-blue-600 language-tab-active' 
              : 'text-gray-600 hover:text-gray-800'
            }
            hover:bg-gray-50 rounded-t-md flex items-center gap-1
          `}
        >
          {(!isSelectedInCommon && selectedLanguage !== 'auto') 
            ? (languages.find(lang => lang.code === selectedLanguage)?.name || '更多')
            : '更多'
          }
          <i className="fas fa-chevron-down text-xs"></i>
        </button>
      </div>

      {/* 语言选择弹窗 */}
      <Modal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title="选择语言"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {otherLanguages.map((lang) => {
              const isSelected = selectedLanguage === lang.code
              
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`
                    w-full text-left px-4 py-3 rounded-md text-sm transition-all duration-150 cursor-pointer
                    ${isSelected 
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                    }
                    flex items-center justify-between
                  `}
                >
                  <span>{lang.name}</span>
                  {isSelected && (
                    <i className="fas fa-check text-blue-600"></i>
                  )}
                </button>
              )
            })}
          </div>
          
          {otherLanguages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无其他语言
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default LanguageTabs