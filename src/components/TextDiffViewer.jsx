import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

export function TextDiffViewer({ 
  isOpen, 
  onClose, 
  originalText, 
  correctedText, 
  corrections, 
  confidence,
  onAccept, 
  onReject 
}) {
  const { t } = useTranslation()
  const [isAccepting, setIsAccepting] = useState(false)

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      await onAccept()
      onClose()
    } finally {
      setIsAccepting(false)
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 8) return 'text-green-600'
    if (confidence >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceText = (confidence) => {
    if (confidence >= 8) return t('ocrCorrect.confidenceHigh')
    if (confidence >= 5) return t('ocrCorrect.confidenceMedium')
    if (confidence >= 1) return t('ocrCorrect.confidenceLow')
    return t('ocrCorrect.noCorrectionsNeeded')
  }

  // 渲染带有高亮差异的文本
  const renderTextWithHighlights = (text, isOriginal = true) => {
    if (!corrections || corrections.length === 0) {
      return text
    }

    const segments = []
    let lastIndex = 0

    corrections.forEach((correction, index) => {
      const { original, corrected } = correction
      const targetText = isOriginal ? original : corrected
      const searchIndex = text.indexOf(targetText, lastIndex)
      
      if (searchIndex !== -1) {
        // 添加差异前的普通文本
        if (searchIndex > lastIndex) {
          segments.push(
            <span key={`text-${index}`}>
              {text.substring(lastIndex, searchIndex)}
            </span>
          )
        }
        
        // 添加高亮的差异文本
        segments.push(
          <span
            key={`diff-${index}`}
            className={`px-1 rounded ${
              isOriginal 
                ? 'bg-red-100 text-red-800 line-through' 
                : 'bg-green-100 text-green-800'
            }`}
            title={isOriginal ? t('ocrCorrect.originalText') : t('ocrCorrect.correctedText')}
          >
            {targetText}
          </span>
        )
        
        lastIndex = searchIndex + targetText.length
      }
    })

    // 添加剩余的普通文本
    if (lastIndex < text.length) {
      segments.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      )
    }

    return segments.length > 0 ? segments : text
  }

  if (!isOpen) return null

  const hasChanges = correctedText !== originalText

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="p-6">
        {/* 标题和置信度 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('ocrCorrect.reviewCorrections')}
          </h2>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('ocrCorrect.confidence')}:</span>
              <span className={`font-medium ${getConfidenceColor(confidence)}`}>
                {confidence}/10 - {getConfidenceText(confidence)}
              </span>
            </div>
          )}
        </div>

        {!hasChanges ? (
          <div className="text-center py-8">
            <i className="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('ocrCorrect.noCorrectionsNeeded')}
            </h3>
            <p className="text-gray-600">
              {t('ocrCorrect.textLooksGood')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 修正统计 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-info-circle text-blue-600"></i>
                <span className="font-medium text-blue-900">
                  {t('ocrCorrect.correctionSummary')}
                </span>
              </div>
              <p className="text-blue-800 text-sm">
                {t('ocrCorrect.foundCorrections', { count: corrections?.length || 0 })}
              </p>
            </div>

            {/* 文本对比区域 */}
            <div className="grid md:grid-cols-2 gap-4 border rounded-lg overflow-hidden">
              {/* 原始文本 */}
              <div className="bg-red-50 border-r border-gray-200">
                <div className="bg-red-100 px-4 py-2 border-b border-red-200">
                  <h3 className="font-medium text-red-900 flex items-center gap-2">
                    <i className="fas fa-eye"></i>
                    {t('ocrCorrect.originalText')}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {renderTextWithHighlights(originalText, true)}
                  </div>
                </div>
              </div>

              {/* 修正后文本 */}
              <div className="bg-green-50">
                <div className="bg-green-100 px-4 py-2 border-b border-green-200">
                  <h3 className="font-medium text-green-900 flex items-center gap-2">
                    <i className="fas fa-magic"></i>
                    {t('ocrCorrect.correctedText')}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {renderTextWithHighlights(correctedText, false)}
                  </div>
                </div>
              </div>
            </div>

            {/* 详细修正列表 */}
            {corrections && corrections.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <i className="fas fa-list"></i>
                  {t('ocrCorrect.detailedCorrections')}
                </h3>
                <div className="space-y-2">
                  {corrections.map((correction, index) => (
                    <div
                      key={index}
                      className="bg-white rounded border p-3 flex items-center gap-3"
                    >
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">
                        {correction.original}
                      </span>
                      <i className="fas fa-arrow-right text-gray-400"></i>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                        {correction.corrected}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onReject}
            className="px-6"
          >
            {hasChanges ? t('ocrCorrect.keepOriginal') : t('common.close')}
          </Button>
          {hasChanges && (
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isAccepting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {t('ocrCorrect.applying')}
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  {t('ocrCorrect.applyCorrections')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default TextDiffViewer