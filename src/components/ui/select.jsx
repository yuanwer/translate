import * as React from "react"

const Select = React.forwardRef(({ className = "", value, onValueChange, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={`flex h-12 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = "Select"

const SelectItem = ({ value, children, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
)
SelectItem.displayName = "SelectItem"

// 兼容性组件 - 在简化版本中不需要，但保持接口一致
const SelectTrigger = ({ children }) => children
const SelectContent = ({ children }) => children
const SelectValue = () => null

export {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
}