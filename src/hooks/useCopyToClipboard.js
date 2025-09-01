import { useCallback } from 'react'
import { useToast } from './useToast'
import { useTranslation } from 'react-i18next'

/**
 * 复制到剪贴板的自定义Hook
 * 封装了复制功能和相关的成功/失败提示逻辑
 */
export const useCopyToClipboard = () => {
  const { success } = useToast()
  const { t } = useTranslation()

  const copyToClipboard = useCallback(async (text, successMessage) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        success(successMessage || t('common.copySuccess', '复制成功'))
        return true
      } else {
        // 降级方案：使用传统的复制方式
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          const successful = document.execCommand('copy')
          if (successful) {
            success(successMessage || t('common.copySuccess', '复制成功'))
            return true
          } else {
            console.error('复制失败: execCommand 返回 false')
            return false
          }
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }, [success, t])

  return { copyToClipboard }
}