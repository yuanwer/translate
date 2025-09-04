import React from 'react'
import { cn } from '@/lib/utils'

const Slider = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  disabled = false,
  className = '',
  showValue = true,
  showLabels = true,
  valueFormatter = (val) => val,
  label,
  ...props
}) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value)
    onChange?.(newValue)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}
      
      <div className="flex items-center gap-3">
        {showLabels && (
          <span className="text-xs text-gray-500 w-8 text-right">
            {valueFormatter(min)}
          </span>
        )}
        
        <div className="relative flex-1">
          {/** 计算进度百分比用于渐变填充 **/}
          {(() => { const _ = null })()}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              "range-slider w-full h-2 rounded-full appearance-none cursor-pointer",
              "border-none focus:border-none focus:shadow-none",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            style={{
              background: `linear-gradient(to right, var(--sm-primary) 0%, var(--sm-primary) ${((value - min) / (max - min)) * 100}%, #E6E6E6 ${((value - min) / (max - min)) * 100}%, #E6E6E6 100%)`
            }}
            {...props}
          />
        </div>
        
        {showLabels && (
          <span className="text-xs text-gray-500 w-8">
            {valueFormatter(max)}
          </span>
        )}
        
        {showValue && (
          <span className="text-xs font-mono w-12 text-center">
            {valueFormatter(value)}
          </span>
        )}
      </div>
    </div>
  )
}

export { Slider }