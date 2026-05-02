import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { Mission } from '../types'
import styles from './MissionCard.module.scss'

type CardVariant = 'one_time' | 'weekly' | 'completed' | 'failed'

interface MissionCardProps {
  mission: Mission
  variant: CardVariant
  onEdit: () => void
  onComplete: () => void
  onIncrement: () => void
  onArchive: () => void
  isBusy: boolean
}

function getCountdown(
  expiresAt: string | null,
  t: (key: string, opts?: Record<string, unknown>) => string
) {
  if (!expiresAt) return { text: t('countdown.no_deadline'), urgency: 'none' as const }

  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { text: t('countdown.expired'), urgency: 'expired' as const }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days === 0 && hours === 0)
    return { text: t('countdown.expires_today'), urgency: 'critical' as const }
  if (days === 0) {
    return {
      text:
        hours === 1
          ? t('countdown.expires_in_hours', { count: hours })
          : t('countdown.expires_in_hours_plural', { count: hours }),
      urgency: 'critical' as const,
    }
  }
  if (days <= 3) {
    return {
      text:
        days === 1
          ? t('countdown.expires_in_days', { count: days })
          : t('countdown.expires_in_days_plural', { count: days }),
      urgency: 'warning' as const,
    }
  }
  return {
    text: t('countdown.expires_in_days_plural', { count: days }),
    urgency: 'normal' as const,
  }
}

export function MissionCard({
  mission,
  variant,
  onEdit,
  onComplete,
  onIncrement,
  onArchive,
  isBusy,
}: MissionCardProps) {
  const { t } = useTranslation('missions')

  const isActive = variant === 'one_time' || variant === 'weekly'
  const countdown = variant === 'one_time' ? getCountdown(mission.expires_at, t) : null

  return (
    <motion.div
      className={`${styles.card} ${styles[mission.rarity]}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className={styles.header}>
        <span className={styles.rarityGem}>◆</span>
        <span className={styles.type}>
          {mission.type === 'weekly' ? t('type_weekly') : t('type_one_time')}
        </span>
        {isActive && (
          <button type="button" className={styles.editBtn} onClick={onEdit}>
            {t('edit_mission')}
          </button>
        )}
      </div>

      <h3 className={styles.title}>{mission.title}</h3>

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

      {variant === 'one_time' && countdown && (
        <span className={`${styles.countdown} ${styles[countdown.urgency]}`}>{countdown.text}</span>
      )}

      {variant === 'weekly' && (
        <span className={styles.completionCount}>
          {mission.completion_count === 1
            ? t('completion_count', { count: mission.completion_count })
            : t('completion_count_plural', { count: mission.completion_count })}
        </span>
      )}

      {variant === 'completed' && (
        <span className={styles.completedDate}>
          {t('completed_on', {
            date: new Date(
              mission.completed_at ?? mission.updated_at ?? mission.created_at ?? 0
            ).toLocaleDateString(),
          })}
        </span>
      )}

      {variant === 'failed' && mission.expires_at && (
        <span className={styles.failedDate}>
          {t('failed_on', { date: new Date(mission.expires_at).toLocaleDateString() })}
        </span>
      )}

      {variant === 'one_time' && (
        <button type="button" className={styles.actionBtn} onClick={onComplete} disabled={isBusy}>
          {isBusy ? t('completing') : t('action_complete')}
        </button>
      )}

      {variant === 'weekly' && (
        <div className={styles.cardActions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionIncrement}`}
            onClick={onIncrement}
            disabled={isBusy}
          >
            {isBusy ? t('completing') : t('action_increment')}
          </button>
          <button type="button" className={styles.archiveBtn} onClick={onArchive} disabled={isBusy}>
            {t('action_archive')}
          </button>
        </div>
      )}
    </motion.div>
  )
}
