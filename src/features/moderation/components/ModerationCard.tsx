import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { PendingMission } from '../types'
import styles from './ModerationCard.module.scss'

interface ModerationCardProps {
  mission: PendingMission
  onApprove: (id: string) => void
  onReject: (id: string, reason?: string) => void
  isBusy: boolean
}

export function ModerationCard({ mission, onApprove, onReject, isBusy }: ModerationCardProps) {
  const { t } = useTranslation('moderation')
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')

  const authorLabel = mission.author_username
    ? t('by_author', { username: mission.author_username })
    : t('by_unknown')

  const submittedDate = mission.updated_at
    ? t('submitted', { date: new Date(mission.updated_at).toLocaleDateString() })
    : ''

  const handleReject = () => {
    onReject(mission.id, reason || undefined)
    setShowReject(false)
    setReason('')
  }

  return (
    <motion.div
      className={`${styles.card} ${styles[mission.rarity]}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
    >
      <div className={styles.header}>
        <span className={styles.rarityGem}>◆</span>
        <span className={styles.type}>
          {mission.type === 'weekly' ? t('type_weekly') : t('type_one_time')}
        </span>
        <span className={styles.rarityLabel}>{t(`rarity_${mission.rarity}`)}</span>
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

      <div className={styles.meta}>
        <span className={styles.author}>{authorLabel}</span>
        <span className={styles.date}>{submittedDate}</span>
      </div>

      {!showReject ? (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.approveBtn}
            onClick={() => onApprove(mission.id)}
            disabled={isBusy}
          >
            {isBusy ? t('approving') : t('approve')}
          </button>
          <button
            type="button"
            className={styles.rejectBtn}
            onClick={() => setShowReject(true)}
            disabled={isBusy}
          >
            {t('reject')}
          </button>
        </div>
      ) : (
        <div className={styles.rejectForm}>
          <input
            type="text"
            className={styles.reasonInput}
            placeholder={t('reject_reason_placeholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <div className={styles.rejectActions}>
            <button
              type="button"
              className={styles.confirmRejectBtn}
              onClick={handleReject}
              disabled={isBusy}
            >
              {isBusy ? t('rejecting') : t('reject')}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                setShowReject(false)
                setReason('')
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
