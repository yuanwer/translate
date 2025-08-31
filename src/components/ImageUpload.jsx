import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const ImageUpload = forwardRef(function ImageUpload({ onImageUpload, onError, isProcessing = false, onReset }, ref) {
  const { t } = useTranslation()
  const [dragActive, setDragActive] = useState(false)
  const [hasSelectedImage, setHasSelectedImage] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = useCallback((files) => {
    const file = files[0]
    if (!file) return

    try {
      if (!file.type.startsWith('image/')) {
        onError(t('errors.file.notImageFile'))
        return
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        onError(t('errors.file.unsupportedFormat'))
        return
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        onError(t('errors.file.fileTooLarge'))
        return
      }

      setHasSelectedImage(true)
      onImageUpload(file)
    } catch (error) {
      onError(`${t('errors.file.processError')}: ${error.message}`)
    }
  }, [onImageUpload, onError, t])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile()
        handleFiles([blob])
        break
      }
    }
  }, [handleFiles])

  const resetSelection = useCallback(() => {
    setHasSelectedImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onReset) {
      onReset()
    }
  }, [onReset])

  // 暴露 fileInputRef 和 resetSelection 方法给父组件
  useImperativeHandle(ref, () => ({
    fileInputRef: fileInputRef.current,
    resetSelection,
    triggerFileSelect: () => fileInputRef.current?.click()
  }), [resetSelection])

  useEffect(() => {
    const handleGlobalPaste = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        return
      }
      handlePaste(e)
    }

    document.addEventListener('paste', handleGlobalPaste)
    return () => {
      document.removeEventListener('paste', handleGlobalPaste)
    }
  }, [handlePaste])

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={isProcessing}
      />

      {hasSelectedImage ? (
        /* 已选择图片 - 不显示任何内容 */
        null
      ) : (
        /* 未选择图片 - 显示完整上传区域 */
        <>
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 bg-white'
              }
              ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
            style={{ cursor: isProcessing ? 'default' : 'pointer' }}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 text-gray-400">
                <i className="fas fa-cloud-upload-alt text-4xl"></i>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">{t('ocr.uploadImage')}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {t('ocr.uploadInstructions')}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {t('ocr.supportedFormats')}
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="mt-4"
              >
                <i className="fas fa-folder-open mr-2"></i>
                {t('ocr.selectImage')}
              </Button>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-2"></i>
                  <p className="text-sm text-gray-600">{t('ocr.processingImage')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-info-circle text-blue-600 mr-3"></i>
              <span className="text-sm text-blue-800">
                {t('ocr.recognitionTip')}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
})