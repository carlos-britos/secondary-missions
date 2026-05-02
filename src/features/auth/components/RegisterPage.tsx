import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import type { RegisterFormData } from '../types'
import styles from './RegisterPage.module.scss'

export function RegisterPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = z
    .object({
      email: z.email(t('validation.email_invalid')),
      password: z.string().min(8, t('validation.password_min')),
      confirmPassword: z.string().min(1, t('validation.password_required')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.password_mismatch'),
      path: ['confirmPassword'],
    })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      if (firstError) setServerError(firstError.message)
      return
    }

    try {
      await registerUser(data.email, data.password)
      navigate('/setup', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      const msg = (err as { message?: string })?.message ?? ''
      if (code === 'user_already_exists' || msg.includes('already registered')) {
        setServerError(t('errors.email_taken'))
      } else if (code === 'email_address_invalid' || msg.includes('invalid')) {
        setServerError(t('errors.email_invalid'))
      } else if (code === 'over_email_send_rate_limit') {
        setServerError(t('errors.rate_limit'))
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

        <h1 className={styles.title}>{t('register.title')}</h1>
        <p className={styles.subtitle}>{t('register.subtitle')}</p>

        {serverError && <div className={styles.error}>{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>{t('register.email')}</label>
            <input
              type="email"
              className={styles.input}
              {...register('email', { required: t('validation.email_required') })}
              autoComplete="email"
            />
            {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('register.password')}</label>
            <input
              type="password"
              className={styles.input}
              {...register('password', {
                required: t('validation.password_required'),
                minLength: { value: 8, message: t('validation.password_min') },
              })}
              autoComplete="new-password"
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('register.confirm_password')}</label>
            <input
              type="password"
              className={styles.input}
              {...register('confirmPassword', {
                required: t('validation.password_required'),
              })}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className={styles.fieldError}>{errors.confirmPassword.message}</span>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? '...' : t('register.submit')}
          </button>
        </form>

        <div className={styles.divider}>
          <span>{t('register.or_continue')}</span>
        </div>

        <div className={styles.oauthButtons}>
          <button className={styles.oauthButton} disabled title={t('register.coming_soon')}>
            Google
          </button>
          <button className={styles.oauthButton} disabled title={t('register.coming_soon')}>
            GitHub
          </button>
        </div>

        <p className={styles.footer}>
          {t('register.has_account')}{' '}
          <Link to="/login" className={styles.footerLink}>
            {t('register.login_link')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
