export function DiffText({ text, corrections = [], isOriginal = true, renderWrapper = (children) => children, title = '' }) {
  if (!corrections || corrections.length === 0) {
    return renderWrapper(<span className="whitespace-pre-wrap">{text}</span>)
  }

  const segments = []
  let lastIndex = 0

  corrections.forEach((correction, index) => {
    const { original, corrected } = correction
    const targetText = isOriginal ? original : corrected
    if (!targetText) return

    const searchIndex = text.indexOf(targetText, lastIndex)
    if (searchIndex !== -1) {
      if (searchIndex > lastIndex) {
        segments.push(
          <span key={`text-${index}`}>{text.substring(lastIndex, searchIndex)}</span>
        )
      }
      segments.push(
        <span
          key={`diff-${index}`}
          className={`px-1 rounded ${isOriginal ? 'bg-red-100 text-red-800 line-through' : 'bg-green-100 text-green-800'}`}
          title={title}
        >
          {targetText}
        </span>
      )
      lastIndex = searchIndex + targetText.length
    }
  })

  if (lastIndex < text.length) {
    segments.push(<span key="text-end">{text.substring(lastIndex)}</span>)
  }

  return renderWrapper(
    <span className="whitespace-pre-wrap leading-relaxed text-sm text-gray-800">{segments.length > 0 ? segments : text}</span>
  )
}

export default DiffText


