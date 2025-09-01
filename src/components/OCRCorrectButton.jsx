import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../hooks/useToast'
import { Button } from '@/components/ui/button'
import { ocrCorrectService } from '../services/ocrCorrectService'
import TextDiffViewer from './TextDiffViewer'

export function OCRCorrectButton({ 
  recognizedText, 
  onTextCorrected, 
  serviceConfig,
  disabled = false
}) {
  const { t } = useTranslation()
  const { error: showError, success } = useToast()
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [correctionResult, setCorrectionResult] = useState(null)

  const handleCorrection = async () => {
    if (!recognizedText || recognizedText.trim().length === 0) {
      showError(t('ocrCorrect.emptyTextError'))
      return
    }

    setIsCorrecting(true)
    
    try {
      const result = await ocrCorrectService.correctText(recognizedText, serviceConfig)
      
      setCorrectionResult(result)
      
      if (result.hasChanges && result.confidence > 0) {
        // 显示差异对比界面
        setShowDiffModal(true)
      } else {
        // 没有发现需要修正的内容
        success(t('ocrCorrect.noCorrectionsFound'))
      }
    } catch (error) {
      console.error('OCR Correction Error:', error)
      showError(error.message)
    } finally {
      setIsCorrecting(false)
    }
  }

  const handleAcceptCorrections = async () => {
    if (correctionResult && onTextCorrected) {
      onTextCorrected(correctionResult.correctedText, correctionResult.corrections)
      success(t('ocrCorrect.correctionsApplied'))
      setShowDiffModal(false)
      setCorrectionResult(null)
    }
  }

  const handleRejectCorrections = () => {
    setShowDiffModal(false)
    setCorrectionResult(null)
  }

  const getButtonConfig = () => {
    if (isCorrecting) {
      return {
        icon: 'fas fa-spinner fa-spin',
        className: 'text-purple-500 cursor-not-allowed'
      }
    }

    return {
      icon: 'fas fa-tools',
      className: 'text-purple-600 hover:text-purple-700'
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCorrection}
        disabled={disabled || isCorrecting || !recognizedText?.trim()}
        className={buttonConfig.className}
        title={t('ocrCorrect.correctButtonTooltip')}
      >
        <i className={`${buttonConfig.icon} text-xs`}></i>
      </Button>

      {/* 文本差异对比模态框 */}
      {correctionResult && (
        <TextDiffViewer
          isOpen={showDiffModal}
          onClose={handleRejectCorrections}
          originalText={recognizedText}
          correctedText={correctionResult.correctedText}
          corrections={correctionResult.corrections}
          confidence={correctionResult.confidence}
          onAccept={handleAcceptCorrections}
          onReject={handleRejectCorrections}
        />
      )}
    </>
  )
}

export default OCRCorrectButton