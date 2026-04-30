import { X } from 'lucide-react'

function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  id,
  disabled = false,
  error,
  className = '',
  variant,
  leftIcon: LeftIcon,
  clearable = false,
  onClear,
  ...props
}) {
  const inputId = id || name
  const hasValue = value && value.length > 0

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (onChange) {
      onChange({ target: { value: '', name } })
    }
  }

  return (
    <div
      className={`input-field ${variant ? `input-field--${variant}` : ''} ${error ? 'input-field--error' : ''} ${LeftIcon ? 'input-field--with-left-icon' : ''} ${clearable ? 'input-field--clearable' : ''} ${className}`}
    >
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}
        </label>
      )}
      <div className="input-field__wrapper">
        {LeftIcon && (
          <span className="input-field__left-icon">
            <LeftIcon size={18} />
          </span>
        )}
        <input
          type={type}
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="input-field__input"
          {...props}
        />
        {clearable && hasValue && !disabled && (
          <button
            type="button"
            className="input-field__clear"
            onClick={handleClear}
            aria-label="Limpiar"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {error && <span className="input-field__error">{error}</span>}
    </div>
  )
}

export default Input
