'use client'

import { useState } from 'react'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Trash2, Wind, Mic, Monitor, Laptop, Music, Settings } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Booking {
  id: string
  title: string
  start: Date
  end: Date
  user: { name: string | null }
  userId: string
  type: string
  space: { unitId: string }
  // Campos técnicos
  airConditioning: boolean
  microphones: number
  wirelessMic: boolean
  projection: boolean
  schoolComputer: boolean
  externalComputer: boolean
  audioSupport: boolean
}

interface CalendarViewProps {
  bookings: Booking[]
}

export default function CalendarView({ bookings }: CalendarViewProps) {
  const { data: session } = useSession()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const user = session?.user as any
  const isAdmin = user?.role === 'ADMIN'
  const isAV = user?.role === 'AV'
  const userId = user?.id

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const dayHasBooking = (day: Date) => {
    return bookings.some(booking => isSameDay(new Date(booking.start), day))
  }

  const selectedDayBookings = bookings.filter(booking => 
    isSameDay(new Date(booking.start), selectedDate)
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return
    
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        window.location.reload() // Recarregar para atualizar a agenda
      } else {
        const data = await res.json()
        alert(data.message || 'Erro ao excluir')
      }
    } catch (err) {
      alert('Erro na conexão')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header do Calendário */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 capitalize">
          <CalendarIcon size={20} className="text-blue-600" />
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const hasBooking = dayHasBooking(day)
          const isCurrentDay = isToday(day)

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`
                relative h-14 sm:h-20 border-r border-b border-gray-50 flex flex-col items-center justify-center transition-all
                ${!isCurrentMonth ? 'bg-gray-50/40 text-gray-300' : 'text-gray-700 hover:bg-blue-50/30'}
                ${isSelected ? 'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200' : ''}
              `}
            >
              <span className={`
                text-sm font-semibold mb-1
                ${isCurrentDay && !isSelected ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm' : ''}
              `}>
                {format(day, 'd')}
              </span>
              
              {hasBooking && (
                <div className="flex gap-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-blue-400'}`} />
                  {bookings.filter(b => isSameDay(new Date(b.start), day)).length > 1 && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-blue-400'}`} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista de agendamentos do dia selecionado */}
      <div className="p-6 bg-gray-50/30 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          Agendamentos em {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
        </h3>
        
        <div className="space-y-3">
          {selectedDayBookings.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Nenhum agendamento para este dia.</p>
          ) : (
            selectedDayBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{booking.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        {format(new Date(booking.start), 'HH:mm')} - {format(new Date(booking.end), 'HH:mm')}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <User size={12} />
                        {booking.user.name || 'Professor'}
                      </span>
                    </div>
                    
                    {/* Detalhes Técnicos - Visíveis para Admin/AV ou Dono */}
                    {(isAdmin || isAV || booking.userId === userId) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {booking.airConditioning && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-tighter border border-blue-100">
                            <Wind size={10} /> Ar
                          </span>
                        )}
                        {booking.microphones > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-md text-[9px] font-black uppercase tracking-tighter border border-yellow-100">
                            <Mic size={10} /> {booking.microphones} Mic {booking.wirelessMic ? '(S/Fio)' : ''}
                          </span>
                        )}
                        {booking.projection && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-[9px] font-black uppercase tracking-tighter border border-green-100">
                            <Monitor size={10} /> Projeção
                          </span>
                        )}
                        {booking.audioSupport && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[9px] font-black uppercase tracking-tighter border border-purple-100">
                            <Music size={10} /> Som
                          </span>
                        )}
                        {booking.schoolComputer && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md text-[9px] font-black uppercase tracking-tighter border border-orange-100">
                            <Laptop size={10} /> PC Escola
                          </span>
                        )}
                        {booking.externalComputer && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-md text-[9px] font-black uppercase tracking-tighter border border-red-100">
                            <Laptop size={10} /> PC Externo
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase border ${
                      booking.type === 'FIXED' 
                        ? 'bg-purple-50 text-purple-700 border-purple-100' 
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {booking.type === 'FIXED' ? 'Recorrente' : 'Único'}
                    </span>
                    
                    {(isAdmin || (isAV && booking.space.unitId === user?.unitId) || booking.userId === userId) && (
                      <button 
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Cancelar Agendamento"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
