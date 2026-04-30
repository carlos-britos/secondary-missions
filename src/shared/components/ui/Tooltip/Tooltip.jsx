function Tooltip({ text, position = 'top', children, className = '' }) {
  if (!text) return children

  return (
    <span
      className={`tooltip tooltip--${position}${className ? ` ${className}` : ''}`}
      data-tooltip={text}
    >
      {children}
    </span>
  )
}

export default Tooltip
