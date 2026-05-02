import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { useUsernameAvailability } from '../hooks/useUsernameAvailability'
import type { ProfileSetupFormData, UserLanguage } from '../types'
import styles from './ProfileSetupPage.module.scss'

export function ProfileSetupPage() {
  const { t, i18n } = useTranslation('auth')
  const navigate = useNavigate()
  const { updateProfile, uploadAvatar, isUpdating, isUploadingAvatar } = useProfile()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const detectedLang = (navigator.language.startsWith('en') ? 'en' : 'es') as UserLanguage

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileSetupFormData>({
    defaultValues: { username: '', language: detectedLang },
  })

  const username = watch('username')
  const language = watch('language')
  const usernameStatus = useUsernameAvailability(username)

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: ProfileSetupFormData) => {
    if (usernameStatus !== 'available') return

    try {
      if (avatarFile) {
        await uploadAvatar(avatarFile)
      }

      await updateProfile({
        username: data.username,
        language: data.language,
      })

      i18n.changeLanguage(data.language)
      navigate('/onboarding', { replace: true })
    } catch {
      // error handled by mutation
    }
  }

  const isBusy = isUpdating || isUploadingAvatar

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={styles.title}>{t('setup.title')}</h1>
        <p className={styles.subtitle}>{t('setup.subtitle')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.avatarSection}>
            <button
              type="button"
              className={styles.avatarButton}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarPlaceholder}>✦</span>
              )}
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
              {t('setup.avatar_upload')}
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('setup.username')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('setup.username_placeholder')}
              {...register('username', {
                required: t('validation.username_required'),
                minLength: { value: 3, message: t('validation.username_min') },
                maxLength: { value: 20, message: t('validation.username_max') },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: t('validation.username_pattern'),
                },
              })}
              autoComplete="username"
            />
            <div className={styles.usernameStatus}>
              {errors.username && (
                <span className={styles.fieldError}>{errors.username.message}</span>
              )}
              {!errors.username && usernameStatus === 'checking' && (
                <span className={styles.fieldChecking}>{t('setup.username_checking')}</span>
              )}
              {!errors.username && usernameStatus === 'available' && (
                <span className={styles.fieldAvailable}>{t('setup.username_available')}</span>
              )}
              {!errors.username && usernameStatus === 'taken' && (
                <span className={styles.fieldError}>{t('setup.username_taken')}</span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('setup.language')}</label>
            <div className={styles.languageToggle}>
              <button
                type="button"
                className={`${styles.langOption} ${language === 'es' ? styles.langActive : ''}`}
                onClick={() => setValue('language', 'es')}
              >
                {t('setup.language_es')}
              </button>
              <button
                type="button"
                className={`${styles.langOption} ${language === 'en' ? styles.langActive : ''}`}
                onClick={() => setValue('language', 'en')}
              >
                {t('setup.language_en')}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isBusy || usernameStatus !== 'available'}
          >
            {isBusy ? '...' : t('setup.submit')}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
