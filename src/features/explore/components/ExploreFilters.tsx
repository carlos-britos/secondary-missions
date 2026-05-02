import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExploreFilters as Filters, ExploreSortBy, MissionRarity, MissionType } from '../types'
import styles from './ExploreFilters.module.scss'

interface ExploreFiltersProps {
  filters: Filters
  globalTags: string[]
  onUpdate: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  onReset: () => void
}

const RARITIES: (MissionRarity | null)[] = [null, 'common', 'rare', 'epic', 'legendary']
const TYPES: (MissionType | null)[] = [null, 'one_time', 'weekly']
const SORTS: ExploreSortBy[] = ['recent', 'most_adopted', 'random']

export function ExploreFilters({ filters, globalTags, onUpdate, onReset }: ExploreFiltersProps) {
  const { t } = useTranslation('explore')
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const tagRef = useRef<HTMLDivElement>(null)

  const hasActiveFilters =
    filters.search || filters.rarity || filters.type || filters.tags.length > 0

  const filteredTags = globalTags.filter(
    (tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !filters.tags.includes(tag)
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setShowTagSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const addTag = (tag: string) => {
    onUpdate('tags', [...filters.tags, tag])
    setTagInput('')
    setShowTagSuggestions(false)
  }

  const removeTag = (tag: string) => {
    onUpdate(
      'tags',
      filters.tags.filter((t) => t !== tag)
    )
  }

  return (
    <div className={styles.filters}>
      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('search_placeholder')}
          value={filters.search}
          onChange={(e) => onUpdate('search', e.target.value)}
        />
        {hasActiveFilters && (
          <button type="button" className={styles.clearBtn} onClick={onReset}>
            {t('clear_filters')}
          </button>
        )}
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>{t('filter_rarity')}</span>
          <div className={styles.chips}>
            {RARITIES.map((r) => (
              <button
                key={r ?? 'all'}
                type="button"
                className={`${styles.chip} ${filters.rarity === r ? styles.chipActive : ''} ${r ? styles[r] : ''}`}
                onClick={() => onUpdate('rarity', r)}
              >
                {r ? t(`rarity_${r}`) : t('all_rarities')}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>{t('filter_type')}</span>
          <div className={styles.chips}>
            {TYPES.map((tp) => (
              <button
                key={tp ?? 'all'}
                type="button"
                className={`${styles.chip} ${filters.type === tp ? styles.chipActive : ''}`}
                onClick={() => onUpdate('type', tp)}
              >
                {tp ? t(`type_${tp}`) : t('all_types')}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>{t('filter_sort')}</span>
          <div className={styles.chips}>
            {SORTS.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.chip} ${filters.sortBy === s ? styles.chipActive : ''}`}
                onClick={() => onUpdate('sortBy', s)}
              >
                {t(`sort_${s}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {globalTags.length > 0 && (
        <div className={styles.tagSection} ref={tagRef}>
          <div className={styles.tagInputWrap}>
            <input
              type="text"
              className={styles.tagSearchInput}
              placeholder={t('tags_placeholder')}
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value)
                setShowTagSuggestions(true)
              }}
              onFocus={() => setShowTagSuggestions(true)}
            />
            {showTagSuggestions && filteredTags.length > 0 && (
              <div className={styles.tagDropdown}>
                {filteredTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={styles.tagOption}
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          {filters.tags.length > 0 && (
            <div className={styles.activeTags}>
              {filters.tags.map((tag) => (
                <span key={tag} className={styles.activeTag}>
                  {tag}
                  <button type="button" className={styles.removeTag} onClick={() => removeTag(tag)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
