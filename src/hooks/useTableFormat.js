import { useState, useCallback } from 'react'
import { translateService } from '../services/translateService'

export function useTableFormat(serviceConfig) {
  const [isTableFormatting, setIsTableFormatting] = useState(false)

  const formatToTable = useCallback(async (text) => {
    if (!text || !text.trim()) return { formattedText: '' }
    setIsTableFormatting(true)
    try {
      const result = await translateService.formatToTable(text, serviceConfig)
      return result
    } finally {
      setIsTableFormatting(false)
    }
  }, [serviceConfig])

  return { isTableFormatting, formatToTable }
}


