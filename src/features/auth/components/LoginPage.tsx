import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import type { LoginFormData } from '../types'
import styles from './LoginPage.module.scss'

export function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = z.object({
    email: z.email(t('validation.email_invalid')),
    password: z.string().min(1, t('validation.password_required')),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    const parsed = schema.safeParse(data)
    if (!parsed.success) return

    try {
      await login(data.email, data.password)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      const msg = (err as { message?: string })?.message ?? ''
      if (code === 'email_not_confirmed') {
        setServerError(t('errors.email_not_confirmed'))
      } else if (code === 'invalid_credentials') {
        setServerError(t('errors.invalid_credentials'))
      } else {
        setServerError(msg || t('errors.generic'))
      }
    }
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <Link to="/" className={styles.backLink}>
            ← Secondary Missions
          </Link>
        </div>

        <h1 className={styles.title}>{t('login.title')}</h1>
        <p className={styles.subtitle}>{t('login.subtitle')}</p>

        {serverError && <div className={styles.error}>{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>{t('login.email')}</label>
            <input
              type="email"
              className={styles.input}
              {...register('email', { required: t('validation.email_required') })}
              autoComplete="email"
            />
            {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>{t('login.password')}</label>
              <span className={styles.forgotLink}>{t('login.forgot_password')}</span>
            </div>
            <input
              type="password"
              className={styles.input}
              {...register('password', { required: t('validation.password_required') })}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password.message}</span>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? '...' : t('login.submit')}
          </button>
        </form>

        <div className={styles.divider}>
          <span>{t('login.or_continue')}</span>
        </div>

        <div className={styles.oauthButtons}>
          <button className={styles.oauthButton} disabled title={t('login.coming_soon')}>
            Google
          </button>
          <button className={styles.oauthButton} disabled title={t('login.coming_soon')}>
            GitHub
          </button>
        </div>

        <p className={styles.footer}>
          {t('login.no_account')}{' '}
          <Link to="/register" className={styles.footerLink}>
            {t('login.register_link')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
