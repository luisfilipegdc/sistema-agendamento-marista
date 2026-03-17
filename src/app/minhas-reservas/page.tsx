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
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-[#003399] tracking-tight mb-2 italic">Minhas Reservas</h2>
          <p className="text-slate-400 font-medium">Gerencie seus agendamentos e requisitos técnicos.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-400 mb-2 italic">Nenhuma reserva encontrada</h3>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">Você ainda não realizou nenhum agendamento no sistema.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-[#003399] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#002266] transition-all shadow-lg shadow-blue-900/10">
              Agendar agora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-2 h-full bg-[#003399] opacity-10 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-[#003399] text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                        {booking.type === 'FIXED' ? 'Série Recorrente' : 'Evento Único'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                        ID: {booking.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-[#003399] mb-4 tracking-tight italic">{booking.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <Calendar size={16} className="text-[#FFCC00]" />
                        {format(new Date(booking.start), "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <Clock size={16} className="text-[#FFCC00]" />
                        {format(new Date(booking.start), "HH:mm")} - {format(new Date(booking.end), "HH:mm")}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <MapPin size={16} className="text-[#FFCC00]" />
                        {booking.space.name} ({booking.space.unit.name})
                      </div>
                    </div>

                    {/* Requisitos Técnicos */}
                    <div className="mt-6 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {booking.airConditioning && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#003399] rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">
                            <Wind size={12} /> Ar
                          </div>
                        )}
                        {booking.microphones > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-xl text-[9px] font-black uppercase tracking-widest border border-yellow-100">
                            <Mic size={12} /> {booking.microphones} Mic {booking.wirelessMic ? '(S/Fio)' : ''}
                          </div>
                        )}
                        {booking.projection && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-[9px] font-black uppercase tracking-widest border border-green-100">
                            <Monitor size={12} /> Projeção
                          </div>
                        )}
                        {booking.schoolComputer && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            <Laptop size={12} /> PC Escola
                          </div>
                        )}
                        {booking.externalComputer && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-100">
                            <Laptop size={12} /> Notebook
                          </div>
                        )}
                      </div>

                      {booking.techNotes && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3 items-start">
                          <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Observações da Equipe de AV</p>
                            <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                              {booking.techNotes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="flex-1 md:flex-none px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2">
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
