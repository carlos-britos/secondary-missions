import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { RaritySelector } from './RaritySelector'
import { TagInput } from './TagInput'
import { useMissions } from '../hooks/useMissions'
import type { Mission, MissionFormData } from '../types'
import styles from './CreateMissionDrawer.module.scss'

interface CreateMissionDrawerProps {
  isOpen: boolean
  onClose: () => void
  mission?: Mission | null
}

const defaultValues: MissionFormData = {
  title: '',
  description: '',
  type: 'one_time',
  rarity: 'common',
  tags: [],
  expires_at: null,
  is_public: false,
  weekly_reset_day: null,
}

export function CreateMissionDrawer({ isOpen, onClose, mission }: CreateMissionDrawerProps) {
  const { t } = useTranslation('missions')
  const { createMission, updateMission, isCreating, isUpdating } = useMissions()
  const isEditing = !!mission

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<MissionFormData>({ defaultValues })

  const missionType = watch('type')
  const isBusy = isCreating || isUpdating

  useEffect(() => {
    if (isOpen) {
      if (mission) {
        reset({
          title: mission.title,
          description: mission.description ?? '',
          type: mission.type,
          rarity: mission.rarity,
          tags: mission.tags ?? [],
          expires_at: mission.expires_at ? mission.expires_at.slice(0, 10) : null,
          is_public: mission.is_public ?? false,
          weekly_reset_day: mission.weekly_reset_day,
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [isOpen, mission, reset])

  useEffect(() => {
    if (missionType === 'one_time') {
      setValue('weekly_reset_day', null)
    } else if (getValues('weekly_reset_day') === null) {
      setValue('weekly_reset_day', 1)
    }
  }, [missionType, setValue, getValues])

  const onSubmit = async (data: MissionFormData) => {
    const publicStatus = data.is_public ? ('pending' as const) : ('draft' as const)

    const payload = {
      title: data.title,
      description: data.description || null,
      type: data.type,
      rarity: data.rarity,
      tags: data.tags,
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      is_public: data.is_public,
      public_status: publicStatus,
      weekly_reset_day: data.type === 'weekly' ? data.weekly_reset_day : null,
    }

    if (isEditing) {
      await updateMission({ id: mission.id, updates: payload })
    } else {
      await createMission(payload)
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.drawer}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className={styles.handle} />
            <div className={styles.header}>
              <h2 className={styles.title}>
                {isEditing ? t('edit_mission') : t('create_mission')}
              </h2>
              <button type="button" className={styles.closeBtn} onClick={onClose}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>{t('title')}</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={t('title_placeholder')}
                  {...register('title', {
                    required: t('validation.title_required'),
                    minLength: { value: 3, message: t('validation.title_min') },
                    maxLength: { value: 80, message: t('validation.title_max') },
                  })}
                />
                {errors.title && <span className={styles.fieldError}>{errors.title.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('description')}</label>
                <textarea
                  className={styles.textarea}
                  placeholder={t('description_placeholder')}
                  rows={3}
                  {...register('description', {
                    maxLength: { value: 500, message: t('validation.description_max') },
                  })}
                />
                {errors.description && (
                  <span className={styles.fieldError}>{errors.description.message}</span>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('type')}</label>
                <div className={styles.typeToggle}>
                  <button
                    type="button"
                    className={`${styles.typeOption} ${missionType === 'one_time' ? styles.typeActive : ''}`}
                    onClick={() => setValue('type', 'one_time')}
                  >
                    {t('type_one_time')}
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeOption} ${missionType === 'weekly' ? styles.typeActive : ''}`}
                    onClick={() => setValue('type', 'weekly')}
                  >
                    {t('type_weekly')}
                  </button>
                </div>
              </div>

              {missionType === 'weekly' && (
                <motion.div
                  className={styles.field}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className={styles.label}>{t('weekly_reset_day')}</label>
                  <div className={styles.dayGrid}>
                    {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                      <Controller
                        key={day}
                        name="weekly_reset_day"
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            className={`${styles.dayOption} ${field.value === day ? styles.dayActive : ''}`}
                            onClick={() => field.onChange(day)}
                          >
                            {t(`days.${day}`).slice(0, 3)}
                          </button>
                        )}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div className={styles.field}>
                <label className={styles.label}>{t('rarity')}</label>
                <Controller
                  name="rarity"
                  control={control}
                  render={({ field }) => (
                    <RaritySelector value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('tags')}</label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('expires_at')}</label>
                <input
                  type="date"
                  className={styles.input}
                  {...register('expires_at')}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>

              <div className={styles.switchField}>
                <div className={styles.switchText}>
                  <span className={styles.switchLabel}>{t('is_public')}</span>
                  <span className={styles.switchHint}>{t('is_public_hint')}</span>
                </div>
                <Controller
                  name="is_public"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      className={`${styles.switch} ${field.value ? styles.switchOn : ''}`}
                      onClick={() => field.onChange(!field.value)}
                      role="switch"
                      aria-checked={field.value}
                    >
                      <span className={styles.switchThumb} />
                    </button>
                  )}
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={isBusy}>
                {isBusy
                  ? isEditing
                    ? t('saving')
                    : t('creating')
                  : isEditing
                    ? t('save')
                    : t('create')}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
