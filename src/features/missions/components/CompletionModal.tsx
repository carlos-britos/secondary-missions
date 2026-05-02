import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import type { Mission } from '../types'
import styles from './CompletionModal.module.scss'

type ModalMode = 'complete' | 'increment'

interface CompletionModalProps {
  mission: Mission | null
  mode: ModalMode
  isOpen: boolean
  isBusy: boolean
  onClose: () => void
  onSubmit: (data: { missionId: string; note?: string; photo?: File }) => void
}

export function CompletionModal({
  mission,
  mode,
  isOpen,
  isBusy,
  onClose,
  onSubmit,
}: CompletionModalProps) {
  const { t } = useTranslation('missions')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = () => {
    if (!mission) return
    onSubmit({
      missionId: mission.id,
      note: note.trim() || undefined,
      photo: photo ?? undefined,
    })
  }

  const handleClose = () => {
    if (isBusy) return
    setNote('')
    handleRemovePhoto()
    onClose()
  }

  const handleExited = () => {
    setNote('')
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setPhoto(null)
  }

  return (
    <AnimatePresence onExitComplete={handleExited}>
      {isOpen && mission && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <h2 className={styles.title}>
              {mode === 'complete'
                ? t('completion_modal.title_complete')
                : t('completion_modal.title_increment')}
            </h2>

            <p className={styles.missionTitle}>{mission.title}</p>

            <div className={styles.field}>
              <label className={styles.label}>{t('completion_modal.note_label')}</label>
              <textarea
                className={styles.textarea}
                placeholder={t('completion_modal.note_placeholder')}
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isBusy}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('completion_modal.photo_label')}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={styles.fileInput}
                onChange={handleFileChange}
                disabled={isBusy}
              />

              {preview ? (
                <div className={styles.previewContainer}>
                  <img src={preview} alt="" className={styles.preview} />
                  <div className={styles.previewActions}>
                    <button
                      type="button"
                      className={styles.changeBtn}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isBusy}
                    >
                      {t('completion_modal.photo_change')}
                    </button>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={handleRemovePhoto}
                      disabled={isBusy}
                    >
                      {t('completion_modal.photo_remove')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.selectPhotoBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                >
                  {t('completion_modal.photo_select')}
                </button>
              )}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleClose}
                disabled={isBusy}
              >
                {t('completion_modal.cancel')}
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isBusy}
              >
                {isBusy
                  ? t('completion_modal.submitting')
                  : mode === 'complete'
                    ? t('completion_modal.submit_complete')
                    : t('completion_modal.submit_increment')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
