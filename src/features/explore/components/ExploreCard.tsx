import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { PublicMission } from '../types'
import styles from './ExploreCard.module.scss'

interface ExploreCardProps {
  mission: PublicMission
  onClick: () => void
}

export function ExploreCard({ mission, onClick }: ExploreCardProps) {
  const { t } = useTranslation('explore')
  const { t: tMissions } = useTranslation('missions')

  const authorLabel = mission.author_username
    ? t('by_author', { username: mission.author_username })
    : t('by_unknown')

  const adoptionLabel =
    mission.adoption_count === 1
      ? t('adoptions', { count: mission.adoption_count })
      : t('adoptions_plural', { count: mission.adoption_count })

  return (
    <motion.button
      type="button"
      className={`${styles.card} ${styles[mission.rarity]}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className={styles.header}>
        <span className={styles.rarityGem}>◆</span>
        <span className={styles.type}>
          {mission.type === 'weekly' ? tMissions('type_weekly') : tMissions('type_one_time')}
        </span>
        <span className={styles.adoptions}>{adoptionLabel}</span>
      </div>

      <h3 className={styles.title}>{mission.title}</h3>

      {mission.description && (
        <p className={styles.description}>
          {mission.description.length > 120
            ? `${mission.description.slice(0, 120)}...`
            : mission.description}
        </p>
      )}

      {(mission.tags ?? []).length > 0 && (
        <div className={styles.tags}>
          {(mission.tags ?? []).map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <span className={styles.author}>{authorLabel}</span>
    </motion.button>
  )
}
