import { Calendar } from 'lucide-react'

function Datepicker({
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
    <div className={`datepicker-field ${error ? 'datepicker-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="datepicker-field__label">
          {label}
        </label>
      )}
      <div className="datepicker-field__wrapper">
        <input
          type="date"
          id={inputId}
          name={name}
          disabled={disabled}
          min={min}
          max={max}
          className="datepicker-field__input"
          {...(value !== undefined ? { value, onChange } : {})}
          {...props}
        />
        <span className="datepicker-field__icon">
          <Calendar size={18} />
        </span>
      </div>
      {error && <span className="datepicker-field__error">{error}</span>}
    </div>
  )
}

export default Datepicker
