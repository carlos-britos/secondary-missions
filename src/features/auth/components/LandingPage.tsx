import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, type Easing } from 'framer-motion'
import styles from './LandingPage.module.scss'

const rarities = [
  { key: 'common', sigil: styles.rarityCommon },
  { key: 'rare', sigil: styles.rarityRare },
  { key: 'epic', sigil: styles.rarityEpic },
  { key: 'legendary', sigil: styles.rarityLegendary },
] as const

const pillars = [
  { sigil: '◆', key: '1' },
  { sigil: '↻', key: '2' },
  { sigil: '✦', key: '3' },
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as Easing },
  }),
}

export function LandingPage() {
  const { t } = useTranslation('auth')

  return (
    <div className={styles.page}>
      <div className={styles.grain} />

      <header className={styles.header}>
        <div className={styles.wordmark}>
          <img src="/logo.png" alt="Secondary Missions" className={styles.wordmarkIcon} />
          <span className={styles.wordmarkText}>Secondary Missions</span>
        </div>
        <Link to="/login" className={styles.loginLink}>
          {t('landing.login_button')}
        </Link>
      </header>

      <motion.section
        className={styles.hero}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.div className={styles.chapter} variants={fadeUp} custom={0}>
          — {t('landing.chapter')} —
        </motion.div>

        <motion.h1 className={styles.title} variants={fadeUp} custom={1}>
          {t('landing.hero_line1')}{' '}
          <span className={styles.titleHighlight}>{t('landing.hero_always')}</span>
          <br />
          {t('landing.hero_line2')}
          <br />
          <span className={styles.titleDim}>{t('landing.hero_line3')}</span>
          <br />
          <span className={styles.titleDim}>{t('landing.hero_line4')}</span>
        </motion.h1>

        <motion.p className={styles.description} variants={fadeUp} custom={2}>
          {t('landing.hero_description')}
        </motion.p>

        <motion.div className={styles.cta} variants={fadeUp} custom={3}>
          <Link to="/register" className={styles.ctaButton}>
            {t('landing.cta_start')}
          </Link>
          <div className={styles.ctaSub}>{t('landing.cta_sub')}</div>
        </motion.div>
      </motion.section>

      <motion.section
        className={styles.raritiesSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className={styles.raritiesSectionTitle}>{t('landing.rarities_title')}</div>
        <div className={styles.raritiesList}>
          {rarities.map((r, i) => (
            <div
              key={r.key}
              className={`${styles.rarityRow} ${r.sigil}`}
              style={
                i < rarities.length - 1 ? { borderBottom: '1px solid var(--line)' } : undefined
              }
            >
              <div className={styles.rarityDot} />
              <div className={styles.rarityLabel}>{t(`landing.rarity_${r.key}`)}</div>
              <div className={styles.raritySub}>{t(`landing.rarity_${r.key}_sub`)}</div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className={styles.pillars}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {pillars.map((p) => (
          <motion.div key={p.key} className={styles.pillar} variants={fadeUp} custom={0}>
            <div className={styles.pillarSigil}>{p.sigil}</div>
            <div className={styles.pillarContent}>
              <div className={styles.pillarTitle}>{t(`landing.pillar${p.key}_title`)}</div>
              <div className={styles.pillarBody}>{t(`landing.pillar${p.key}_body`)}</div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      <div className={styles.epilogue}>— {t('landing.epilogue')} —</div>
    </div>
  )
}
