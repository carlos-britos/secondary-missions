import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './TagInput.module.scss'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  maxLength?: number
}

export function TagInput({ value, onChange, maxTags = 5, maxLength = 20 }: TagInputProps) {
  const { t } = useTranslation('missions')
  const [input, setInput] = useState('')

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase()
    if (!tag || tag.length > maxLength || value.includes(tag) || value.length >= maxTags) return
    onChange([...value, tag])
    setInput('')
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.chips}>
        {value.map((tag, i) => (
          <span key={tag} className={styles.chip}>
            {tag}
            <button type="button" className={styles.chipRemove} onClick={() => removeTag(i)}>
              ×
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            type="text"
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            placeholder={value.length === 0 ? t('tags_placeholder') : ''}
          />
        )}
      </div>
    </div>
  )
}
