import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { Calendar, Clock, MapPin, Trash2, Wind, Mic, Monitor, Laptop, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

type BookingWithSpace = {
  id: string
  title: string
  type: string
  start: Date
  end: Date
  airConditioning: boolean
  microphones: number
  wirelessMic: boolean
  projection: boolean
  schoolComputer: boolean
  externalComputer: boolean
  techNotes?: string | null
  space: {
    name: string
    unit: { name: string }
  }
}

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }
  if (!session.user?.email) {
    redirect('/login')
  }

  const bookings = (await prisma.booking.findMany({
    where: {
      user: {
        email: session.user.email
      }
    },
    include: {
      space: {
        include: {
          unit: true
        }
      }
    },
    orderBy: {
      start: 'desc'
    }
  })) as BookingWithSpace[]

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-1 text-3xl font-semibold tracking-tight text-foreground">Minhas Reservas</h2>
          <p className="text-sm text-muted-foreground">Gerencie seus agendamentos e requisitos técnicos.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Calendar size={40} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Nenhuma reserva encontrada</h3>
            <p className="mx-auto mb-6 max-w-xs text-sm text-muted-foreground">Você ainda não realizou nenhum agendamento no sistema.</p>
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-medium tracking-wide text-primary-foreground uppercase hover:bg-primary/90">
              Agendar agora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6">
                <div className="absolute left-0 top-0 h-full w-1.5 bg-primary/25" />
                
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="rounded-full border border-border bg-secondary px-3 py-1 text-[9px] font-medium tracking-wide text-foreground uppercase">
                        {booking.type === 'FIXED' ? 'Série Recorrente' : 'Evento Único'}
                      </span>
                      <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        ID: {booking.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="mb-3 text-xl font-semibold tracking-tight text-foreground">{booking.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calendar size={16} className="text-primary" />
                        {format(new Date(booking.start), "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Clock size={16} className="text-primary" />
                        {format(new Date(booking.start), "HH:mm")} - {format(new Date(booking.end), "HH:mm")}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <MapPin size={16} className="text-primary" />
                        {booking.space.name} ({booking.space.unit.name})
                      </div>
                    </div>

                    {/* Requisitos Técnicos */}
                    <div className="mt-6 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {booking.airConditioning && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[9px] font-medium tracking-wide text-foreground uppercase">
                            <Wind size={12} /> Ar
                          </div>
                        )}
                        {booking.microphones > 0 && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[9px] font-medium tracking-wide text-foreground uppercase">
                            <Mic size={12} /> {booking.microphones} Mic {booking.wirelessMic ? '(S/Fio)' : ''}
                          </div>
                        )}
                        {booking.projection && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[9px] font-medium tracking-wide text-foreground uppercase">
                            <Monitor size={12} /> Projeção
                          </div>
                        )}
                        {booking.schoolComputer && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[9px] font-medium tracking-wide text-foreground uppercase">
                            <Laptop size={12} /> PC Escola
                          </div>
                        )}
                        {booking.externalComputer && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-[9px] font-medium tracking-wide text-foreground uppercase">
                            <Laptop size={12} /> Notebook
                          </div>
                        )}
                      </div>

                      {booking.techNotes && (
                        <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                          <FileText size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="mb-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Observações da Equipe de AV</p>
                            <p className="text-xs leading-relaxed text-foreground">
                              {booking.techNotes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-5 py-2.5 text-[10px] font-medium tracking-wide text-red-600 uppercase hover:bg-red-100 md:flex-none">
                      <Trash2 size={16} /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
