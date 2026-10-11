"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { fetchUnreadCount, NOTIFICATION_POLL_MS, NOTIFICATION_SOUND } from "@/lib/notifications"

// The newest unread notification this tab has already seen. Each page mounts its own shell,
// so without it the sound would replay on every navigation.
const LAST_SEEN_KEY = "auto-loan.notifications-latest"

function playSound() {
  try {
    // The browser may block it until the user has clicked something on the page; that's fine.
    void new Audio(NOTIFICATION_SOUND).play().catch(() => undefined)
  } catch {
    // No audio support.
  }
}

// True when latestUnreadAt is newer than what this tab has seen. The first check only records it.
function isNew(latestUnreadAt: string | null) {
  try {
    const previous = window.sessionStorage.getItem(LAST_SEEN_KEY)
    // "0" sorts before any ISO date, so the first notification after an empty start still counts.
    const seen = previous ?? "0"
    const latest = latestUnreadAt ?? "0"
    if (latest > seen || previous === null) window.sessionStorage.setItem(LAST_SEEN_KEY, latest > seen ? latest : seen)

    return previous !== null && latest > seen
  } catch {
    return false
  }
}

// T-507: the unread count, polled every 30 s while the tab is visible and on focus; a new one plays the sound.
export function useNotifications(enabled: boolean, soundOn: boolean) {
  const [unreadCount, setUnreadCount] = useState(0)
  const soundRef = useRef(soundOn)

  useEffect(() => {
    soundRef.current = soundOn
  }, [soundOn])

  const refresh = useCallback(async () => {
    try {
      const { unreadCount: count, latestUnreadAt } = await fetchUnreadCount()
      setUnreadCount(count)
      if (isNew(latestUnreadAt) && soundRef.current) playSound()
    } catch {
      // Signed out or offline: the bell just keeps its last count.
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const poll = () => {
      if (document.visibilityState === "visible") void refresh()
    }
    const first = setTimeout(poll, 0)
    const timer = setInterval(poll, NOTIFICATION_POLL_MS)
    window.addEventListener("focus", poll)

    return () => {
      clearTimeout(first)
      clearInterval(timer)
      window.removeEventListener("focus", poll)
    }
  }, [enabled, refresh])

  return { unreadCount, setUnreadCount, refresh }
}
