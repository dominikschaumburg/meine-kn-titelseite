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
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([])
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
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [newTemplateId, setNewTemplateId] = useState('')

  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const foregroundInputRef = useRef<HTMLInputElement>(null)

  // Load available templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates/list')
        const data = await response.json()
        setAvailableTemplates(data.templates || [])
      } catch (error) {
        console.error('Error fetching templates:', error)
      }
    }
    fetchTemplates()
  }, [])

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

  const saveConfigToServer = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const config: TemplateConfig = {
        id: templateId,
        name: `Meine KN Titelseite - Template ${templateId}`,
        userImagePosition: position,
        description: `Template ${templateId} Konfiguration`
      }

      const password = localStorage.getItem('admin_password')

      const response = await fetch('/api/template-config/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({
          templateId,
          config
        })
      })

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Konfiguration erfolgreich gespeichert!' })
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        const error = await response.json()
        setSaveMessage({ type: 'error', text: error.error || 'Fehler beim Speichern' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Netzwerkfehler beim Speichern' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTemplateUpload = async () => {
    if (!newTemplateId) {
      setUploadMessage({ type: 'error', text: 'Bitte Template-ID eingeben' })
      return
    }

    const backgroundFile = backgroundInputRef.current?.files?.[0]
    const foregroundFile = foregroundInputRef.current?.files?.[0]

    if (!backgroundFile && !foregroundFile) {
      setUploadMessage({ type: 'error', text: 'Bitte mindestens ein Bild hochladen' })
      return
    }

    setIsUploading(true)
    setUploadMessage(null)

    try {
      const formData = new FormData()
      formData.append('templateId', newTemplateId)
      if (backgroundFile) formData.append('background', backgroundFile)
      if (foregroundFile) formData.append('foreground', foregroundFile)

      const password = localStorage.getItem('admin_password')
      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setUploadMessage({ type: 'success', text: result.message })

        // Reload template list
        const templatesResponse = await fetch('/api/templates/list')
        const data = await templatesResponse.json()
        setAvailableTemplates(data.templates || [])

        // Switch to new template
        setTemplateId(newTemplateId)
        setNewTemplateId('')

        // Clear file inputs
        if (backgroundInputRef.current) backgroundInputRef.current.value = ''
        if (foregroundInputRef.current) foregroundInputRef.current.value = ''

        setTimeout(() => setUploadMessage(null), 3000)
      } else {
        const error = await response.json()
        setUploadMessage({ type: 'error', text: error.error || 'Fehler beim Hochladen' })
      }
    } catch (error) {
      setUploadMessage({ type: 'error', text: 'Netzwerkfehler beim Hochladen' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Template-Editor</h1>
          <p className="text-gray-600 mt-2">Positioniere das Nutzerbild auf der Titelseiten-Vorlage</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template auswählen</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {availableTemplates.length === 0 && (
                  <option value="">Lade Templates...</option>
                )}
                {availableTemplates.map(template => (
                  <option key={template} value={template}>
                    Template {template}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Wähle ein vorhandenes Template aus</p>
            </div>

            {/* New Template Upload */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">📁 Neues Template hochladen</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Template-ID (z.B. 2, opernball-2026)</label>
                  <input
                    type="text"
                    value={newTemplateId}
                    onChange={(e) => setNewTemplateId(e.target.value)}
                    placeholder="z.B. 2"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Hintergrundbild (background.png)</label>
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/*"
                    className="w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Vordergrundbild (foreground.png, optional)</label>
                  <input
                    ref={foregroundInputRef}
                    type="file"
                    accept="image/*"
                    className="w-full text-xs"
                  />
                </div>

                <button
                  onClick={handleTemplateUpload}
                  disabled={isUploading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {isUploading ? '⏳ Lädt hoch...' : '📤 Template hochladen'}
                </button>

                {uploadMessage && (
                  <div className={`p-2 rounded text-xs ${
                    uploadMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {uploadMessage.text}
                  </div>
                )}
              </div>
            </div>

            {/* Sample Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Beispielbild zum Testen</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                📤 Bild hochladen
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSampleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-1">Lade ein Beispiel-Nutzerfoto hoch um die Positionierung zu testen</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">🎯 So funktioniert's</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Verschieben:</strong> Klicke auf das blaue Rechteck und ziehe es</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Größe ändern:</strong> Ziehe das kleine blaue Quadrat unten-rechts</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Rotieren:</strong> Ziehe den roten Punkt oben</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Feineinstellung:</strong> Nutze die Zahlenwerte unten für präzise Anpassungen</span>
                </div>
              </div>
            </div>

            {/* Fine-tuning Controls */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">🔧 Feineinstellung (Pixel-Werte)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Position X</label>
                  <input
                    type="number"
                    value={position.x}
                    onChange={(e) => setPosition(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Position Y</label>
                  <input
                    type="number"
                    value={position.y}
                    onChange={(e) => setPosition(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Breite</label>
                  <input
                    type="number"
                    value={position.width}
                    onChange={(e) => setPosition(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Höhe</label>
                  <input
                    type="number"
                    value={position.height}
                    onChange={(e) => setPosition(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Rotation (Grad)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={position.rotation || 0}
                    onChange={(e) => setPosition(prev => ({ ...prev, rotation: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    min="-180"
                    max="180"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Template-Größe: 1920 x 1920 Pixel</p>
            </div>

            {/* Save Button */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <button
                onClick={saveConfigToServer}
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm"
              >
                {isSaving ? '💾 Speichert...' : '💾 Konfiguration speichern'}
              </button>

              {saveMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  saveMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {saveMessage.text}
                </div>
              )}
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

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">💡 Hinweise zur Vorschau</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Die Vorschau zeigt die Template-Vorlage mit dem Nutzer-Foto-Bereich (blau)</li>
                <li>• Das Template wird später in voller Auflösung (1920x1920px) gerendert</li>
                <li>• Stelle sicher, dass das Foto nicht von wichtigen Template-Elementen verdeckt wird</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}