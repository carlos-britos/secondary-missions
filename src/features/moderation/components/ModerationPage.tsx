import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useModeration } from '../hooks/useModeration'
import { ModerationCard } from './ModerationCard'
import styles from './ModerationPage.module.scss'

export function ModerationPage() {
  const { t } = useTranslation('moderation')
  const { pendingMissions, isLoading, approve, reject, isApproving, isRejecting } = useModeration()
  const [toast, setToast] = useState<string | null>(null)

  const isBusy = isApproving || isRejecting

  const handleApprove = async (id: string) => {
    await approve(id)
    setToast(t('approved_toast'))
    setTimeout(() => setToast(null), 3000)
  }

  const handleReject = async (id: string, reason?: string) => {
    await reject({ id, reason })
    setToast(t('rejected_toast'))
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
        {pendingMissions.length > 0 && (
          <span className={styles.count}>{pendingMissions.length}</span>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>...</div>
      ) : pendingMissions.length === 0 ? (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className={styles.emptyIcon}>✓</span>
          <p className={styles.emptyText}>{t('empty_state')}</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className={styles.queue}>
            {pendingMissions.map((mission) => (
              <ModerationCard
                key={mission.id}
                mission={mission}
                onApprove={handleApprove}
                onReject={handleReject}
                isBusy={isBusy}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
