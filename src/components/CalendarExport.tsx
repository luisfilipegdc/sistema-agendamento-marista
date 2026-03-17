'use client'

import { Download, Calendar, FileSpreadsheet } from 'lucide-react'
import { createEvents, EventAttributes } from 'ics'
import { Parser } from 'json2csv'

interface Booking {
  id: string
  title: string
  start: Date
  end: Date
  user: { name: string | null }
  type: string
}

interface CalendarExportProps {
  bookings: Booking[]
  spaceName: string
}

export default function CalendarExport({ bookings, spaceName }: CalendarExportProps) {
  
  const exportToICS = () => {
    const events: EventAttributes[] = bookings.map(b => {
      const start = new Date(b.start)
      const end = new Date(b.end)
      
      return {
        start: [
          start.getFullYear(), 
          start.getMonth() + 1, 
          start.getDate(), 
          start.getHours(), 
          start.getMinutes()
        ],
        end: [
          end.getFullYear(), 
          end.getMonth() + 1, 
          end.getDate(), 
          end.getHours(), 
          end.getMinutes()
        ],
        title: b.title,
        description: `Agendamento no espaço ${spaceName} por ${b.user.name || 'Professor'}`,
        location: spaceName,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
      }
    })

    createEvents(events, (error, value) => {
      if (error) return console.error(error)
      
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `agenda-${spaceName.toLowerCase().replace(/\s+/g, '-')}.ics`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const exportToCSV = () => {
    try {
      const fields = ['title', 'start', 'end', 'userName', 'type']
      const data = bookings.map(b => ({
        title: b.title,
        start: new Date(b.start).toLocaleString('pt-BR'),
        end: new Date(b.end).toLocaleString('pt-BR'),
        userName: b.user.name || 'Professor',
        type: b.type === 'FIXED' ? 'Recorrente' : 'Único'
      }))

      const parser = new Parser({ fields })
      const csv = parser.parse(data)
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `agenda-${spaceName.toLowerCase().replace(/\s+/g, '-')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={exportToICS}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-[#003399] uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm"
      >
        <Calendar size={14} className="text-[#FFCC00]" />
        Exportar Outlook/iCal
      </button>
      <button
        onClick={exportToCSV}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-[#003399] uppercase tracking-widest hover:bg-green-50 transition-all shadow-sm"
      >
        <FileSpreadsheet size={14} className="text-green-600" />
        Exportar CSV/Excel
      </button>
    </div>
  )
}
