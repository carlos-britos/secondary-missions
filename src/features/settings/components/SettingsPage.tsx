import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useProfile } from '@features/auth/hooks/useProfile'
import { useUsernameAvailability } from '@features/auth/hooks/useUsernameAvailability'
import { useAuthStore } from '@features/auth/store/useAuthStore'
import { useSettings } from '../hooks/useSettings'
import type { UserLanguage } from '@features/auth/types'
import styles from './SettingsPage.module.scss'

interface ProfileFormData {
  username: string
  bio: string
}

interface PasswordFormData {
  newPassword: string
  confirmPassword: string
}

export function SettingsPage() {
  const { t, i18n } = useTranslation('settings')
  const navigate = useNavigate()
  const { profile, updateProfile, uploadAvatar, isUpdating, isUploadingAvatar } = useProfile()
  const { changePassword, isChangingPassword, deleteAccount, isDeletingAccount } = useSettings()
  const { clearAuth } = useAuthStore()

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteUsername, setDeleteUsername] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const username = watchProfile('username')
  const usernameStatus = useUsernameAvailability(username !== profile?.username ? username : '')

  const currentLanguage = (profile?.language ?? 'es') as UserLanguage

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onProfileSubmit = async (data: ProfileFormData) => {
    const usernameChanged = data.username !== profile?.username
    if (usernameChanged && usernameStatus !== 'available') return

    try {
      if (avatarFile) {
        await uploadAvatar(avatarFile)
        setAvatarFile(null)
      }
      await updateProfile({
        username: data.username,
        bio: data.bio || null,
      })
      showToast(t('profile.saved'))
    } catch {
      // handled by mutation
    }
  }

  const onLanguageChange = async (lang: UserLanguage) => {
    try {
      await updateProfile({ language: lang })
      i18n.changeLanguage(lang)
    } catch {
      // handled by mutation
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) return

    try {
      await changePassword(data.newPassword)
      resetPassword()
      showToast(t('password.saved'))
    } catch {
      showToast(t('password.error'))
    }
  }

  const onDeleteAccount = async () => {
    try {
      await deleteAccount()
      clearAuth()
      navigate('/', { replace: true })
    } catch {
      showToast(t('danger.delete_error'))
    }
  }

  // Reset delete modal state on close
  useEffect(() => {
    if (!deleteConfirmOpen) setDeleteUsername('')
  }, [deleteConfirmOpen])

  const avatarSrc = avatarPreview ?? profile?.avatar_url
  const isBusy = isUpdating || isUploadingAvatar
  const usernameChanged = username !== profile?.username
  const canSubmitProfile = !isBusy && (!usernameChanged || usernameStatus === 'available')

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>

        {/* Profile Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('profile.title')}</h2>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className={styles.form}>
            <div className={styles.avatarSection}>
              <button
                type="button"
                className={styles.avatarButton}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className={styles.avatarImg} />
                ) : (
                  <Camera size={24} className={styles.avatarIcon} />
                )}
                <span className={styles.avatarOverlay}>
                  <Camera size={16} />
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.avatarInput}
                onChange={onAvatarChange}
              />
              <button
                type="button"
                className={styles.avatarUploadLabel}
                onClick={() => fileInputRef.current?.click()}
              >
                {t('profile.avatar_upload')}
              </button>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('profile.username')}</label>
              <input
                type="text"
                className={styles.input}
                placeholder={t('profile.username_placeholder')}
                {...registerProfile('username', {
                  required: true,
                  minLength: { value: 3, message: '' },
                  maxLength: { value: 20, message: '' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: '' },
                })}
                autoComplete="username"
              />
              <div className={styles.fieldStatus}>
                {profileErrors.username && (
                  <span className={styles.fieldError}>{profileErrors.username.message}</span>
                )}
                {!profileErrors.username && usernameChanged && usernameStatus === 'checking' && (
                  <span className={styles.fieldChecking}>{t('profile.username_checking')}</span>
                )}
                {!profileErrors.username && usernameChanged && usernameStatus === 'available' && (
                  <span className={styles.fieldAvailable}>{t('profile.username_available')}</span>
                )}
                {!profileErrors.username && usernameChanged && usernameStatus === 'taken' && (
                  <span className={styles.fieldError}>{t('profile.username_taken')}</span>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('profile.bio')}</label>
              <textarea
                className={styles.textarea}
                placeholder={t('profile.bio_placeholder')}
                rows={3}
                maxLength={160}
                {...registerProfile('bio')}
              />
            </div>

            <button type="submit" className={styles.saveButton} disabled={!canSubmitProfile}>
              {isBusy ? '...' : t('profile.save')}
            </button>
          </form>
        </section>

        {/* Language Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('language.title')}</h2>
          <div className={styles.languageToggle}>
            <button
              type="button"
              className={`${styles.langOption} ${currentLanguage === 'es' ? styles.langActive : ''}`}
              onClick={() => onLanguageChange('es')}
              disabled={isUpdating}
            >
              {t('language.es')}
            </button>
            <button
              type="button"
              className={`${styles.langOption} ${currentLanguage === 'en' ? styles.langActive : ''}`}
              onClick={() => onLanguageChange('en')}
              disabled={isUpdating}
            >
              {t('language.en')}
            </button>
          </div>
        </section>

        {/* Password Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('password.title')}</h2>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>{t('password.new')}</label>
              <input
                type="password"
                className={styles.input}
                placeholder={t('password.new_placeholder')}
                {...registerPassword('newPassword', {
                  required: true,
                  minLength: { value: 6, message: t('password.min_length') },
                })}
                autoComplete="new-password"
              />
              {passwordErrors.newPassword && (
                <span className={styles.fieldError}>{passwordErrors.newPassword.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('password.confirm')}</label>
              <input
                type="password"
                className={styles.input}
                placeholder={t('password.confirm_placeholder')}
                {...registerPassword('confirmPassword', {
                  required: true,
                  validate: (value, formValues) =>
                    value === formValues.newPassword || t('password.mismatch'),
                })}
                autoComplete="new-password"
              />
              {passwordErrors.confirmPassword && (
                <span className={styles.fieldError}>{passwordErrors.confirmPassword.message}</span>
              )}
            </div>

            <button type="submit" className={styles.saveButton} disabled={isChangingPassword}>
              {isChangingPassword ? '...' : t('password.save')}
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className={`${styles.section} ${styles.dangerSection}`}>
          <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>{t('danger.title')}</h2>
          <div className={styles.dangerCard}>
            <div className={styles.dangerInfo}>
              <h3 className={styles.dangerCardTitle}>{t('danger.delete_title')}</h3>
              <p className={styles.dangerDescription}>{t('danger.delete_description')}</p>
            </div>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              {t('danger.delete_button')}
            </button>
          </div>
        </section>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmOpen(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={styles.modalTitle}>{t('danger.delete_confirm_title')}</h3>
              <p className={styles.modalMessage}>{t('danger.delete_confirm_message')}</p>
              <input
                type="text"
                className={styles.input}
                placeholder={t('danger.delete_confirm_placeholder')}
                value={deleteUsername}
                onChange={(e) => setDeleteUsername(e.target.value)}
                autoComplete="off"
              />
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  {t('common:cancel')}
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  disabled={deleteUsername !== profile?.username || isDeletingAccount}
                  onClick={onDeleteAccount}
                >
                  {isDeletingAccount ? '...' : t('danger.delete_confirm_button')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
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
