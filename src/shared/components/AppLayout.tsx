import { Outlet, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { InstallPrompt } from './InstallPrompt'
import styles from './AppLayout.module.scss'

export function AppLayout() {
  const { t } = useTranslation('common')

  const navItems = [
    { to: '/dashboard', label: t('app_name'), icon: '◆' },
    { to: '/explore', label: 'Explorar', icon: '✦' },
    { to: '/achievements', label: 'Logros', icon: '★' },
    { to: '/settings', label: 'Config', icon: '⚙' },
  ]

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
      <InstallPrompt />
    </div>
  )
}
