import * as React from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const MarkdownRenderer = React.forwardRef(({ 
  children, 
  className = "",
  minHeight = "min-h-[300px]",
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`${minHeight} w-full p-3 text-sm text-gray-800 overflow-auto ${className}`.trim()}
      {...props}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 表格样式
          table: ({ children }) => (
            <table className="w-full border-collapse border border-gray-300 my-4">
              {children}
            </table>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-3 py-2 text-gray-700">
              {children}
            </td>
          ),
          // 列表样式
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-2 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-2 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-800">
              {children}
            </li>
          ),
          // 段落样式
          p: ({ children }) => (
            <p className="my-2 leading-relaxed">
              {children}
            </p>
          ),
          // 标题样式
          h1: ({ children }) => (
            <h1 className="text-xl font-bold my-3 text-gray-900">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold my-2 text-gray-900">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium my-2 text-gray-900">
              {children}
            </h3>
          ),
          // 代码块样式
          code: ({ inline, children }) => 
            inline ? (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className="block bg-gray-100 p-2 rounded text-sm font-mono my-2 overflow-x-auto">
                {children}
              </code>
            ),
          // 粗体和斜体
          strong: ({ children }) => (
            <strong className="font-semibold">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),
          // 引用块
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 my-3 italic text-gray-600">
              {children}
            </blockquote>
          ),
          // 水平线
          hr: () => (
            <hr className="my-4 border-gray-300" />
          )
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
})

MarkdownRenderer.displayName = "MarkdownRenderer"

export { MarkdownRenderer }