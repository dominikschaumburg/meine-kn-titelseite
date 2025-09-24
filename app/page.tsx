'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { KNStorage } from '../utils/storage'

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
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    width: 400,
    height: 250,
    x: 0,
    y: 0
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    // Check if there's an existing session
    if (typeof window !== 'undefined') {
      const currentSession = KNStorage.getCurrentSession()
      if (currentSession) {
        setSessionId(currentSession.imageId)
        setCapturedImage(currentSession.imageData)
        setImageId(currentSession.imageId)
        setCurrentStep('preview')
        
        // Check if DOI is already completed
        setIsDOICompleted(KNStorage.isDOICompleted())
      }
    }
    
    // Listen for DOI completion messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'KN_DOI_COMPLETED') {
        setIsDOICompleted(true)
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
        
        // Initialize crop to landscape aspect ratio
        setTimeout(() => {
          if (imgRef.current) {
            const { naturalWidth, naturalHeight } = imgRef.current
            const targetAspect = 16 / 9 // Landscape aspect ratio
            
            let cropWidth, cropHeight
            if (naturalWidth / naturalHeight > targetAspect) {
              // Image is wider than target, crop horizontally
              cropHeight = naturalHeight * 0.8
              cropWidth = cropHeight * targetAspect
            } else {
              // Image is taller than target, crop vertically
              cropWidth = naturalWidth * 0.8
              cropHeight = cropWidth / targetAspect
            }
            
            setCrop({
              unit: 'px',
              width: cropWidth,
              height: cropHeight,
              x: (naturalWidth - cropWidth) / 2,
              y: (naturalHeight - cropHeight) / 2
            })
          }
        }, 100)
      }
    }
    reader.readAsDataURL(file)
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const processCroppedImage = async () => {
    if (!imgRef.current || !canvasRef.current || !completedCrop) {
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

    // Set canvas to target size (1920x1080 landscape)
    canvas.width = 1920
    canvas.height = 1080
    
    // Calculate scaling factor
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 1920, 1080)
    
    // Draw cropped image scaled to fit canvas
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      1920,
      1080
    )
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    console.log('Cropped image processed, data URL length:', dataUrl.length)
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Send to moderation API
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      })
      
      const result = await response.json()
      
      if (result.flagged) {
        setError('Das Bild entspricht nicht unseren Richtlinien. Bitte versuchen Sie es mit einem anderen Foto.')
        setCapturedImage(null)
        setCurrentStep('intro')
      } else {
        // Generate cover page
        const coverResponse = await fetch('/api/generate-cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl })
        })
        
        if (coverResponse.ok) {
          const blob = await coverResponse.blob()
          const reader = new FileReader()
          
          reader.onload = () => {
            const imageDataUrl = reader.result as string
            
            // Save as current session
            const newSessionId = KNStorage.saveCurrentSession(imageDataUrl)
            
            setSessionId(newSessionId)
            setCapturedImage(imageDataUrl)
            setImageId(newSessionId)
            setIsDOICompleted(false)
            setCurrentStep('preview')
          }
          
          reader.readAsDataURL(blob)
        } else {
          throw new Error('Fehler beim Generieren der Titelseite')
        }
      }
    } catch (err) {
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
      unit: 'px',
      width: 400,
      height: 250,
      x: 0,
      y: 0
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
    
    // Open registration page (no parameters needed)
    window.open('https://aktion.kn-online.de/angebot/o7bl6', '_blank', 'width=800,height=600')
  }

  const downloadImage = () => {
    if (capturedImage && isDOICompleted) {
      const link = document.createElement('a')
      link.href = capturedImage
      link.download = `kn-titelseite-${imageId || Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const shareImage = async () => {
    if (capturedImage && isDOICompleted && navigator.share) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(capturedImage)
        const blob = await response.blob()
        const file = new File([blob], `kn-titelseite-${imageId || Date.now()}.jpg`, { type: 'image/jpeg' })

        await navigator.share({
          title: 'Meine KN Titelseite',
          text: 'Schau dir meine personalisierte KN Titelseite an!',
          files: [file]
        })
      } catch (error) {
        console.error('Sharing failed:', error)
        // Fallback: copy link
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href)
          alert('Link wurde in die Zwischenablage kopiert!')
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-kn-light flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="w-full max-w-sm mx-auto md:max-w-xs">
          <Image 
            src="/assets/logos/KN_Schriftzug_Logo_Digital_Farbig.svg"
            alt="KN Logo"
            width={320}
            height={80}
            className="w-full h-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 pb-8">
        
        {/* Intro Step */}
        {currentStep === 'intro' && (
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-3xl font-bold text-kn-dark mb-4">
              Meine KN Titelseite
            </h1>
            
            <p className="text-lg text-kn-dark/80 mb-6">
              Erstelle deine personalisierte Titelseite mit einem Selfie. 
              Halte dein Smartphone horizontal und mache ein Foto von dir.
            </p>
            
            <div className="mb-6">
              <Image 
                src="/assets/screenshot.png"
                alt="Beispiel Titelseite"
                width={300}
                height={200}
                className="rounded-lg shadow-lg mx-auto"
              />
            </div>

            {error && (
              <div className="bg-kn-red/10 border border-kn-red text-kn-red p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex items-start space-x-3 mb-6 text-left">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-kn-blue"
              />
              <label htmlFor="terms" className="text-sm text-kn-dark/70">
                Ich akzeptiere die{' '}
                <a href="#" className="text-kn-blue underline">Nutzungsbedingungen</a>
                {' '}und{' '}
                <a href="#" className="text-kn-blue underline">Datenschutzerklärung</a>
              </label>
            </div>

            <button
              onClick={triggerFileUpload}
              disabled={!acceptedTerms}
              className="w-full bg-kn-blue text-white py-4 px-6 rounded-lg text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-kn-blue/90 transition-colors"
            >
              📸 Foto auswählen
            </button>
            
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
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold text-kn-dark">
              ✂️ Bild zuschneiden
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg">
              <p className="text-sm">
                📏 Ziehen Sie den Rahmen, um Ihr Foto im <strong>16:9 Querformat</strong> zuzuschneiden
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-lg">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={16/9}
                minWidth={200}
                minHeight={112}
              >
                {uploadedImage && (
                  <img
                    ref={imgRef}
                    src={uploadedImage}
                    alt="Zu beschneidendes Bild"
                    className="max-w-full max-h-96 object-contain"
                  />
                )}
              </ReactCrop>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={resetApp}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                ✖️ Abbrechen
              </button>
              <button
                onClick={processCroppedImage}
                disabled={isProcessing || !completedCrop}
                className="flex-1 bg-kn-green text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 hover:bg-kn-green/90 transition-colors"
              >
                {isProcessing ? '⏳ Verarbeite...' : '✅ Foto verwenden'}
              </button>
            </div>
            
            <p className="text-xs text-gray-600">
              Das zugeschnittene Foto wird automatisch auf Inhalte überprüft und verarbeitet.
            </p>
          </div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && capturedImage && (
          <div className="max-w-md mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold text-kn-dark">
              {isDOICompleted ? '🎉 Ihre KN Titelseite' : 'Ihre KN Titelseite'}
            </h2>

            <div className="relative bg-white rounded-lg shadow-lg overflow-hidden select-none">
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
                  className="w-full h-auto pointer-events-none"
                  draggable={false}
                />
                {!isDOICompleted && <div className="watermark" />}
                
                {/* Invisible overlay to prevent saving */}
                {!isDOICompleted && (
                  <div className="absolute inset-0 bg-transparent cursor-default" />
                )}
              </div>
            </div>

            {!isDOICompleted ? (
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  📧 E-Mail bestätigen für wasserzeichenfreie Version
                </p>
                <p className="text-xs">
                  Klicken Sie auf "Wasserzeichen entfernen" um Ihre E-Mail zu bestätigen 
                  und das Bild ohne Wasserzeichen zu erhalten. Das Bild bleibt 24 Stunden verfügbar.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-400 text-green-800 p-4 rounded-lg">
                <p className="text-sm font-medium">
                  ✅ Wasserzeichen erfolgreich entfernt! 
                  Sie können das Bild jetzt herunterladen oder teilen.
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              {!isDOICompleted ? (
                <div className="flex space-x-3">
                  <button
                    onClick={resetApp}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
                  >
                    🔄 Neues Foto
                  </button>
                  <button
                    onClick={openRegistration}
                    className="flex-2 bg-kn-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-kn-blue/90 transition-colors text-sm"
                  >
                    ✨ Wasserzeichen entfernen
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadImage}
                      className="flex-1 bg-kn-green text-white py-3 px-4 rounded-lg font-medium hover:bg-kn-green/90 transition-colors text-sm"
                    >
                      📥 Download
                    </button>
                    <button
                      onClick={shareImage}
                      className="flex-1 bg-kn-blue text-white py-3 px-4 rounded-lg font-medium hover:bg-kn-blue/90 transition-colors text-sm"
                    >
                      📤 Teilen
                    </button>
                  </div>
                  <button
                    onClick={resetApp}
                    className="w-full bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-500 transition-colors text-sm"
                  >
                    🔄 Neues Foto erstellen
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <canvas ref={canvasRef} className="hidden" />
      
      {/* Footer */}
      <footer className="bg-kn-dark text-white py-4 px-4 text-center">
        <div className="text-xs space-x-4">
          <a href="/agb" className="hover:text-kn-blue transition-colors">AGB</a>
          <span>|</span>
          <a href="/datenschutz" className="hover:text-kn-blue transition-colors">Datenschutz</a>
          <span>|</span>
          <a href="/impressum" className="hover:text-kn-blue transition-colors">Impressum</a>
        </div>
      </footer>
    </div>
  )
}