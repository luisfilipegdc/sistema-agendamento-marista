import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Building2, Calendar, LayoutDashboard, Users, Clock, MapPin, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import Header from '@/components/Header'
import CalendarView from '@/components/CalendarView'
import HumanDecisionFlow from '@/components/HumanDecisionFlow'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [units, allBookings] = await Promise.all([
    prisma.unit.findMany({
      include: {
        _count: {
          select: { spaces: true }
        },
        spaces: {
          select: {
            id: true,
            name: true,
            slug: true,
            capacity: true
          }
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
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-20 sm:mb-28">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#003399] rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-700">
              <ShieldCheck size={14} /> Sistema Oficial Marista Brasil
            </div>
            <h2 className="text-4xl sm:text-7xl font-black text-[#003399] tracking-tight mb-8 italic">
              Gestão de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003399] to-blue-600">Espaços</span>
            </h2>
            <p className="text-lg sm:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
              Infraestrutura inteligente para potencializar a excelência acadêmica e a inovação pedagógica.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#fluxo-decisao" className="px-8 py-5 bg-[#003399] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-[#002266] transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center gap-3">
                Agendar Agora <ArrowRight size={18} />
              </a>
              <div className="px-8 py-5 bg-white text-slate-600 rounded-[2rem] font-black text-xs uppercase tracking-widest border border-slate-200 flex items-center gap-3">
                <Zap size={18} className="text-[#FFCC00]" /> {allBookings.length} Atividades Hoje
              </div>
            </div>
          </div>

          {/* NOVO: Fluxo de Decisão Humanizado */}
          <div id="fluxo-decisao" className="mb-32 scroll-mt-32">
            <HumanDecisionFlow units={units as any} />
          </div>

          {/* Agenda Global Section */}
          <div className="mb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-white text-[#003399] rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/5 border border-slate-100">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-[#003399] tracking-tight italic">Agenda Global</h3>
                </div>
                <p className="text-slate-500 font-medium text-lg">Visão em tempo real da ocupação em toda a rede.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Calendário */}
              <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,51,153,0.08)] border border-slate-100 overflow-hidden">
                <CalendarView bookings={allBookings as any} />
              </div>

              {/* Sidebar: Atividades */}
              <div className="lg:col-span-1 flex flex-col gap-8">
                <div className="bg-gradient-to-br from-[#003399] to-[#001a4d] p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-blue-900/20 flex-1">
                  <div className="absolute -right-10 -top-10 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                    <Clock size={200} />
                  </div>
                  
                  <div className="relative z-10">
                    <h4 className="text-2xl font-black mb-10 tracking-tight italic flex items-center gap-3">
                      <Clock size={28} className="text-[#FFCC00]" />
                      Próximas Atividades
                    </h4>

                    <div className="space-y-6">
                      {allBookings.slice(0, 4).length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-white/20 rounded-[2rem]">
                          <p className="text-blue-200 font-medium italic opacity-60">Nenhuma atividade agendada para hoje.</p>
                        </div>
                      ) : (
                        allBookings.slice(0, 4).map((booking) => (
                          <div key={booking.id} className="bg-white/5 hover:bg-white/10 p-6 rounded-3xl transition-all border border-white/10 group/item">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-black text-[#FFCC00] uppercase tracking-[0.2em] bg-yellow-500/10 px-3 py-1 rounded-full">
                                {new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest opacity-60">
                                {booking.space.unit.name}
                              </span>
                            </div>
                            <h5 className="font-black text-base mb-2 truncate group-hover/item:text-[#FFCC00] transition-colors">{booking.title}</h5>
                            <div className="flex items-center gap-2 text-xs text-blue-100 font-medium opacity-80">
                              <MapPin size={14} className="text-[#FFCC00]" />
                              <span className="truncate">{booking.space.name}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/10">
                      <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-[#003399] rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border border-white/10">
                        Ver Agenda Completa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              { icon: Calendar, title: 'Agendamento Ágil', desc: 'Processo simplificado para reserva de salas e equipamentos em segundos.', color: 'blue' },
              { icon: LayoutDashboard, title: 'Gestão Integrada', desc: 'Controle total sobre a ocupação dos espaços em toda a rede Marista.', color: 'yellow' },
              { icon: Users, title: 'Suporte Técnico', desc: 'Integração direta com a equipe de AV para garantir o sucesso da sua aula.', color: 'green' }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                <div className={`w-16 h-16 mb-8 rounded-[1.5rem] flex items-center justify-center shadow-inner ${
                  f.color === 'blue' ? 'bg-blue-50 text-[#003399]' : 
                  f.color === 'yellow' ? 'bg-yellow-50 text-[#e6b800]' : 'bg-green-50 text-green-600'
                }`}>
                  <f.icon size={32} />
                </div>
                <h4 className="text-2xl font-black text-[#003399] mb-4 tracking-tight italic">{f.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-10 h-10 bg-[#003399] rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black text-[#003399] leading-none uppercase tracking-tighter">Agendamento</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Marista Brasil</span>
            </div>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Colégio Marista • Sistema Interno de Gestão de Ativos
          </p>
          <div className="flex gap-6">
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#003399] transition-colors">Termos</button>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#003399] transition-colors">Suporte</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
