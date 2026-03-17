'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, X, Download, Printer } from 'lucide-react'

interface QRCodeDisplayProps {
  slug: string
  spaceName: string
}

export default function QRCodeDisplay({ slug, spaceName }: QRCodeDisplayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const bookingUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/espaco/${slug}`
    : ''

  const handleDownload = () => {
    const svg = document.getElementById('space-qrcode')
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qrcode-${slug}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
        title="Ver QR Code do Espaço"
      >
        <QrCode size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">QR Code do Espaço</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center text-center">
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-inner mb-6">
                <QRCodeSVG 
                  id="space-qrcode"
                  value={bookingUrl} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-1">{spaceName}</h4>
              <p className="text-sm text-gray-500 mb-8">
                Escaneie para ver a agenda e fazer reservas diretamente pelo celular.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Download size={18} />
                  Baixar PNG
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all"
                >
                  <Printer size={18} />
                  Imprimir
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 text-center text-xs text-gray-400">
              Link: {bookingUrl}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
