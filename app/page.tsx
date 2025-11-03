'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { KNStorage } from '../utils/storage'
import { renderTemplate, TemplateConfig } from '../utils/clientTemplateRenderer'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'upload' | 'crop' | 'preview'>('intro')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDOICompleted, setIsDOICompleted] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showActionEndedModal, setShowActionEndedModal] = useState(false)
  const [templateAspect, setTemplateAspect] = useState<number>(1.75) // Default to template aspect ratio

  // Configuration: Set to false when action has ended
  const isActionActive = false
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90 / 1.75, // Template aspect ratio: 1232.8 / 704.4 = 1.75
    x: 5,
    y: (100 - (90 / 1.75)) / 2 // Center vertically
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    // Load template config to get the correct aspect ratio
    const loadTemplateConfig = async () => {
      try {
        const response = await fetch('/api/template-config')
        const config: TemplateConfig = await response.json()
        const aspect = config.userImagePosition.width / config.userImagePosition.height
        setTemplateAspect(aspect)
      } catch (err) {
        console.error('Failed to load template config:', err)
        // Keep default 1.75 aspect ratio
      }
    }

    loadTemplateConfig()

    // Track page view
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'pageView' })
    }).catch(err => console.error('Analytics error:', err))

    // Check if there's an existing session OR if we're returning from DOI
    if (typeof window !== 'undefined') {
      // Check if we're returning from DOI completion
      const urlParams = new URLSearchParams(window.location.search)
      const doiParam = urlParams.get('doi_completed')

      const currentSession = KNStorage.getCurrentSession()

      // If we have a session (from same tab OR shared localStorage), restore it
      if (currentSession) {
        setSessionId(currentSession.imageId)
        setCapturedImage(currentSession.imageData)
        setImageId(currentSession.imageId)
        setCurrentStep('preview')

        // Check DOI status immediately (important for new tab redirects)
        const doiCompleted = KNStorage.isDOICompleted()
        setIsDOICompleted(doiCompleted)

        // If DOI was just completed via URL parameter, track it
        if (doiParam && doiCompleted) {
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'doiCompletion' })
          }).catch(err => console.error('Analytics error:', err))
        }
      }
    }

    // Listen for DOI completion messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'KN_DOI_COMPLETED') {
        setIsDOICompleted(true)
        // Track DOI completion
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'doiCompletion' })
        }).catch(err => console.error('Analytics error:', err))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Polling effect to check DOI status
  useEffect(() => {
    if (!sessionId || isDOICompleted) return

    const checkDOIStatus = () => {
      if (KNStorage.isDOICompleted()) {
        setIsDOICompleted(true)
        // Track DOI completion
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'doiCompletion' })
        }).catch(err => console.error('Analytics error:', err))
      }
    }

    const interval = setInterval(checkDOIStatus, 2000) // Check every 2 seconds
    return () => clearInterval(interval)
  }, [sessionId, isDOICompleted])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte wählen Sie eine Bilddatei aus.')
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Die Datei ist zu groß. Maximal 10MB sind erlaubt.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        setUploadedImage(result)
        setError(null)
        setCurrentStep('crop')
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle image load to initialize crop
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img && img.naturalWidth && img.naturalHeight) {
      // Calculate crop dimensions based on image aspect ratio vs template aspect ratio
      const imageAspect = img.naturalWidth / img.naturalHeight
      const targetAspect = templateAspect // Use template aspect ratio from config

      let cropWidth = 90
      let cropHeight = 90

      if (imageAspect > targetAspect) {
        // Image is wider than template, constrain by height
        cropHeight = 90
        cropWidth = (targetAspect * cropHeight * img.naturalHeight) / img.naturalWidth
      } else {
        // Image is taller than template, constrain by width
        cropWidth = 90
        cropHeight = (cropWidth * img.naturalWidth) / (targetAspect * img.naturalHeight)
      }

      const x = (100 - cropWidth) / 2
      const y = (100 - cropHeight) / 2

      setCrop({
        unit: '%',
        width: cropWidth,
        height: cropHeight,
        x: x,
        y: y
      })
    }
  }

  const triggerFileUpload = () => {
    if (!isActionActive) {
      setShowActionEndedModal(true)
      return
    }
    fileInputRef.current?.click()
  }

  const processCroppedImage = async () => {
    if (!imgRef.current || !canvasRef.current || !crop) {
      setError('Bild oder Crop-Bereich nicht verfügbar')
      return
    }

    const canvas = canvasRef.current
    const image = imgRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      setError('Canvas-Kontext nicht verfügbar')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Track photo upload
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'photoUpload' })
      }).catch(err => console.error('Analytics error:', err))

      // Step 1: Crop the image to 1920x1080
      // CRITICAL: Canvas must ALWAYS be exactly 1920x1080, regardless of viewport
      canvas.width = 1920
      canvas.height = 1080

      // CRITICAL FIX: Convert crop coordinates to natural image coordinates
      // Using percentage-based crop for viewport independence
      const naturalWidth = image.naturalWidth
      const naturalHeight = image.naturalHeight

      let cropX, cropY, cropWidth, cropHeight

      if (crop.unit === '%') {
        // Percentage-based crop (viewport-independent!)
        cropX = (crop.x / 100) * naturalWidth
        cropY = (crop.y / 100) * naturalHeight
        cropWidth = (crop.width / 100) * naturalWidth
        cropHeight = (crop.height / 100) * naturalHeight
      } else {
        // Pixel-based crop (viewport-dependent, needs scaling)
        const displayedWidth = image.clientWidth
        const displayedHeight = image.clientHeight
        const scaleX = naturalWidth / displayedWidth
        const scaleY = naturalHeight / displayedHeight

        cropX = crop.x * scaleX
        cropY = crop.y * scaleY
        cropWidth = crop.width * scaleX
        cropHeight = crop.height * scaleY
      }

      // Fill with black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, 1920, 1080)

      // Draw the cropped portion using natural coordinates (viewport-independent!)
      ctx.drawImage(
        image,
        cropX,      // Source X (in natural image)
        cropY,      // Source Y (in natural image)
        cropWidth,  // Source Width (in natural image)
        cropHeight, // Source Height (in natural image)
        0,          // Destination X (canvas)
        0,          // Destination Y (canvas)
        1920,       // Destination Width (canvas)
        1080        // Destination Height (canvas)
      )

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)

      // Step 2: Send to moderation API
      const moderationResponse = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: croppedDataUrl })
      })

      const moderationResult = await moderationResponse.json()

      if (moderationResult.flagged) {
        setError('Das Bild entspricht nicht unseren Richtlinien. Bitte versuchen Sie es mit einem anderen Foto.')
        setCapturedImage(null)
        setCurrentStep('intro')
        setIsProcessing(false)
        return
      }

      // Step 3: Load template configuration
      const templateResponse = await fetch('/api/template-config')
      const templateConfig: TemplateConfig = await templateResponse.json()

      // Step 4: Render template CLIENT-SIDE (no server load!)
      const finalImageDataUrl = await renderTemplate(croppedDataUrl, templateConfig)

      // Save as current session
      const newSessionId = KNStorage.saveCurrentSession(finalImageDataUrl)

      setSessionId(newSessionId)
      setCapturedImage(finalImageDataUrl)
      setImageId(newSessionId)
      setIsDOICompleted(false)
      setCurrentStep('preview')

    } catch (err) {
      console.error('Processing error:', err)
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
      setCapturedImage(null)
      setCurrentStep('intro')
    }

    setIsProcessing(false)
  }

  const resetApp = () => {
    // Clean up current session
    KNStorage.removeCurrentSession()
    
    setCurrentStep('intro')
    setUploadedImage(null)
    setCapturedImage(null)
    setImageId(null)
    setSessionId(null)
    setIsDOICompleted(false)
    setError(null)
    setAcceptedTerms(false)
    setCrop({
      unit: '%',
      width: 90,
      height: 90 / templateAspect, // Use template aspect ratio
      x: 5,
      y: (100 - (90 / templateAspect)) / 2 // Center vertically
    })
    setCompletedCrop(undefined)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openRegistration = () => {
    // Mark registration start time
    KNStorage.markRegistrationStart()

    // Create callback URL with doi_completed parameter AND session_id
    // This allows the new tab to restore the session
    const doiTimestamp = Date.now()
    const currentSessionId = sessionId || imageId
    const callbackUrl = encodeURIComponent(
      `${window.location.origin}?doi_completed=${doiTimestamp}&session_id=${currentSessionId}`
    )

    // Open registration page with callback URL
    // The DOI system should redirect to this callback URL on success
    const registrationUrl = `https://aktion.kn-online.de/angebot/o7bl6?callback=${callbackUrl}`

    window.open(registrationUrl, '_blank', 'width=800,height=600')
  }

  const downloadImage = async () => {
    if (capturedImage && isDOICompleted) {
      // Track download
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'imageDownload' })
      }).catch(err => console.error('Analytics error:', err))

      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

      if (isIOS && navigator.share) {
        // On iOS, use the share API instead of download
        try {
          const response = await fetch(capturedImage)
          const blob = await response.blob()
          const file = new File([blob], `kn-titelseite-${imageId || Date.now()}.jpg`, { type: 'image/jpeg' })

          await navigator.share({
            files: [file],
            title: 'Meine KN-Titelseite'
          })
        } catch (error) {
          console.error('Share failed:', error)
          // Fallback: open in new tab
          window.open(capturedImage, '_blank')
        }
      } else {
        // Desktop or Android: use standard download
        const link = document.createElement('a')
        link.href = capturedImage
        link.download = `kn-titelseite-${imageId || Date.now()}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  const shareImage = async () => {
    if (capturedImage && isDOICompleted && navigator.share) {
      // Track share
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'imageShare' })
      }).catch(err => console.error('Analytics error:', err))

      try {
        // Convert data URL to blob for sharing
        const response = await fetch(capturedImage)
        const blob = await response.blob()
        const file = new File([blob], `kn-titelseite-${imageId || Date.now()}.jpg`, { type: 'image/jpeg' })

        await navigator.share({
          files: [file]
        })
      } catch (error) {
        console.error('Sharing failed:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="w-full max-w-sm mx-auto md:max-w-xs flex justify-center">
          <Link href="https://www.kn-online.de/" target="_blank" rel="noopener noreferrer" className="block cursor-pointer hover:opacity-90 transition-opacity">
            <img
              src="/assets/logos/KN_Schriftzug_Digital_Farbig.svg"
              alt="KN Logo"
              width="320"
              height="80"
              className="max-w-full h-auto"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 pb-4 overflow-hidden">

        {/* Intro Step */}
        {currentStep === 'intro' && (
          <div className="max-w-md mx-auto text-center space-y-4 flex flex-col h-full justify-center">
            <div className="mb-4">
              <img
                src="/assets/preview.gif"
                alt="Beispiel Titelseite"
                className="rounded-lg shadow-lg mx-auto max-w-[250px] md:max-w-[300px] w-auto h-auto"
              />
            </div>

            <h1 className="text-3xl font-bold text-kn-dark mb-4">
              Deine KN-Titelseite
            </h1>

            <p className="text-lg text-kn-dark/80 mb-6">
              Bring dein Selfie auf die KN-Titelseite und gewinne mit etwas Glück einen <br/><strong className="font-bold text-kn-dark">250-€-Gutschein für den Holstein-Fanshop im Stadion</strong>.
            </p>

            <div className="mb-6 flex justify-center">
              <button
                onClick={() => {
                  setShowOnboarding(true)
                  fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event: 'howItWorksClick' })
                  }).catch(err => console.error('Analytics error:', err))
                }}
                className="inline-flex items-center gap-2 bg-blue-50 text-kn-blue px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                So funktioniert's
              </button>
            </div>

            {error && (
              <div className="bg-kn-red/10 border border-kn-red text-kn-red p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex items-start space-x-4 mb-6 text-left">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-kn-blue cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms" className="text-sm text-kn-dark/70 cursor-pointer">
                Ich akzeptiere die{' '}
                <a href="/agb" className="text-kn-blue hover:text-kn-dark transition-colors inline-block py-1" onClick={(e) => e.stopPropagation()}>Nutzungsbedingungen</a>
                {' '}und{' '}
                <a href="/datenschutz" className="text-kn-blue hover:text-kn-dark transition-colors inline-block py-1" onClick={(e) => e.stopPropagation()}>Datenschutzerklärung</a>
              </label>
            </div>

            <div className="flex flex-col space-y-4 w-full">
              <button
                onClick={triggerFileUpload}
                disabled={!acceptedTerms}
                className="w-full bg-kn-blue text-white py-4 px-6 rounded-kn text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
              📸 Foto aufnehmen
              </button>

              <div className="text-center">
                <p className="text-sm text-kn-dark/70 mb-2">
                  Du möchtest kein Foto aufnehmen?
                </p>
                <a
                  href="https://aktion.kn-online.de/angebot/hoki-gewinnspiel"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    fetch('/api/analytics', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ event: 'directContestClick' })
                    }).catch(err => console.error('Analytics error:', err))
                  }}
                  className="text-sm text-kn-blue hover:text-kn-dark transition-colors underline"
                >
                  Hier geht's direkt zum Gewinnspiel
                </a>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Crop Step */}
        {currentStep === 'crop' && uploadedImage && (
          <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
            <div className="text-center mb-3">
              <h2 className="text-xl md:text-2xl font-bold text-kn-dark">
                ✂️ Foto zuschneiden
              </h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-lg mb-3">
              <p className="text-xs md:text-sm">
                📏 Ziehe den Rahmen, um dein Foto passend zuzuschneiden.
              </p>
            </div>

            <div className="flex-1 bg-white rounded-lg p-2 md:p-4 shadow-lg overflow-auto mb-3">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={templateAspect}
                minWidth={200}
                minHeight={200 / templateAspect}
              >
                {uploadedImage && (
                  <img
                    ref={imgRef}
                    src={uploadedImage}
                    alt="Zu beschneidendes Bild"
                    className="max-w-full max-h-[50vh] object-contain"
                    onLoad={(e) => handleImageLoad(e)}
                  />
                )}
              </ReactCrop>
            </div>

            <div className="flex space-x-4 mb-2">
              <button
                onClick={resetApp}
                className="flex-1 bg-gray-500 text-white py-3 px-4 md:px-6 rounded-kn font-medium transition-colors text-sm md:text-base"
              >
                ✖️ Abbrechen
              </button>
              <button
                onClick={processCroppedImage}
                disabled={isProcessing || !crop.width || !crop.height}
                className="flex-1 bg-kn-blue text-white py-3 px-4 md:px-6 rounded-kn font-medium disabled:opacity-50 transition-colors text-sm md:text-base relative"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verarbeite...
                  </span>
                ) : '✅ Foto verwenden'}
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              Das zugeschnittene Foto wird automatisch auf Inhalte überprüft und verarbeitet.
            </p>
          </div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && capturedImage && (
          <div className="max-w-md mx-auto text-center space-y-4 w-full flex flex-col h-full justify-center">
            <h2 className="text-xl md:text-2xl font-bold text-kn-dark">
              {isDOICompleted ? '🎉 Deine KN-Titelseite' : '🔎 Deine KN-Titelseite'}
            </h2>

            <div className="relative bg-white rounded-lg shadow-lg overflow-hidden select-none flex-shrink-0 w-full aspect-square max-w-md mx-auto">
              {/* Prevent right-click context menu on image */}
              <div 
                className="relative"
                onContextMenu={(e) => e.preventDefault()}
                style={{ 
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none'
                }}
              >
                <Image
                  src={capturedImage}
                  alt="Generierte Titelseite"
                  width={400}
                  height={400}
                  className={`w-full h-auto object-contain pointer-events-none ${!isDOICompleted ? 'preview-blur' : ''}`}
                  draggable={false}
                />
                
                {/* Invisible overlay to prevent saving */}
                {!isDOICompleted && (
                  <div className="absolute inset-0 bg-transparent cursor-default" />
                )}
              </div>
            </div>

            {!isDOICompleted ? (
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 p-3 rounded-lg">
                <p className="text-xs md:text-sm font-medium mb-1">
                  🎁 📧 Klicke auf den Button unten, um am Gewinnspiel teilzunehmen und deine personalisierte Titelseite in voller Auflösung zu erhalten.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-400 text-green-800 p-3 rounded-lg">
                <p className="text-xs md:text-sm font-medium">
                  ✅ Geschafft! Deine Titelseite ist freigeschaltet! <br/>
                  Du kannst das Bild jetzt speichern und teilen.
                </p>
                <p className="text-xs mt-2">
                📱 Wenn du magst, teile deine Titelseite gerne auf Social Media und markiere <strong>@kieler.nachrichten</strong>
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              {!isDOICompleted ? (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={openRegistration}
                    className="w-full bg-kn-blue text-white py-4 px-6 rounded-kn font-medium transition-colors text-base"
                  >
                    Am Gewinnspiel teilnehmen & Titelseite freischalten
                  </button>
                  <button
                    onClick={resetApp}
                    className="w-full bg-gray-500 text-white py-3 px-4 rounded-kn font-medium transition-colors text-sm"
                  >
                    🔄 Neues Foto
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadImage}
                      className="flex-1 bg-kn-blue text-white py-3 px-4 rounded-kn font-medium transition-colors text-sm"
                    >
                      💾 Speichern
                    </button>
                    <button
                      onClick={shareImage}
                      className="flex-1 bg-kn-blue text-white py-3 px-4 rounded-kn font-medium transition-colors text-sm"
                    >
                      🔗 Teilen
                    </button>
                  </div>
                  <button
                    onClick={resetApp}
                    className="w-full bg-kn-blue text-white py-2 px-4 rounded-kn font-medium transition-colors text-sm"
                  >
                    🔄 Neue Titelseite erstellen
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <canvas ref={canvasRef} className="hidden" />

      {/* Action Ended Modal */}
      {showActionEndedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowActionEndedModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-kn-dark">Aktion beendet</h2>
              <button
                onClick={() => setShowActionEndedModal(false)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-6xl mb-4 text-center">😊</div>

              <p className="text-lg text-kn-dark text-center">
                Vielen Dank für dein Interesse!
              </p>

              <p className="text-base text-kn-dark/80 text-center">
                Die Aktion und das Gewinnspiel sind leider beendet.
              </p>

              <button
                onClick={() => setShowActionEndedModal(false)}
                className="w-full bg-kn-blue text-white py-3 px-6 rounded-kn text-lg font-medium transition-colors hover:bg-kn-dark"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOnboarding(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-kn-dark">So funktioniert's</h2>
              <button
                onClick={() => setShowOnboarding(false)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start space-x-4 animate-fade-in">
                <div className="flex-shrink-0 w-12 h-12 bg-kn-blue text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-kn-dark mb-2">📸 Foto aufnehmen</h3>
                  <p className="text-gray-700">
                    Nimm ein Selfie auf. Halte dein Smartphone am besten im Querformat.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex-shrink-0 w-12 h-12 bg-kn-blue text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-kn-dark mb-2">✂️ Foto zuschneiden</h3>
                  <p className="text-gray-700">
                    Passe den Bildausschnitt an.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex-shrink-0 w-12 h-12 bg-kn-blue text-white rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-kn-dark mb-2">🎁 Gewinnspiel & Freischalten</h3>
                  <p className="text-gray-700">
                    Registriere dich, bestätige deine E-Mail und schalte deine Titelseite frei. Gewinne <strong className="font-bold text-kn-dark">250-€-Gutschein für den Holstein-Fanshop!</strong>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex-shrink-0 w-12 h-12 bg-kn-blue text-white rounded-full flex items-center justify-center text-xl font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-kn-dark mb-2">💾 Speichern & Teilen</h3>
                  <p className="text-gray-700">
                  Speichere und teile deine Titelseite.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg mb-4">
                <p className="text-xs">
                  <strong>🔒 Privat & sicher:</strong> Fotos bleiben auf deinem Gerät. Keine Speicherung, keine Veröffentlichung.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-4">
                <p className="text-xs">
                  <strong>⚠️ Hinweis:</strong> Bitte verwende keinen Inkognito-Modus, da dies zu Problemen führen kann.
                </p>
              </div>
              <button
                onClick={() => setShowOnboarding(false)}
                className="w-full bg-kn-blue text-white py-3 px-6 rounded-kn text-lg font-medium transition-colors"
              >
                Los geht's! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-kn-dark text-white py-4 px-4 text-center">
        <div className="text-xs space-x-4">
          <a href="/agb" className="hover:text-kn-light transition-colors">AGB</a>
          <span>|</span>
          <a href="/datenschutz" className="hover:text-kn-light transition-colors">Datenschutz</a>
          <span>|</span>
          <a href="/impressum" className="hover:text-kn-light transition-colors">Impressum</a>
        </div>
      </footer>
    </div>
  )
}