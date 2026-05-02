import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAchievements } from '../hooks/useAchievements'
import { AchievementCard } from './AchievementCard'
import styles from './AchievementsPage.module.scss'

export function AchievementsPage() {
  const { t } = useTranslation('achievements')
  const { catalog, auto, isLoading } = useAchievements()

  const unlockedCatalog = catalog.filter((a) => a.unlocked).length
  const unlockedAuto = auto.filter((a) => a.unlocked)
  const lockedAuto = auto.filter((a) => !a.unlocked)

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>...</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('section_catalog')}</h2>
          <span className={styles.counter}>
            {t('unlocked_count', { count: unlockedCatalog, total: catalog.length })}
          </span>
        </div>
        <div className={styles.grid}>
          {catalog.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <AchievementCard achievement={achievement} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('section_trophies')}</h2>
        </div>

        {auto.length === 0 ? (
          <p className={styles.emptyText}>{t('empty_trophies')}</p>
        ) : (
          <>
            {unlockedAuto.length > 0 && (
              <div className={styles.grid}>
                {unlockedAuto.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <AchievementCard achievement={achievement} />
                  </motion.div>
                ))}
              </div>
            )}

            {lockedAuto.length > 0 && (
              <div className={`${styles.grid} ${styles.gridDimmed}`}>
                {lockedAuto.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <AchievementCard achievement={achievement} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
