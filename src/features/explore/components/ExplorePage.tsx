import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useExplore } from '../hooks/useExplore'
import { ExploreFilters } from './ExploreFilters'
import { ExploreCard } from './ExploreCard'
import { MissionDetailModal } from './MissionDetailModal'
import type { PublicMission } from '../types'
import styles from './ExplorePage.module.scss'

export function ExplorePage() {
  const { t } = useTranslation('explore')
  const {
    missions,
    isLoading,
    filters,
    updateFilter,
    resetFilters,
    globalTags,
    adopt,
    isAdopting,
  } = useExplore()

  const [selectedMission, setSelectedMission] = useState<PublicMission | null>(null)
  const [adoptedId, setAdoptedId] = useState<string | null>(null)

  const hasActiveFilters =
    filters.search || filters.rarity || filters.type || filters.tags.length > 0

  const handleAdopt = async (mission: PublicMission) => {
    await adopt(mission)
    setAdoptedId(mission.id)
    setSelectedMission(null)
    setTimeout(() => setAdoptedId(null), 3000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>

      <ExploreFilters
        filters={filters}
        globalTags={globalTags}
        onUpdate={updateFilter}
        onReset={resetFilters}
      />

      {isLoading ? (
        <div className={styles.loading}>...</div>
      ) : missions.length === 0 ? (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className={styles.emptyIcon}>✦</span>
          <p className={styles.emptyText}>
            {hasActiveFilters ? t('empty_filtered') : t('empty_state')}
          </p>
          {hasActiveFilters && (
            <button type="button" className={styles.emptyButton} onClick={resetFilters}>
              {t('clear_filters')}
            </button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="grid"
            className={styles.grid}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {missions.map((mission) => (
              <ExploreCard
                key={mission.id}
                mission={mission}
                onClick={() => setSelectedMission(mission)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <MissionDetailModal
        mission={selectedMission}
        isOpen={!!selectedMission}
        isAdopting={isAdopting}
        onClose={() => setSelectedMission(null)}
        onAdopt={handleAdopt}
      />

      <AnimatePresence>
        {adoptedId && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            {t('adopted')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
