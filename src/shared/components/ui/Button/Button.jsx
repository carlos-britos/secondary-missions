import { Link } from 'react-router'

function Button({
  children,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  to,
  onClick,
  className = '',
  ...props
}) {
  const IconComponent = icon

  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${color}`,
    `btn--${size}`,
    icon && !children ? 'btn--icon-only' : '',
    disabled ? 'btn--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <IconComponent size={size === 'sm' ? 16 : 20} className="btn__icon" />
      )}
      {children && <span className="btn__text">{children}</span>}
      {icon && iconPosition === 'right' && (
        <IconComponent size={size === 'sm' ? 16 : 20} className="btn__icon" />
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes} {...props}>
      {content}
    </button>
  )
}

export default Button
