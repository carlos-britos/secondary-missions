import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'

function Select({
  label,
  placeholder = 'Selecciona una opción',
  value,
  onChange,
  options = [],
  name,
  id,
  disabled = false,
  error,
  className = '',
}) {
  const selectId = id || name
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const selectedOption = options.find((opt) => String(opt.value) === String(value))
  const displayValue = isOpen ? searchTerm : (selectedOption?.label ?? '')

  const filteredOptions = isOpen
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  const emitChange = useCallback(
    (newValue) => {
      if (onChange) {
        onChange({ target: { value: newValue, name } })
      }
    },
    [onChange, name]
  )

  const open = useCallback(() => {
    if (disabled) return
    setIsOpen(true)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }, [disabled])

  const close = useCallback(() => {
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }, [])

  const selectOption = useCallback(
    (option) => {
      emitChange(option.value)
      close()
    },
    [emitChange, close]
  )

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen, close])

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return
    const item = listRef.current.children[highlightedIndex]
    if (item) {
      item.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  function handleInputChange(e) {
    setSearchTerm(e.target.value)
    setHighlightedIndex(-1)
    if (!isOpen) setIsOpen(true)
  }

  function handleInputClick() {
    if (!isOpen) {
      open()
    }
  }

  function handleInputFocus() {
    if (!isOpen) {
      open()
    }
  }

  function handleKeyDown(e) {
    if (disabled) return

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        if (!isOpen) {
          open()
          return
        }
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        if (!isOpen) return
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
        break
      }
      case 'Enter': {
        e.preventDefault()
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex])
        } else if (!isOpen) {
          open()
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        close()
        break
      }
      case 'Tab': {
        if (isOpen) {
          close()
        }
        break
      }
    }
  }

  return (
    <div
      className={`select-field ${error ? 'select-field--error' : ''} ${className}`}
      ref={containerRef}
    >
      {label && (
        <label htmlFor={selectId} className="select-field__label">
          {label}
        </label>
      )}
      <div className="select-field__wrapper">
        <input
          ref={inputRef}
          type="text"
          id={selectId}
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className={`select-field__input ${!isOpen && selectedOption ? '' : 'select-field__input--placeholder'}`}
          readOnly={false}
        />
        <ChevronDown
          size={18}
          className={`select-field__icon ${isOpen ? 'select-field__icon--open' : ''}`}
          onClick={() => {
            if (disabled) return
            if (isOpen) {
              close()
            } else {
              open()
              inputRef.current?.focus()
            }
          }}
        />
        {isOpen && (
          <ul ref={listRef} className="select-field__dropdown" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={String(option.value) === String(value)}
                  className={`select-field__option ${
                    String(option.value) === String(value) ? 'select-field__option--selected' : ''
                  } ${index === highlightedIndex ? 'select-field__option--highlighted' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectOption(option)
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="select-field__no-results">Sin resultados</li>
            )}
          </ul>
        )}
      </div>
      {error && <span className="select-field__error">{error}</span>}
    </div>
  )
}

export default Select
