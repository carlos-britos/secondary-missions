import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useMissions } from '../hooks/useMissions'
import { CreateMissionDrawer } from './CreateMissionDrawer'
import { CompletionModal } from './CompletionModal'
import { MissionCard } from './MissionCard'
import { AchievementToast } from '@features/achievements'
import { evaluateAchievements } from '@features/achievements'
import type { Achievement } from '@features/achievements'
import { fetchAchievements } from '@features/achievements/services/achievementService'
import type { Mission } from '../types'
import styles from './DashboardPage.module.scss'

type DashboardTab = 'one_time' | 'weekly' | 'completed' | 'failed'

const TABS: DashboardTab[] = ['one_time', 'weekly', 'completed', 'failed']

function isExpired(mission: Mission): boolean {
  if (!mission.expires_at) return false
  return new Date(mission.expires_at).getTime() < Date.now()
}

export function DashboardPage() {
  const { t } = useTranslation('missions')
  const { t: tAuth } = useTranslation('auth')
  const { profile, logout } = useAuth()
  const queryClient = useQueryClient()
  const {
    missions,
    isLoading,
    completeMission,
    isCompleting,
    incrementCount,
    isIncrementing,
    archiveMission,
    isArchiving,
  } = useMissions()

  const [activeTab, setActiveTab] = useState<DashboardTab>('one_time')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingMission, setEditingMission] = useState<Mission | null>(null)

  const [completionTarget, setCompletionTarget] = useState<Mission | null>(null)
  const [completionMode, setCompletionMode] = useState<'complete' | 'increment'>('complete')
  const [toastAchievements, setToastAchievements] = useState<Achievement[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const runAchievementEvaluation = useCallback(
    async (userId: string) => {
      try {
        const newIds = await evaluateAchievements(userId)
        if (newIds.length > 0) {
          const all = await fetchAchievements()
          const unlocked = all.filter((a) => newIds.includes(a.id))
          setToastAchievements(unlocked)
          queryClient.invalidateQueries({ queryKey: ['achievements'] })
          setTimeout(() => setToastAchievements([]), 5000)
        }
      } catch {
        // silently fail — achievements are non-critical
      }
    },
    [queryClient]
  )

  const filtered = useMemo(() => {
    const oneTime: Mission[] = []
    const weekly: Mission[] = []
    const completed: Mission[] = []
    const failed: Mission[] = []

    for (const m of missions) {
      if (m.status === 'completed') {
        completed.push(m)
      } else if (m.status === 'failed' || m.status === 'expired') {
        failed.push(m)
      } else if (m.status === 'active' && m.type === 'one_time' && isExpired(m)) {
        failed.push(m)
      } else if (m.status === 'active' && m.type === 'one_time') {
        oneTime.push(m)
      } else if (m.status === 'active' && m.type === 'weekly') {
        weekly.push(m)
      }
    }

    oneTime.sort((a, b) => {
      if (!a.expires_at && !b.expires_at) return 0
      if (!a.expires_at) return 1
      if (!b.expires_at) return -1
      return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
    })

    weekly.sort((a, b) => (b.completion_count ?? 0) - (a.completion_count ?? 0))
    completed.sort(
      (a, b) =>
        new Date(b.completed_at ?? b.updated_at ?? b.created_at ?? 0).getTime() -
        new Date(a.completed_at ?? a.updated_at ?? a.created_at ?? 0).getTime()
    )
    failed.sort((a, b) => {
      const dateA = a.expires_at ? new Date(a.expires_at).getTime() : 0
      const dateB = b.expires_at ? new Date(b.expires_at).getTime() : 0
      return dateB - dateA
    })

    return { one_time: oneTime, weekly, completed, failed }
  }, [missions])

  const currentMissions = filtered[activeTab]

  const openCreate = () => {
    setEditingMission(null)
    setDrawerOpen(true)
  }

  const openEdit = (mission: Mission) => {
    setEditingMission(mission)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingMission(null)
  }

  const openCompletion = (mission: Mission, mode: 'complete' | 'increment') => {
    setCompletionTarget(mission)
    setCompletionMode(mode)
  }

  const closeCompletion = () => {
    setCompletionTarget(null)
  }

  const handleCompletionSubmit = async (data: {
    missionId: string
    note?: string
    photo?: File
  }) => {
    if (completionMode === 'complete') {
      await completeMission(data)
    } else {
      await incrementCount(data)
    }
    closeCompletion()

    const userId = profile?.id
    if (userId) {
      runAchievementEvaluation(userId)
    }
  }

  const handleArchive = (id: string) => {
    if (window.confirm(t('archive_confirm'))) {
      archiveMission(id)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.userMenu} ref={userMenuRef}>
          <button
            className={styles.userPill}
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <span className={styles.userPillAvatar}>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="14"
                height="14"
                aria-hidden="true"
              >
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .7.5 1.2 1.2 1.2h16.8c.7 0 1.2-.5 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </span>
            <span className={styles.userPillName}>
              {profile?.username ? `@${profile.username}` : '...'}
            </span>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                className={styles.userDropdown}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <button
                  className={styles.userDropdownItem}
                  onClick={() => {
                    setUserMenuOpen(false)
                    logout()
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="14"
                    height="14"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {tAuth('logout')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`tabs.${tab}`)}
            {filtered[tab].length > 0 && (
              <span className={styles.tabCount}>{filtered[tab].length}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.loading}>...</div>
      ) : currentMissions.length === 0 && missions.length === 0 ? (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className={styles.emptyIcon}>◇</span>
          <p className={styles.emptyText}>{t('empty_state')}</p>
          <button className={styles.emptyButton} onClick={openCreate}>
            {t('create_mission')}
          </button>
        </motion.div>
      ) : currentMissions.length === 0 ? (
        <motion.div
          className={styles.emptyTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className={styles.emptyTabText}>{t(`empty_tab.${activeTab}`)}</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className={styles.missionsList}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {currentMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                variant={activeTab}
                onEdit={() => openEdit(mission)}
                onComplete={() => openCompletion(mission, 'complete')}
                onIncrement={() => openCompletion(mission, 'increment')}
                onArchive={() => handleArchive(mission.id)}
                isBusy={isCompleting || isIncrementing || isArchiving}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <button className={styles.fab} onClick={openCreate} aria-label={t('create_mission')}>
        +
      </button>

      <CreateMissionDrawer isOpen={drawerOpen} onClose={closeDrawer} mission={editingMission} />

      <CompletionModal
        mission={completionTarget}
        mode={completionMode}
        isOpen={!!completionTarget}
        isBusy={isCompleting || isIncrementing}
        onClose={closeCompletion}
        onSubmit={handleCompletionSubmit}
      />

      <AchievementToast
        achievements={toastAchievements}
        onDismiss={() => setToastAchievements([])}
      />
    </div>
  )
}
