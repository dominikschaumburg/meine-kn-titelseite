// LocalStorage utilities for KN DOI system

interface KNSession {
  imageData: string
  timestamp: number
  registrationStartTime?: number
  imageId: string
}

export class KNStorage {
  private static PREFIX = 'kn_'
  private static SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private static DOI_GRACE_PERIOD = 10 * 60 * 1000 // 10 minutes buffer

  // Generate unique session ID
  static generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Save current active session with image
  static saveCurrentSession(imageData: string): string {
    if (typeof window === 'undefined') return ''
    
    const sessionId = this.generateSessionId()
    const session: KNSession = {
      imageData,
      timestamp: Date.now(),
      imageId: sessionId
    }
    
    try {
      // Save current session
      localStorage.setItem(`${this.PREFIX}current_session`, JSON.stringify(session))
      localStorage.setItem(`${this.PREFIX}current_session_id`, sessionId)
      return sessionId
    } catch (error) {
      console.error('Failed to save current session:', error)
      return ''
    }
  }

  // Get current active session
  static getCurrentSession(): KNSession | null {
    if (typeof window === 'undefined') return null
    
    try {
      const sessionData = localStorage.getItem(`${this.PREFIX}current_session`)
      if (!sessionData) return null
      
      const session: KNSession = JSON.parse(sessionData)
      
      // Check if session is expired (24h)
      if (Date.now() - session.timestamp > this.SESSION_DURATION) {
        this.removeCurrentSession()
        return null
      }
      
      return session
    } catch (error) {
      console.error('Failed to get current session:', error)
      return null
    }
  }

  // Mark registration start time
  static markRegistrationStart(): void {
    if (typeof window === 'undefined') return
    
    try {
      const currentSession = this.getCurrentSession()
      if (currentSession) {
        currentSession.registrationStartTime = Date.now()
        localStorage.setItem(`${this.PREFIX}current_session`, JSON.stringify(currentSession))
      }
    } catch (error) {
      console.error('Failed to mark registration start:', error)
    }
  }

  // Check if DOI is completed (generic - no session ID needed)
  static isDOICompleted(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const currentSession = this.getCurrentSession()
      if (!currentSession) return false
      
      // Check URL parameters first (cross-domain DOI completion)
      const urlParams = new URLSearchParams(window.location.search)
      const doiFromURL = urlParams.get('doi_completed')
      if (doiFromURL) {
        const doiTimestamp = parseInt(doiFromURL)
        if (!isNaN(doiTimestamp)) {
          // Store DOI completion in localStorage for persistence
          localStorage.setItem(`${this.PREFIX}doi_completed`, doiTimestamp.toString())
          // Clear URL parameter to prevent reprocessing
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('doi_completed')
          window.history.replaceState({}, '', newUrl.toString())
        }
      }
      
      const doiCompletedTime = localStorage.getItem(`${this.PREFIX}doi_completed`)
      if (!doiCompletedTime) return false
      
      const doiTimestamp = parseInt(doiCompletedTime)
      
      // If we have a registration start time, validate timing
      if (currentSession.registrationStartTime) {
        // DOI must be completed after registration started (with grace period)
        const isValidTiming = doiTimestamp > (currentSession.registrationStartTime - this.DOI_GRACE_PERIOD)
        if (!isValidTiming) return false
      }
      
      // DOI must not be older than 24h
      const isNotExpired = Date.now() - doiTimestamp < this.SESSION_DURATION
      
      return isNotExpired
    } catch (error) {
      console.error('Failed to check DOI status:', error)
      return false
    }
  }

  // Mark DOI as completed (called by generic JS on KN DOI success page)
  static markDOICompleted(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(`${this.PREFIX}doi_completed`, Date.now().toString())
    } catch (error) {
      console.error('Failed to mark DOI completed:', error)
    }
  }

  // Remove current session
  static removeCurrentSession(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(`${this.PREFIX}current_session`)
      localStorage.removeItem(`${this.PREFIX}current_session_id`)
    } catch (error) {
      console.error('Failed to remove current session:', error)
    }
  }

  // Clean up expired sessions
  static cleanupExpiredSessions(): void {
    if (typeof window === 'undefined') return
    
    try {
      // Clean up current session if expired
      const currentSession = this.getCurrentSession()
      if (!currentSession) {
        // Session was already cleaned up by getCurrentSession
        return
      }
      
      // Clean up old DOI completion flags (older than 24h)
      const keys = Object.keys(localStorage)
      const now = Date.now()
      
      keys.forEach(key => {
        if (key.startsWith(`${this.PREFIX}doi_completed`)) {
          const timestamp = parseInt(localStorage.getItem(key) || '0')
          if (now - timestamp > this.SESSION_DURATION) {
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.error('Failed to cleanup sessions:', error)
    }
  }

  // Get debug info (for debugging)
  static getDebugInfo(): any {
    if (typeof window === 'undefined') return null

    try {
      const currentSession = this.getCurrentSession()
      const doiCompleted = localStorage.getItem(`${this.PREFIX}doi_completed`)

      return {
        currentSession,
        doiCompleted: doiCompleted ? new Date(parseInt(doiCompleted)).toISOString() : null,
        isDOICompleted: this.isDOICompleted(),
        now: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get debug info:', error)
      return null
    }
  }

  // Save DOI code to localStorage
  static saveDOICode(code: string): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(`${this.PREFIX}doi_code`, code)
      localStorage.setItem(`${this.PREFIX}doi_verified`, Date.now().toString())
    } catch (error) {
      console.error('Failed to save DOI code:', error)
    }
  }

  // Get saved DOI code
  static getDOICode(): string | null {
    if (typeof window === 'undefined') return null

    try {
      return localStorage.getItem(`${this.PREFIX}doi_code`)
    } catch (error) {
      console.error('Failed to get DOI code:', error)
      return null
    }
  }

  // Check if DOI code is verified
  static isDOIVerified(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const verifiedTime = localStorage.getItem(`${this.PREFIX}doi_verified`)
      if (!verifiedTime) return false

      const timestamp = parseInt(verifiedTime)
      // Check if verification is not older than 24h
      const isValid = Date.now() - timestamp < this.SESSION_DURATION

      return isValid
    } catch (error) {
      console.error('Failed to check DOI verification:', error)
      return false
    }
  }

  // Remove DOI code
  static removeDOICode(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(`${this.PREFIX}doi_code`)
      localStorage.removeItem(`${this.PREFIX}doi_verified`)
    } catch (error) {
      console.error('Failed to remove DOI code:', error)
    }
  }
}

// Global function for KN DOI success page to call
if (typeof window !== 'undefined') {
  (window as any).markKNDOICompleted = () => {
    KNStorage.markDOICompleted()
    
    // Try to notify parent window if opened in popup
    if (window.opener) {
      try {
        window.opener.postMessage({ type: 'KN_DOI_COMPLETED' }, '*')
      } catch (error) {
        // Silent fail - parent window notification failed
      }
    }
    
    // Close popup or redirect back
    setTimeout(() => {
      if (window.opener) {
        window.close()
      } else {
        // Redirect back to main app WITH doi_completed parameter
        const doiTimestamp = Date.now()
        window.location.href = `${window.location.origin}?doi_completed=${doiTimestamp}`
      }
    }, 1000)
  }
}