import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, type Easing } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import styles from './OnboardingPage.module.scss'

interface StepData {
  sigil: string
  eyebrowKey: string
  titleKey: string
  bodyKey: string
  ctaKey: string
  visual?: 'rarities' | 'types'
}

const steps: StepData[] = [
  {
    sigil: '✦',
    eyebrowKey: 'step0_eyebrow',
    titleKey: 'step0_title',
    bodyKey: 'step0_body',
    ctaKey: 'step0_cta',
  },
  {
    sigil: '◆',
    eyebrowKey: 'step1_eyebrow',
    titleKey: 'step1_title',
    bodyKey: 'step1_body',
    ctaKey: 'step1_cta',
    visual: 'rarities',
  },
  {
    sigil: '↻',
    eyebrowKey: 'step2_eyebrow',
    titleKey: 'step2_title',
    bodyKey: 'step2_body',
    ctaKey: 'step2_cta',
    visual: 'types',
  },
  {
    sigil: '✓',
    eyebrowKey: 'step3_eyebrow',
    titleKey: 'step3_title',
    bodyKey: 'step3_body',
    ctaKey: 'step3_cta',
  },
]

const rarityMissions = [
  { rarity: 'common', key: 'step1_mission_common' },
  { rarity: 'rare', key: 'step1_mission_rare' },
  { rarity: 'epic', key: 'step1_mission_epic' },
  { rarity: 'legendary', key: 'step1_mission_legendary' },
] as const

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as Easing } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

export function OnboardingPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { updateProfile } = useProfile()
  const [step, setStep] = useState(0)

  const currentStep = steps[step]!
  const isLast = step === steps.length - 1

  const handleFinish = async () => {
    try {
      await updateProfile({ onboarding_completed: true })
      navigate('/dashboard', { replace: true })
    } catch {
      navigate('/dashboard', { replace: true })
    }
  }

  const handleNext = () => {
    if (isLast) {
      handleFinish()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.skipButton} onClick={handleFinish}>
        {t('onboarding.skip')}
      </button>

      <div className={styles.progress}>
        {steps.map((_, i) => (
          <div
            key={i}
            className={`${styles.progressBar} ${i <= step ? styles.progressBarActive : ''}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className={styles.content}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <div className={styles.sigil}>
            <span className={styles.sigilText}>{currentStep.sigil}</span>
          </div>

          <div className={styles.eyebrow}>{t(`onboarding.${currentStep.eyebrowKey}`)}</div>
          <h1 className={styles.title}>{t(`onboarding.${currentStep.titleKey}`)}</h1>
          <p className={styles.body}>{t(`onboarding.${currentStep.bodyKey}`)}</p>

          {currentStep.visual === 'rarities' && (
            <div className={styles.raritiesDemo}>
              {rarityMissions.map((m) => (
                <div
                  key={m.rarity}
                  className={`${styles.missionRow} ${styles[`rarity_${m.rarity}`]}`}
                >
                  <div className={styles.missionDot} />
                  <span className={styles.missionTitle}>{t(`onboarding.${m.key}`)}</span>
                </div>
              ))}
            </div>
          )}

          {currentStep.visual === 'types' && (
            <div className={styles.typesDemo}>
              <div className={styles.typeCard}>
                <div className={styles.typeCardSigil}>◆</div>
                <div className={styles.typeCardTitle}>{t('onboarding.step2_unique_title')}</div>
                <div className={styles.typeCardSub}>{t('onboarding.step2_unique_sub')}</div>
                <div className={styles.typeCardFoot}>{t('onboarding.step2_unique_foot')}</div>
              </div>
              <div className={styles.typeCard}>
                <div className={styles.typeCardSigil}>↻</div>
                <div className={styles.typeCardTitle}>{t('onboarding.step2_weekly_title')}</div>
                <div className={styles.typeCardSub}>{t('onboarding.step2_weekly_sub')}</div>
                <div className={styles.typeCardFoot}>{t('onboarding.step2_weekly_foot')}</div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className={styles.actions}>
        <button className={styles.ctaButton} onClick={handleNext}>
          {t(`onboarding.${currentStep.ctaKey}`)} →
        </button>

        {step > 0 && (
          <button className={styles.backButton} onClick={() => setStep((s) => s - 1)}>
            ← {t('onboarding.back')}
          </button>
        )}
      </div>
    </div>
  )
}
