import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import type { PublicMission } from '../types'
import styles from './MissionDetailModal.module.scss'

interface MissionDetailModalProps {
  mission: PublicMission | null
  isOpen: boolean
  isAdopting: boolean
  onClose: () => void
  onAdopt: (mission: PublicMission) => void
}

export function MissionDetailModal({
  mission,
  isOpen,
  isAdopting,
  onClose,
  onAdopt,
}: MissionDetailModalProps) {
  const { t } = useTranslation('explore')
  const { t: tMissions } = useTranslation('missions')

  if (!mission) return null

  const authorLabel = mission.author_username
    ? t('by_author', { username: mission.author_username })
    : t('by_unknown')

  const adoptionLabel =
    mission.adoption_count === 1
      ? t('adoptions', { count: mission.adoption_count })
      : t('adoptions_plural', { count: mission.adoption_count })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className={styles.handle} />
            <div className={styles.header}>
              <h2 className={styles.modalTitle}>{t('detail_title')}</h2>
              <button type="button" className={styles.closeBtn} onClick={onClose}>
                ×
              </button>
            </div>

            <div className={`${styles.content} ${styles[mission.rarity]}`}>
              <div className={styles.meta}>
                <span className={styles.rarityGem}>◆</span>
                <span className={styles.type}>
                  {mission.type === 'weekly'
                    ? tMissions('type_weekly')
                    : tMissions('type_one_time')}
                </span>
                <span className={styles.rarityLabel}>{t(`rarity_${mission.rarity}`)}</span>
              </div>

              <h3 className={styles.missionTitle}>{mission.title}</h3>

              {mission.description && <p className={styles.description}>{mission.description}</p>}

              {(mission.tags ?? []).length > 0 && (
                <div className={styles.tags}>
                  {(mission.tags ?? []).map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.info}>
                <span className={styles.author}>{authorLabel}</span>
                <span className={styles.adoptionCount}>{adoptionLabel}</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.adoptBtn}
              disabled={isAdopting}
              onClick={() => onAdopt(mission)}
            >
              {isAdopting ? t('adopting') : t('adopt')}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
