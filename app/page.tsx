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
    try {
      // Try to get camera with landscape preference
      const constraints = {
        video: { 
          facingMode: 'user',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 }
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          // Force landscape orientation hint
          if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current
            if (videoHeight > videoWidth) {
              setCameraError('Bitte drehen Sie Ihr Gerät ins Querformat für bessere Ergebnisse')
            }
          }
        }
      }
      setCurrentStep('camera')
    } catch (err) {
      console.error('Camera error:', err)
      setError('Kamera konnte nicht gestartet werden. Bitte überprüfen Sie die Berechtigungen und stellen Sie sicher, dass keine andere App die Kamera verwendet.')
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    canvas.width = 1920
    canvas.height = 1080
    
    ctx?.drawImage(video, 0, 0, 1920, 1080)
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(dataUrl)
    
    // Stop camera
    const stream = video.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())
    
    setIsProcessing(true)
    
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
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold text-kn-dark">
              Foto aufnehmen
            </h2>
            
            <p className="text-kn-dark/80">
              Halte dein Smartphone horizontal und positioniere dich im Bild
            </p>

            {cameraError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded-lg text-sm">
                {cameraError}
              </div>
            )}

            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Camera guide overlay */}
              <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none">
                <div className="absolute top-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                  Positioniere dich hier
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={resetApp}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={capturePhoto}
                disabled={isProcessing}
                className="flex-1 bg-kn-green text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 hover:bg-kn-green/90 transition-colors"
              >
                {isProcessing ? 'Verarbeite...' : 'Foto aufnehmen'}
              </button>
            </div>
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