import { useRef, useEffect, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'

export function EnhancedTextInput({ 
  value, 
  onChange, 
  placeholder,
  className = "",
  disabled = false,
  autoFocus = false,
  showCharCount = true,
  onSubmit,      // Ctrl/Cmd + Enter
  onClear,       // Ctrl/Cmd + L
  onSwap         // Ctrl/Cmd + Shift + S
}) {
  const textareaRef = useRef(null)

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const createSyntheticEvent = useCallback((nextValue) => ({ target: { value: nextValue }}), [])

  const handleKeyDown = useCallback((e) => {
    // Mac/Win 通用的修饰键判断
    const isPrimary = e.ctrlKey || e.metaKey

    if (!isPrimary) return

    // Ctrl/Cmd + Enter => 提交（翻译）
    if (e.key === 'Enter') {
      if (typeof onSubmit === 'function') {
        e.preventDefault()
        onSubmit()
      }
      return
    }

    // Ctrl/Cmd + L => 清空
    if (e.key.toLowerCase() === 'l') {
      if (typeof onClear === 'function') {
        e.preventDefault()
        onClear()
      } else if (typeof onChange === 'function') {
        e.preventDefault()
        onChange(createSyntheticEvent(''))
      }
      return
    }

    // Ctrl/Cmd + Shift + S => 交换语言
    if (e.key.toLowerCase() === 's' && e.shiftKey) {
      if (typeof onSwap === 'function') {
        e.preventDefault()
        onSwap()
      }
      return
    }
  }, [onSubmit, onClear, onSwap, onChange, createSyntheticEvent])

  return (
    <div className="relative h-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`min-h-[300px] h-full resize-none ${className}`}
      />

      {showCharCount && (
        <div className="pointer-events-none select-none absolute bottom-2 right-3 text-xs text-gray-400">
          {value?.length || 0}
        </div>
      )}
    </div>
  )
}