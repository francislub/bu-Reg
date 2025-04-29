"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

export function AutoLogout({ timeoutMinutes = 30 }: { timeoutMinutes?: number }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [warningShown, setWarningShown] = useState(false)
  const [countdown, setCountdown] = useState(60) // 60 seconds countdown for warning

  // Reset the timer when there's user activity
  const resetTimer = () => {
    setLastActivity(Date.now())
    setWarningShown(false)
  }

  useEffect(() => {
    // Only run if user is logged in
    if (!session) return

    // Set up event listeners for user activity
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click", "keydown"]

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    // Check for inactivity every minute
    const inactivityCheckInterval = setInterval(() => {
      const currentTime = Date.now()
      const inactiveTime = (currentTime - lastActivity) / (1000 * 60) // Convert to minutes

      // If inactive for more than timeoutMinutes - 1 and warning not shown, show warning
      if (inactiveTime >= timeoutMinutes - 1 && !warningShown) {
        setWarningShown(true)
        setCountdown(60) // Reset countdown to 60 seconds
      }

      // If inactive for more than timeoutMinutes, log out
      if (inactiveTime >= timeoutMinutes) {
        console.log("Logging out due to inactivity")
        signOut({ redirect: true, callbackUrl: "/auth/login" })
      }
    }, 60000) // Check every minute

    // Countdown timer for warning
    let countdownInterval: NodeJS.Timeout
    if (warningShown) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // Clean up event listeners and intervals
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
      clearInterval(inactivityCheckInterval)
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, [session, lastActivity, timeoutMinutes, warningShown, router])

  // If warning is shown, display a countdown modal
  if (warningShown && session) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Session Timeout Warning</h2>
          <p className="mb-4">
            Your session will expire in {countdown} seconds due to inactivity. Click anywhere or press any key to
            continue.
          </p>
          <div className="flex justify-between">
            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Stay Logged In
            </button>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/auth/login" })}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Component doesn't render anything visible when not showing warning
  return null
}
