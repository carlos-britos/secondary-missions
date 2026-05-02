import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import commonEs from '@/locales/es/common.json'
import commonEn from '@/locales/en/common.json'
import authEs from '@/locales/es/auth.json'
import authEn from '@/locales/en/auth.json'
import missionsEs from '@/locales/es/missions.json'
import missionsEn from '@/locales/en/missions.json'
import achievementsEs from '@/locales/es/achievements.json'
import achievementsEn from '@/locales/en/achievements.json'
import exploreEs from '@/locales/es/explore.json'
import exploreEn from '@/locales/en/explore.json'
import moderationEs from '@/locales/es/moderation.json'
import moderationEn from '@/locales/en/moderation.json'
import settingsEs from '@/locales/es/settings.json'
import settingsEn from '@/locales/en/settings.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: commonEs,
        auth: authEs,
        missions: missionsEs,
        achievements: achievementsEs,
        explore: exploreEs,
        moderation: moderationEs,
        settings: settingsEs,
      },
      en: {
        common: commonEn,
        auth: authEn,
        missions: missionsEn,
        achievements: achievementsEn,
        explore: exploreEn,
        moderation: moderationEn,
        settings: settingsEn,
      },
    },
    fallbackLng: 'es',
    defaultNS: 'common',
    ns: ['common', 'auth', 'missions', 'achievements', 'explore', 'moderation', 'settings'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
