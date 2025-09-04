import { useTranslation } from 'react-i18next'
import { ImageUpload } from './ImageUpload'
import LanguageSelector from './LanguageSelector'
import TranslationPanel from './TranslationPanel'
import OCRCorrectButton from './OCRCorrectButton'
import { StatusAlert } from '@/components/ui/status-alert'
import { Button } from '@/components/ui/button'
import { useImageTranslation } from '@/hooks/useImageTranslation'

export function ImageTranslation({ serviceConfig, languages }) {
  const { t } = useTranslation()
  const {
    imageUploadRef,
    recognizedText,
    translatedText,
    sourceLang,
    targetLang,
    isOCRProcessing,
    isTranslating,
    ocrProgress,
    error,
    detectedLanguage,
    hasSelectedImage,
    setSourceLang,
    setTargetLang,
    setRecognizedText,
    setTranslatedText,
    handleImageUpload,
    handleOCRError,
    handleTranslate,
    swapLanguages,
    resetImageSelection,
    handleTextCorrected,
    getLanguageName
  } = useImageTranslation(serviceConfig)

  return (
    <div className="space-y-6">
      {/* 语言选择区域 */}
      <LanguageSelector
        languages={languages}
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceLangChange={setSourceLang}
        onTargetLangChange={setTargetLang}
        onSwapLanguages={swapLanguages}
        detectedLanguage={detectedLanguage}
      />

      {/* 状态提示区域 */}
      {ocrProgress && (
        <StatusAlert variant="loading">
          {ocrProgress}
        </StatusAlert>
      )}
      {error && (
        <StatusAlert variant="error">
          {error}
        </StatusAlert>
      )}

      {/* 图片上传区域 - 只在未选择图片时显示 */}
      {!hasSelectedImage && (
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="p-6">
            <ImageUpload
              ref={imageUploadRef}
              onImageUpload={handleImageUpload}
              onError={handleOCRError}
              isProcessing={isOCRProcessing}
              onReset={resetImageSelection}
            />
          </div>
        </div>
      )}

      {/* OCR识别结果和翻译区域 */}
      {recognizedText && (
        <TranslationPanel
          inputValue={recognizedText}
          onInputChange={(e) => setRecognizedText(e.target.value)}
          inputPlaceholder={t('ocr.recognizedText')}
          inputLanguageName={getLanguageName(sourceLang, languages)}
          inputReadOnly={false}
          
          outputValue={translatedText}
          outputPlaceholder={isTranslating ? t('translation.translating', '翻译中...') : t('translation.outputPlaceholder', '翻译结果')}
          outputLanguageName={getLanguageName(targetLang, languages)}
          
          extraInputButtons={[
            <OCRCorrectButton
              key="ocr-correct"
              recognizedText={recognizedText}
              onTextCorrected={(text, corrections) => handleTextCorrected(text, corrections)}
              serviceConfig={serviceConfig}
              disabled={isTranslating}
            />
          ]}
        />
      )}

      {/* 翻译按钮和重新选择按钮 */}
      {recognizedText && (
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleTranslate}
            disabled={!recognizedText.trim() || isTranslating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
          >
            {isTranslating ? (
              <><i className="fas fa-spinner fa-spin mr-2"></i>{t('translation.translating', '翻译中...')}</>
            ) : (
              <><i className="fas fa-language mr-2"></i>{t('translation.translateButton', '翻译')}</>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={resetImageSelection}
            className="px-6 py-3 rounded-full"
          >
            <i className="fas fa-image mr-2"></i>{t('ocr.reselectImage')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ImageTranslation