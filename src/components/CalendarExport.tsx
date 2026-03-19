'use client'

import { Calendar, FileSpreadsheet } from 'lucide-react'
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
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <button
        onClick={exportToICS}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-[10px] font-black text-[#003399] uppercase tracking-wide transition-all hover:bg-blue-50 sm:px-4 sm:text-xs sm:tracking-widest"
        title="Exportar para Outlook/iCal"
      >
        <Calendar size={14} className="text-[#FFCC00]" />
        <span className="hidden sm:inline">Exportar Outlook/iCal</span>
      </button>
      <button
        onClick={exportToCSV}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-[10px] font-black text-[#003399] uppercase tracking-wide transition-all hover:bg-green-50 sm:px-4 sm:text-xs sm:tracking-widest"
        title="Exportar para CSV/Excel"
      >
        <FileSpreadsheet size={14} className="text-green-600" />
        <span className="hidden sm:inline">Exportar CSV/Excel</span>
      </button>
    </div>
  )
}
