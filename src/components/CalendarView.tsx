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
  class?: string
  purpose?: string
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
  techNotes?: string
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
    <div className="bg-white overflow-hidden">
      {/* Header do Calendário */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <h2 className="text-xl font-black text-[#003399] flex items-center gap-3 capitalize italic tracking-tight">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
            <CalendarIcon size={20} className="text-[#FFCC00]" />
          </div>
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-3 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-sm active:scale-90"
          >
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-3 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-sm active:scale-90"
          >
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/10">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
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
                relative h-16 sm:h-24 border-r border-b border-slate-50 flex flex-col items-center justify-center transition-all group
                ${!isCurrentMonth ? 'bg-slate-50/20 text-slate-200' : 'text-slate-600 hover:bg-blue-50/50'}
                ${isSelected ? 'bg-blue-50/80 text-[#003399] z-10' : ''}
              `}
            >
              <span className={`
                text-sm font-black mb-2 transition-all
                ${isCurrentDay && !isSelected ? 'w-8 h-8 bg-[#003399] text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 rotate-3' : ''}
                ${isSelected ? 'scale-125' : 'group-hover:scale-110'}
              `}>
                {format(day, 'd')}
              </span>
              
              {hasBooking && (
                <div className="flex gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#003399]' : 'bg-[#FFCC00]'} animate-pulse`} />
                  {bookings.filter(b => isSameDay(new Date(b.start), day)).length > 1 && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#003399]' : 'bg-[#FFCC00]'} opacity-50`} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista de agendamentos do dia selecionado */}
      <div className="p-8 bg-slate-50/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-[#003399] uppercase tracking-[0.2em] flex items-center gap-3 italic">
            <div className="w-1.5 h-6 bg-[#FFCC00] rounded-full" />
            Agenda: {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
            {selectedDayBookings.length} Atividades
          </span>
        </div>
        
        <div className="space-y-4">
          {selectedDayBookings.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-100 border-dashed text-center">
              <p className="text-sm text-slate-400 font-medium italic">Nenhum agendamento para este dia.</p>
            </div>
          ) : (
            selectedDayBookings.map((booking) => (
              <div key={booking.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1.5 h-full bg-[#003399] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-14 h-14 bg-slate-50 text-[#003399] rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-[#003399] group-hover:text-white transition-all duration-500">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#003399] tracking-tight italic group-hover:translate-x-1 transition-transform">{booking.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="text-xs text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={14} className="text-[#FFCC00]" />
                        {format(new Date(booking.start), 'HH:mm')} - {format(new Date(booking.end), 'HH:mm')}
                      </span>
                      {booking.class && (
                        <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                          Turma: {booking.class}
                        </span>
                      )}
                      <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                      <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                        <User size={14} className="text-[#FFCC00]" />
                        {booking.user.name || 'Professor'}
                      </span>
                    </div>
                    
                    {/* Detalhes Técnicos */}
                    {(isAdmin || isAV || booking.userId === userId) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {booking.airConditioning && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#003399] rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                            <Wind size={10} /> Ar
                          </span>
                        )}
                        {booking.microphones > 0 && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-yellow-100 shadow-sm">
                            <Mic size={10} /> {booking.microphones} Mic {booking.wirelessMic ? '(S/Fio)' : ''}
                          </span>
                        )}
                        {booking.projection && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                            <Monitor size={10} /> Projeção
                          </span>
                        )}
                        {booking.audioSupport && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-100 shadow-sm">
                            <Music size={10} /> Som
                          </span>
                        )}
                        {booking.schoolComputer && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">
                            <Laptop size={10} /> PC Escola
                          </span>
                        )}
                        {booking.externalComputer && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-100 shadow-sm">
                            <Laptop size={10} /> Notebook
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <span className={`px-4 py-2 text-[9px] font-black rounded-full uppercase tracking-[0.2em] border shadow-sm ${
                    booking.type === 'FIXED' 
                      ? 'bg-purple-50 text-purple-700 border-purple-100' 
                      : 'bg-blue-50 text-[#003399] border-blue-100'
                  }`}>
                    {booking.type === 'FIXED' ? 'Recorrente' : 'Evento Único'}
                  </span>
                  
                  {(isAdmin || (isAV && booking.space.unitId === user?.unitId) || booking.userId === userId) && (
                    <button 
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 active:scale-90"
                      title="Cancelar Agendamento"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
