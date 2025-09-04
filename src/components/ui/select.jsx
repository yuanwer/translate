import * as React from "react"
import { useState, useRef, useEffect } from "react"

const SelectRoot = ({ children, className = "", ...props }) => (
  <div className={`relative ${className}`} {...props}>{children}</div>
)

const SelectButton = React.forwardRef(({ onClick, disabled, isOpen, className = "", children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`
      flex h-12 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-left
      ${disabled 
        ? 'cursor-not-allowed opacity-50' 
        : 'cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      }
      ${isOpen ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : ''}
      transition-all duration-200
    `.replace(/\s+/g, ' ').trim()}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-labelledby="select-label"
    {...props}
  >
    {children}
  </button>
))
SelectButton.displayName = "SelectButton"

const SelectList = React.forwardRef(({ children, className = "", ...props }, ref) => (
  <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto focus:outline-none">
    <ul ref={ref} role="listbox" aria-labelledby="select-label" className={className} {...props}>
      {children}
    </ul>
  </div>
))
SelectList.displayName = "SelectList"

const Select = React.forwardRef(({ 
  className = "", 
  value, 
  onValueChange, 
  placeholder = "请选择...",
  disabled = false,
  children,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  const options = React.Children.toArray(children).filter(child => 
    child.type === SelectItem
  )

  const selectedOption = options.find(option => option.props.value === selectedValue)

  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  const handleSelect = React.useCallback((optionValue) => {
    setSelectedValue(optionValue)
    setIsOpen(false)
    setHighlightedIndex(-1)
    onValueChange?.(optionValue)
  }, [onValueChange])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setHighlightedIndex(-1)
          break
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (highlightedIndex >= 0) {
            const option = options[highlightedIndex]
            handleSelect(option.props.value)
          }
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, highlightedIndex, options, handleSelect])

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex]
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest'
        })
      }
    }
  }, [highlightedIndex, isOpen])


  const toggleOpen = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    if (!isOpen) {
      const selectedIndex = options.findIndex(option => option.props.value === selectedValue)
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    }
  }

  return (
    <SelectRoot ref={containerRef} className={className} {...props}>
      <SelectButton ref={ref} onClick={toggleOpen} disabled={disabled} isOpen={isOpen}>
        <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
          {selectedOption ? selectedOption.props.children : placeholder}
        </span>
        <svg
          className={`ml-2 h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </SelectButton>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setIsOpen(false)
              setHighlightedIndex(-1)
            }}
          />
          <SelectList ref={listRef}>
            {options.map((option, index) => (
              <li
                key={option.props.value}
                role="option"
                aria-selected={option.props.value === selectedValue}
                className={`
                  relative cursor-pointer select-none py-2 px-3 text-sm
                  ${option.props.value === selectedValue 
                    ? 'bg-blue-600 text-white' 
                    : index === highlightedIndex 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'text-gray-900 hover:bg-gray-50'
                  }
                  transition-colors duration-150
                `.replace(/\s+/g, ' ').trim()}
                onClick={() => handleSelect(option.props.value)}
              >
                <span className="block truncate font-normal">
                  {option.props.children}
                </span>
                {option.props.value === selectedValue && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-white">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </SelectList>
        </>
      )}
    </SelectRoot>
  )
})
Select.displayName = "Select"

const SelectItem = ({ value, children, disabled = false, ...props }) => (
  <option value={value} disabled={disabled} {...props}>
    {children}
  </option>
)
SelectItem.displayName = "SelectItem"

const SelectTrigger = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
)
SelectContent.displayName = "SelectContent"

const SelectValue = ({ placeholder = "", className = "", ...props }) => (
  <span className={`pointer-events-none ${className}`} {...props}>
    {placeholder}
  </span>
)
SelectValue.displayName = "SelectValue"

export {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectRoot,
  SelectButton,
  SelectList,
}