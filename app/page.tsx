'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'camera' | 'preview'>('intro')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const isDOIVerified = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('doi') === 'true'

  useEffect(() => {
    // Check if returning with DOI verification
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const doiParam = urlParams.get('doi')
      const imageIdParam = urlParams.get('imageId')
      
      if (doiParam === 'true' && imageIdParam) {
        setImageId(imageIdParam)
        setCapturedImage(`/api/image/${imageIdParam}?doi=true`)
        setCurrentStep('preview')
      }
    }
  }, [])

  const startCamera = async () => {
    setCameraError(null)
    setError(null)
    
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported')
      }

      // Try to get camera with landscape preference
      const constraints = {
        video: { 
          facingMode: 'user',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 }
        },
        audio: false
      }
      
      console.log('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Camera access granted')
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current
            console.log(`Video dimensions: ${videoWidth}x${videoHeight}`)
            
            if (videoHeight > videoWidth) {
              setCameraError('📱 Bitte drehen Sie Ihr Gerät ins Querformat für bessere Ergebnisse!')
            } else {
              setCameraError(null)
            }
          }
        }
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play')
          videoRef.current?.play()
        }
      }
      setCurrentStep('camera')
    } catch (err) {
      console.error('Camera error:', err)
      const error = err as any
      if (error?.name === 'NotAllowedError') {
        setError('Kamera-Zugriff wurde verweigert. Bitte erlauben Sie den Kamera-Zugriff und laden Sie die Seite neu.')
      } else if (error?.name === 'NotFoundError') {
        setError('Keine Kamera gefunden. Stellen Sie sicher, dass Ihr Gerät über eine Kamera verfügt.')
      } else if (error?.name === 'NotReadableError') {
        setError('Kamera ist bereits in Verwendung. Schließen Sie andere Apps, die die Kamera verwenden könnten.')
      } else {
        setError('Kamera konnte nicht gestartet werden. Überprüfen Sie die Kamera-Berechtigungen.')
      }
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Kamera oder Canvas nicht verfügbar')
      return
    }
    
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      setError('Canvas-Kontext nicht verfügbar')
      return
    }

    // Check if video is actually playing
    if (video.readyState < 2) {
      setError('Video ist noch nicht bereit. Bitte warten Sie einen Moment.')
      return
    }

    // Check orientation - force landscape
    const { videoWidth, videoHeight } = video
    console.log(`Capturing from video: ${videoWidth}x${videoHeight}`)
    
    if (videoHeight > videoWidth) {
      setError('❌ Bitte drehen Sie Ihr Gerät ins Querformat und versuchen Sie es erneut!')
      return
    }
    
    // Set canvas to landscape (16:9 aspect ratio)
    canvas.width = 1920
    canvas.height = 1080
    
    // Clear canvas and draw video frame
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 1920, 1080)
    
    // Draw video maintaining aspect ratio
    const videoAspect = videoWidth / videoHeight
    const canvasAspect = 1920 / 1080
    
    let drawWidth = 1920
    let drawHeight = 1080
    let drawX = 0
    let drawY = 0
    
    if (videoAspect > canvasAspect) {
      // Video is wider, fit to height
      drawHeight = 1080
      drawWidth = drawHeight * videoAspect
      drawX = (1920 - drawWidth) / 2
    } else {
      // Video is taller, fit to width
      drawWidth = 1920
      drawHeight = drawWidth / videoAspect
      drawY = (1080 - drawHeight) / 2
    }
    
    ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight)
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    console.log('Photo captured, data URL length:', dataUrl.length)
    
    // Stop camera
    const stream = video.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())
    
    setIsProcessing(true)
    setError(null)
    setCameraError(null)
    
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
          const url = URL.createObjectURL(blob)
          const generatedImageId = coverResponse.headers.get('X-Image-ID')
          
          setCapturedImage(url)
          setImageId(generatedImageId)
          setCurrentStep('preview')
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
    setCurrentStep('intro')
    setCapturedImage(null)
    setImageId(null)
    setError(null)
    setCameraError(null)
    setAcceptedTerms(false)
    
    // Clean up video stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const openRegistration = () => {
    if (imageId) {
      const registrationUrl = `https://registration-landing-page.com?returnUrl=${encodeURIComponent(window.location.origin + '?doi=true&imageId=' + imageId)}`
      window.open(registrationUrl, '_blank')
    } else {
      window.open('https://registration-landing-page.com', '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-kn-light flex flex-col">
      {/* Header */}
      <header className="flex justify-center py-6 px-4">
        <div className="w-48 h-auto">
          <Image 
            src="/assets/logos/KN_Schriftzug_Logo_Digital_Farbig.svg"
            alt="KN Logo"
            width={192}
            height={60}
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
              onClick={startCamera}
              disabled={!acceptedTerms}
              className="w-full bg-kn-blue text-white py-4 px-6 rounded-lg text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-kn-blue/90 transition-colors"
            >
              Foto aufnehmen
            </button>
          </div>
        )}

        {/* Camera Step */}
        {currentStep === 'camera' && (
          <div className="max-w-2xl mx-auto text-center space-y-6 camera-step">
            <h2 className="text-2xl font-bold text-kn-dark">
              📸 Foto aufnehmen
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
              <p className="font-medium mb-2">📱 Wichtige Hinweise:</p>
              <ul className="text-sm space-y-1 text-left">
                <li>• Halte dein Smartphone/Gerät <strong>horizontal (Querformat)</strong></li>
                <li>• Positioniere dich zentral im Kamerabild</li>
                <li>• Sorge für gute Beleuchtung</li>
                <li>• Das Foto wird automatisch zugeschnitten</li>
              </ul>
            </div>

            {cameraError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded-lg text-sm font-medium">
                {cameraError}
              </div>
            )}

            <div className="relative bg-black rounded-lg overflow-hidden shadow-xl" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Camera guide overlay */}
              <div className="absolute inset-4 border-2 border-white/70 rounded-lg pointer-events-none">
                <div className="absolute top-2 left-2 text-white text-sm bg-black/70 px-2 py-1 rounded">
                  📍 Positioniere dich hier
                </div>
                
                {/* Orientation indicator */}
                <div className="absolute top-2 right-2 text-white text-xs bg-black/70 px-2 py-1 rounded">
                  📏 16:9 Querformat
                </div>
                
                {/* Center guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 border-2 border-white/30 rounded-full"></div>
                </div>
              </div>
              
              {/* Loading overlay */}
              {!videoRef.current?.srcObject && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Kamera wird geladen...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={resetApp}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                ✖️ Abbrechen
              </button>
              <button
                onClick={capturePhoto}
                disabled={isProcessing || !!cameraError}
                className="flex-1 bg-kn-green text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 hover:bg-kn-green/90 transition-colors"
              >
                {isProcessing ? '⏳ Verarbeite...' : '📸 Foto aufnehmen'}
              </button>
            </div>
            
            <p className="text-xs text-gray-600">
              Das aufgenommene Foto wird automatisch auf Inhalte überprüft und verarbeitet.
            </p>
          </div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && capturedImage && (
          <div className="max-w-md mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold text-kn-dark">
              Deine KN Titelseite
            </h2>

            <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
              <Image
                src={capturedImage}
                alt="Generierte Titelseite"
                width={400}
                height={400}
                className="w-full h-auto"
              />
              {!isDOIVerified && <div className="watermark" />}
            </div>

            {!isDOIVerified && (
              <div className="bg-kn-blue/10 border border-kn-blue text-kn-blue p-4 rounded-lg">
                <p className="text-sm">
                  Um die Titelseite ohne Wasserzeichen zu erhalten, 
                  registrieren Sie sich über den Button unten.
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={resetApp}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Neues Foto
              </button>
              {!isDOIVerified && (
                <button
                  onClick={openRegistration}
                  className="flex-1 bg-kn-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-kn-blue/90 transition-colors"
                >
                  Registrieren
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}