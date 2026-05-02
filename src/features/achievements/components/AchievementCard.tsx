import { useTranslation } from 'react-i18next'
import type { AchievementWithStatus } from '../types'
import styles from './AchievementCard.module.scss'

interface AchievementCardProps {
  achievement: AchievementWithStatus
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { t } = useTranslation('achievements')

  const condition = (achievement.condition_value ?? {}) as Record<string, unknown>

  const name = achievement.unlocked
    ? achievement.category === 'auto'
      ? t(achievement.name_key, { title: condition.mission_title as string })
      : t(achievement.name_key)
    : t('locked')

  const description = achievement.unlocked
    ? achievement.category === 'auto'
      ? t(achievement.description_key, {
          title: condition.mission_title as string,
          threshold: condition.threshold as number,
        })
      : t(achievement.description_key)
    : undefined

  return (
    <div className={`${styles.card} ${achievement.unlocked ? styles.unlocked : styles.locked}`}>
      <span className={styles.icon}>{achievement.unlocked ? achievement.icon : '?'}</span>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {description && <span className={styles.description}>{description}</span>}
        {achievement.unlocked && achievement.unlocked_at && (
          <span className={styles.date}>
            {t('unlocked_at', {
              date: new Date(achievement.unlocked_at).toLocaleDateString(),
            })}
          </span>
        )}
      </div>
    </div>
  )
}
