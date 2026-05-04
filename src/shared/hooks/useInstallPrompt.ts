import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'pwa-install-dismissed-at'
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

function isDismissedRecently(): boolean {
  const dismissed = localStorage.getItem(STORAGE_KEY)
  if (!dismissed) return false
  const elapsed = Date.now() - Number(dismissed)
  return elapsed < ONE_MONTH_MS
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isDismissedRecently()) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const handler = () => {
      setIsVisible(false)
      setDeferredPrompt(null)
    }
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'dismissed') {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    }
    setIsVisible(false)
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setIsVisible(false)
  }

  return { isVisible, install, dismiss }
}
