function Fab({
  children,
  icon,
  color = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const IconComponent = icon
  const isIconOnly = !children && icon

  const classes = [
    'fab',
    `fab--${color}`,
    `fab--${size}`,
    isIconOnly ? 'fab--icon-only' : '',
    disabled ? 'fab--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 24

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={classes} {...props}>
      {icon && <IconComponent size={iconSize} className="fab__icon" />}
      {children && <span className="fab__text">{children}</span>}
    </button>
  )
}

export default Fab
