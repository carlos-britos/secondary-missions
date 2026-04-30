import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

function CollapsibleSection({
  title,
  summary,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onToggle,
  children,
  className = '',
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)

  const isControlled = controlledExpanded !== undefined
  const expanded = isControlled ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.(!expanded)
    } else {
      setInternalExpanded((prev) => {
        const next = !prev
        onToggle?.(next)
        return next
      })
    }
  }

  const classes = [
    'collapsible-section',
    expanded ? 'collapsible-section--expanded' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <button type="button" className="collapsible-section__header" onClick={handleToggle}>
        <span className="collapsible-section__title">{title}</span>
        {!expanded && summary && <span className="collapsible-section__summary">{summary}</span>}
        <ChevronDown size={18} className="collapsible-section__toggle-icon" />
      </button>
      <div className="collapsible-section__body">
        <div className="collapsible-section__content">{children}</div>
      </div>
    </div>
  )
}

export default CollapsibleSection
