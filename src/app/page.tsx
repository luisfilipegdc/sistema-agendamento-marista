import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Building2, Calendar, LayoutDashboard, Users, Clock, MapPin } from 'lucide-react'
import Header from '@/components/Header'
import CalendarView from '@/components/CalendarView'

export default async function Home() {
  const [units, allBookings] = await Promise.all([
    prisma.unit.findMany({
      include: {
        _count: {
          select: { spaces: true }
        }
      }
    }),
    prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        start: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      include: {
        user: { select: { name: true } },
        space: { include: { unit: true } }
      },
      orderBy: { start: 'asc' }
    })
  ])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-[#003399] tracking-tight">
            Gestão de Espaços
          </h2>
          <div className="mt-2 h-1.5 w-24 bg-[#FFCC00] mx-auto rounded-full" />
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Selecione a unidade educacional para gerenciar e reservar ambientes de aprendizagem.
          </p>
        </div>

        {/* Novo: Visão Consolidada de Agendamentos */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 text-[#003399] rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar size={22} />
                </div>
                <h3 className="text-2xl font-black text-[#003399] tracking-tight italic">Agenda Global</h3>
              </div>
              <p className="text-gray-500 font-medium">Acompanhe as atividades em tempo real em todas as unidades.</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-[#003399] rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-[#003399] uppercase tracking-widest">{allBookings.length} Atividades Hoje</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendário Interativo */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <CalendarView bookings={allBookings as any} />
            </div>

            {/* Próximos Eventos do Dia */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#003399] p-8 rounded-[2.5rem] text-white relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <Clock size={120} />
                </div>
                
                <h4 className="text-xl font-black mb-8 relative z-10 tracking-tight italic flex items-center gap-3">
                  <Clock size={24} className="text-[#FFCC00]" />
                  Próximas Atividades
                </h4>

                <div className="space-y-6 relative z-10">
                  {allBookings.slice(0, 4).length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-white/20 rounded-3xl">
                      <p className="text-blue-100 font-medium italic">Nenhum evento para hoje.</p>
                    </div>
                  ) : (
                    allBookings.slice(0, 4).map((booking) => (
                      <div key={booking.id} className="bg-white/10 hover:bg-white/20 p-5 rounded-2xl transition-all border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-[#FFCC00] uppercase tracking-[0.2em]">
                            {new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">
                            {booking.space.unit.name}
                          </span>
                        </div>
                        <h5 className="font-black text-sm mb-1 truncate">{booking.title}</h5>
                        <div className="flex items-center gap-2 text-xs text-blue-100 font-medium">
                          <MapPin size={12} className="text-[#FFCC00]" />
                          <span className="truncate">{booking.space.name}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <button className="text-[10px] font-black text-[#FFCC00] uppercase tracking-[0.2em] hover:text-white transition-colors">
                    Ver agenda completa →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <Link
              key={unit.id}
              href={`/unidade/${unit.slug}`}
              className="group relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,51,153,0.1)] transition-all duration-500 border border-gray-100 p-8 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700">
                <Building2 size={120} />
              </div>
              
              <div className="w-20 h-20 bg-blue-50 text-[#003399] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#003399] group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-sm">
                <Building2 size={40} />
              </div>

              <h3 className="text-2xl font-black text-[#003399] mb-3">{unit.name}</h3>
              <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                {unit._count.spaces} ambientes disponíveis para atividades acadêmicas.
              </p>

              <div className="mt-auto flex items-center gap-3 text-[#003399] font-bold text-sm uppercase tracking-widest group-hover:gap-5 transition-all">
                Explorar Espaços
                <span className="text-xl">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Informações rápidas - Estilo Marista */}
        <div className="mt-24 pt-16 border-t border-gray-100 grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 bg-blue-50 text-[#003399] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Calendar size={28} />
            </div>
            <h4 className="text-xl font-black text-[#003399] mb-3">Agendamento Ágil</h4>
            <p className="text-gray-600 font-medium leading-relaxed">Processo simplificado para reserva de salas e equipamentos em poucos cliques.</p>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 bg-yellow-50 text-[#e6b800] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <LayoutDashboard size={28} />
            </div>
            <h4 className="text-xl font-black text-[#003399] mb-3">Gestão Integrada</h4>
            <p className="text-gray-600 font-medium leading-relaxed">Controle total sobre a ocupação dos espaços em todas as unidades educacionais.</p>
          </div>
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Users size={28} />
            </div>
            <h4 className="text-xl font-black text-[#003399] mb-3">Suporte Colaborativo</h4>
            <p className="text-gray-600 font-medium leading-relaxed">Comunicação direta com a equipe de Áudio Visual para suporte técnico especializado.</p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Colégio Marista - Sistema de Agendamento Interno.
        </div>
      </footer>
    </div>
  )
}
