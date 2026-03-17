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
  eachDayOfInterval,
  isToday
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Trash2, Wind, Mic, Monitor, Laptop, Music, FileText } from 'lucide-react'
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

  const hasConflict = (booking: Booking) => {
    const start = new Date(booking.start).getTime()
    const end = new Date(booking.end).getTime()
    return selectedDayBookings.some((other) => {
      if (other.id === booking.id) return false
      const otherStart = new Date(other.start).getTime()
      const otherEnd = new Date(other.end).getTime()
      return start < otherEnd && otherStart < end
    })
  }

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
    <div className="overflow-hidden bg-card">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-5">
        <h2 className="flex items-center gap-3 text-lg font-medium tracking-tight text-foreground capitalize">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <CalendarIcon size={18} className="text-primary" />
          </div>
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="rounded-full border border-border p-2.5 transition-colors hover:bg-secondary active:scale-95"
          >
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <button 
            onClick={nextMonth}
            className="rounded-full border border-border p-2.5 transition-colors hover:bg-secondary active:scale-95"
          >
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-secondary/20">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
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
                relative flex h-14 flex-col items-center justify-center border-r border-b border-border transition-colors group sm:h-20
                ${!isCurrentMonth ? 'bg-secondary/20 text-muted-foreground/50' : 'text-muted-foreground hover:bg-secondary/60'}
                ${isSelected ? 'z-10 bg-primary/10 text-primary' : ''}
              `}
            >
              <span className={`
                mb-1 text-sm font-medium transition-all
                ${isCurrentDay && !isSelected ? 'flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground' : ''}
                ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
              `}>
                {format(day, 'd')}
              </span>
              
              {hasBooking && (
                <div className="flex gap-1">
                  <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-primary/80'} animate-pulse`} />
                  {bookings.filter(b => isSameDay(new Date(b.start), day)).length > 1 && (
                    <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-primary/80'} opacity-45`} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista de agendamentos do dia selecionado */}
      <div className="bg-secondary/20 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-2 text-xs font-medium tracking-wide text-primary uppercase">
            <div className="h-5 w-1 rounded-full bg-primary" />
            Agenda: {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h3>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {selectedDayBookings.length} Atividades
          </span>
        </div>
        
        <div className="space-y-4">
          {selectedDayBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">Nenhum agendamento para este dia.</p>
            </div>
          ) : (
            selectedDayBookings.map((booking) => (
              <div key={booking.id} className={`group relative flex flex-col justify-between gap-5 overflow-hidden rounded-xl border bg-background p-5 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center ${hasConflict(booking) ? 'border-red-300' : 'border-border'}`}>
                <div className={`absolute left-0 top-0 h-full w-1 opacity-0 transition-opacity group-hover:opacity-100 ${hasConflict(booking) ? 'bg-red-500/60' : 'bg-primary/30'}`} />
                
                <div className="flex items-start gap-5 relative z-10">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-medium tracking-tight text-foreground group-hover:translate-x-0.5 transition-transform">{booking.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        <Clock size={14} className="text-primary" />
                        {format(new Date(booking.start), 'HH:mm')} - {format(new Date(booking.end), 'HH:mm')}
                      </span>
                      {booking.class && (
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Turma: {booking.class}
                        </span>
                      )}
                      <span className="hidden text-xs text-muted-foreground sm:inline">•</span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <User size={14} className="text-primary" />
                        {booking.user.name || 'Professor'}
                      </span>
                    </div>
                    
                    {/* Detalhes Técnicos */}
                    {(isAdmin || isAV || booking.userId === userId) && (
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {booking.airConditioning && (
                            <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[9px] font-medium tracking-wide text-foreground uppercase">
                              <Wind size={10} /> Ar
                            </span>
                          )}
                          {booking.microphones > 0 && (
                            <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[9px] font-medium tracking-wide text-foreground uppercase">
                              <Mic size={10} /> {booking.microphones} Mic {booking.wirelessMic ? '(S/Fio)' : ''}
                            </span>
                          )}
                          {booking.projection && (
                            <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[9px] font-medium tracking-wide text-foreground uppercase">
                              <Monitor size={10} /> Projeção
                            </span>
                          )}
                          {booking.audioSupport && (
                            <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[9px] font-medium tracking-wide text-foreground uppercase">
                              <Music size={10} /> Som
                            </span>
                          )}
                          {booking.schoolComputer && (
                            <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[9px] font-medium tracking-wide text-foreground uppercase">
                              <Laptop size={10} /> PC Escola
                            </span>
                          )}
                          {booking.externalComputer && (
                            <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[9px] font-medium tracking-wide text-foreground uppercase">
                              <Laptop size={10} /> Notebook
                            </span>
                          )}
                        </div>
                        
                        {booking.techNotes && (
                          <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/60 p-3">
                            <FileText size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
                            <p className="text-[10px] font-medium leading-tight text-muted-foreground">
                              {booking.techNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  {hasConflict(booking) && (
                    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[9px] font-medium uppercase tracking-wide text-red-700">
                      Conflito
                    </span>
                  )}
                  <span className={`rounded-full border px-3 py-1.5 text-[9px] font-medium uppercase tracking-wide ${
                    booking.type === 'FIXED' 
                      ? 'bg-secondary text-foreground border-border' 
                      : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {booking.type === 'FIXED' ? 'Recorrente' : 'Evento Único'}
                  </span>
                  
                  {(isAdmin || (isAV && booking.space.unitId === user?.unitId) || booking.userId === userId) && (
                    <button 
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="rounded-full border border-transparent p-2.5 text-muted-foreground transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
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
