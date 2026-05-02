import { useTranslation } from 'react-i18next'
import type { MissionRarity } from '../types'
import styles from './RaritySelector.module.scss'

const RARITIES: MissionRarity[] = ['common', 'rare', 'epic', 'legendary']

interface RaritySelectorProps {
  value: MissionRarity
  onChange: (rarity: MissionRarity) => void
}

export function RaritySelector({ value, onChange }: RaritySelectorProps) {
  const { t } = useTranslation('missions')

  return (
    <div className={styles.container}>
      {RARITIES.map((rarity) => (
        <button
          key={rarity}
          type="button"
          className={`${styles.option} ${styles[rarity]} ${value === rarity ? styles.active : ''}`}
          onClick={() => onChange(rarity)}
        >
          <span className={styles.gem}>◆</span>
          <span className={styles.label}>{t(`rarity_${rarity}`)}</span>
        </button>
      ))}
    </div>
  )
}
