import { useEffect, useRef, useSyncExternalStore, useCallback } from 'react'
import { checkUsernameAvailability } from '../services/profileService'
import { useAuthStore } from '../store/useAuthStore'

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'error'

export function useUsernameAvailability(username: string, debounceMs = 500) {
  const { user } = useAuthStore()
  const statusRef = useRef<Status>('idle')
  const listenersRef = useRef(new Set<() => void>())
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  const getSnapshot = useCallback(() => statusRef.current, [])

  const setStatus = useCallback((next: Status) => {
    if (statusRef.current !== next) {
      statusRef.current = next
      listenersRef.current.forEach((l) => l())
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!username || username.length < 3) {
      setStatus('idle')
      return
    }

    setStatus('checking')

    timerRef.current = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailability(username, user?.id)
        setStatus(available ? 'available' : 'taken')
      } catch {
        setStatus('error')
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [username, debounceMs, user?.id, setStatus])

  return useSyncExternalStore(subscribe, getSnapshot)
}
