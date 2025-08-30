import { useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'

export function EnhancedTextInput({ 
  value, 
  onChange, 
  placeholder,
  className = "",
  disabled = false
}) {
  const textareaRef = useRef(null)

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`min-h-[300px] resize-none ${className}`}
      />
    </div>
  )
}