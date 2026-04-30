import { Clock } from 'lucide-react'

function Timepicker({
  label,
  value,
  onChange,
  name,
  id,
  disabled = false,
  error,
  className = '',
  min,
  max,
  ...props
}) {
  const inputId = id || name

  return (
    <div className={`timepicker-field ${error ? 'timepicker-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="timepicker-field__label">
          {label}
        </label>
      )}
      <div className="timepicker-field__wrapper">
        <input
          type="time"
          id={inputId}
          name={name}
          disabled={disabled}
          min={min}
          max={max}
          className="timepicker-field__input"
          {...(value !== undefined ? { value, onChange } : {})}
          {...props}
        />
        <span className="timepicker-field__icon">
          <Clock size={18} />
        </span>
      </div>
      {error && <span className="timepicker-field__error">{error}</span>}
    </div>
  )
}

export default Timepicker
