'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { UserImagePosition, TemplateConfig } from '@/lib/templates'

interface DragState {
  isDragging: boolean
  isResizing: boolean
  isRotating: boolean
  startX: number
  startY: number
  startPosition: UserImagePosition
}

export default function TemplateConfigPage() {
  const [templateId, setTemplateId] = useState('1')
  const [sampleImageUrl, setSampleImageUrl] = useState<string>('/assets/sample-user.jpg')
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [foregroundImage, setForegroundImage] = useState<string>('')
  const [position, setPosition] = useState<UserImagePosition>({
    x: 100,
    y: 100,
    width: 400,
    height: 300,
    rotation: 0
  })
  const [jsonOutput, setJsonOutput] = useState<string>('')
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    isRotating: false,
    startX: 0,
    startY: 0,
    startPosition: { x: 0, y: 0, width: 0, height: 0, rotation: 0 }
  })

  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    try {
      // Check if template files exist and load them
      const backgroundResponse = await fetch(`/api/template-assets?id=${templateId}&type=background`)
      const foregroundResponse = await fetch(`/api/template-assets?id=${templateId}&type=foreground`)
      
      if (backgroundResponse.ok) {
        const backgroundBlob = await backgroundResponse.blob()
        setBackgroundImage(URL.createObjectURL(backgroundBlob))
      }
      
      if (foregroundResponse.ok) {
        const foregroundBlob = await foregroundResponse.blob()
        setForegroundImage(URL.createObjectURL(foregroundBlob))
      }
      
      // Load existing config
      const configResponse = await fetch(`/api/template-assets?id=${templateId}&type=config`)
      if (configResponse.ok) {
        const config: TemplateConfig = await configResponse.json()
        setPosition(config.userImagePosition)
      }
    } catch (error) {
      console.error('Error loading template:', error)
    }
  }

  const handleSampleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSampleImageUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMouseDown = (event: React.MouseEvent, action: 'drag' | 'resize' | 'rotate') => {
    event.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const startX = event.clientX - rect.left
    const startY = event.clientY - rect.top

    setDragState({
      isDragging: action === 'drag',
      isResizing: action === 'resize',
      isRotating: action === 'rotate',
      startX,
      startY,
      startPosition: { ...position }
    })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragState.isDragging && !dragState.isResizing && !dragState.isRotating) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const currentX = event.clientX - rect.left
    const currentY = event.clientY - rect.top
    const deltaX = (currentX - dragState.startX) * (1920 / 600) // Scale to actual template size
    const deltaY = (currentY - dragState.startY) * (1920 / 600)

    if (dragState.isDragging) {
      setPosition(prev => ({
        ...prev,
        x: Math.max(0, Math.min(1920 - prev.width, dragState.startPosition.x + deltaX)),
        y: Math.max(0, Math.min(1920 - prev.height, dragState.startPosition.y + deltaY))
      }))
    } else if (dragState.isResizing) {
      const newWidth = Math.max(50, dragState.startPosition.width + deltaX)
      const newHeight = Math.max(50, dragState.startPosition.height + deltaY)
      
      setPosition(prev => ({
        ...prev,
        width: Math.min(newWidth, 1920 - prev.x),
        height: Math.min(newHeight, 1920 - prev.y)
      }))
    } else if (dragState.isRotating) {
      // Calculate rotation based on mouse position relative to center of image
      const scaledCenterX = (position.x + position.width / 2) * (600 / 1920)
      const scaledCenterY = (position.y + position.height / 2) * (600 / 1920)
      const angle = Math.atan2(currentY - scaledCenterY, currentX - scaledCenterX) * 180 / Math.PI
      
      setPosition(prev => ({
        ...prev,
        rotation: Math.round(angle * 10) / 10 // Round to 1 decimal place
      }))
    }
  }

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      isResizing: false,
      isRotating: false,
      startX: 0,
      startY: 0,
      startPosition: { x: 0, y: 0, width: 0, height: 0, rotation: 0 }
    })
  }

  // Update JSON output whenever position changes
  useEffect(() => {
    const output = JSON.stringify(position, null, 2)
    setJsonOutput(output)
  }, [position])

  const exportConfig = () => {
    const config: TemplateConfig = {
      id: templateId,
      name: `Template ${templateId}`,
      userImagePosition: position,
      description: `Auto-generierte Konfiguration für Template ${templateId}`
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `template-${templateId}-config.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput)
    alert('userImagePosition in die Zwischenablage kopiert!')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Template Konfigurationstool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Steuerung</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template ID</label>
                <input
                  type="text"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Beispiel Nutzerbild</label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Bild hochladen
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSampleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">X</label>
                  <input
                    type="number"
                    value={position.x}
                    onChange={(e) => setPosition(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Y</label>
                  <input
                    type="number"
                    value={position.y}
                    onChange={(e) => setPosition(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Breite</label>
                  <input
                    type="number"
                    value={position.width}
                    onChange={(e) => setPosition(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Höhe</label>
                  <input
                    type="number"
                    value={position.height}
                    onChange={(e) => setPosition(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Rotation (°)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={position.rotation || 0}
                    onChange={(e) => setPosition(prev => ({ ...prev, rotation: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-2 py-1 text-sm"
                    min="-180"
                    max="180"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={copyJsonToClipboard}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  📋 JSON kopieren
                </button>
                <button
                  onClick={exportConfig}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  💾 Config exportieren
                </button>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">userImagePosition:</label>
                <textarea
                  value={jsonOutput}
                  readOnly
                  className="w-full border rounded px-3 py-2 text-xs font-mono bg-gray-50 h-32 resize-none"
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Template Vorschau (1920x1920)</h2>
            
            <div 
              ref={canvasRef}
              className="relative border border-gray-300 mx-auto"
              style={{ 
                width: '600px', 
                height: '600px',
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* User Image */}
              {sampleImageUrl && (
                <div
                  className="absolute border-2 border-blue-500 cursor-move"
                  style={{
                    left: `${(position.x / 1920) * 600}px`,
                    top: `${(position.y / 1920) * 600}px`,
                    width: `${(position.width / 1920) * 600}px`,
                    height: `${(position.height / 1920) * 600}px`,
                    transform: `rotate(${position.rotation || 0}deg)`,
                    transformOrigin: 'center',
                    backgroundImage: `url(${sampleImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'drag')}
                >
                  {/* Resize handle */}
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      handleMouseDown(e, 'resize')
                    }}
                  />
                  
                  {/* Rotation handle */}
                  <div
                    className="absolute -top-4 left-1/2 w-3 h-3 bg-red-500 rounded-full cursor-grab transform -translate-x-1/2"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      handleMouseDown(e, 'rotate')
                    }}
                  />
                </div>
              )}

              {/* Foreground Layer */}
              {foregroundImage && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${foregroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Anleitung:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Blaues Rechteck ziehen um Nutzerbild zu verschieben</li>
                <li>Blaues Quadrat (unten-rechts) ziehen um Größe zu ändern</li>
                <li>Roten Punkt (oben) ziehen um zu rotieren</li>
                <li>Eingabefelder für präzise Werte verwenden</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}