import { useTranslation } from 'react-i18next'
import { useInstallPrompt } from '@shared/hooks/useInstallPrompt'
import styles from './InstallPrompt.module.scss'

export function InstallPrompt() {
  const { t } = useTranslation('common')
  const { isVisible, install, dismiss } = useInstallPrompt()

  if (!isVisible) return null

  return (
    <div className={styles.banner}>
      <img src="/icon-192x192.png" alt="Secondary Missions" className={styles.icon} />
      <div className={styles.content}>
        <p className={styles.title}>{t('install_title')}</p>
        <p className={styles.description}>{t('install_description')}</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.installBtn} onClick={install}>
          {t('install_action')}
        </button>
        <button className={styles.dismissBtn} onClick={dismiss} aria-label={t('cancel')}>
          ✕
        </button>
      </div>
    </div>
  )
}
