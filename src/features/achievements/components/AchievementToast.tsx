import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import type { Achievement } from '../types'
import styles from './AchievementToast.module.scss'

interface AchievementToastProps {
  achievements: Achievement[]
  onDismiss: () => void
}

export function AchievementToast({ achievements, onDismiss }: AchievementToastProps) {
  const { t } = useTranslation('achievements')

  const first = achievements[0]
  if (!first) return null
  const condition = (first.condition_value ?? {}) as Record<string, unknown>
  const title =
    achievements.length > 1
      ? t('notification_multiple', { count: achievements.length })
      : t('notification_title')

  const name =
    first.category === 'auto'
      ? t(first.name_key, { title: condition.mission_title as string })
      : t(first.name_key)

  return (
    <AnimatePresence>
      <motion.div
        className={styles.toast}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={onDismiss}
      >
        <span className={styles.icon}>{first.icon}</span>
        <div className={styles.content}>
          <span className={styles.title}>{title}</span>
          <span className={styles.name}>{name}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
