import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users, Video, QrCode, Info, ShieldCheck, Settings } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Header from '@/components/Header'

import QRCodeDisplay from '@/components/QRCodeDisplay'
import BookingForm from '@/components/BookingForm'
import CalendarView from '@/components/CalendarView'
import CalendarExport from '@/components/CalendarExport'

export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  const space = await prisma.space.findUnique({
    where: { slug },
    include: {
      unit: true,
      bookings: {
        include: {
          user: {
            select: { name: true }
          },
          space: {
            select: { unitId: true }
          }
        },
        orderBy: { start: 'asc' }
      },
    },
  })

  if (!space) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      
      {/* Sub-header Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/unidade/${space.unit.slug}`} className="flex items-center gap-2 text-[#003399] hover:bg-slate-50 px-4 py-2 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-transparent hover:border-slate-100 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Voltar para {space.unit.name}</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 text-[#003399] rounded-lg flex items-center justify-center shadow-inner">
              <Video size={16} />
            </div>
            <h2 className="text-sm font-black text-[#003399] uppercase tracking-[0.2em] italic">{space.name}</h2>
          </div>

          <div className="flex items-center gap-4">
             <CalendarExport bookings={space.bookings as any} spaceName={space.name} />
             <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block" />
             <QRCodeDisplay slug={space.slug} spaceName={space.name} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Lado Esquerdo: Info e Formulário (4 colunas) */}
          <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700">
                <Info size={120} />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-[#003399] mb-8 tracking-tight italic flex items-center gap-3">
                  <ShieldCheck className="text-[#FFCC00]" size={24} />
                  Detalhes Técnicos
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-5 group/item">
                    <div className="w-12 h-12 bg-blue-50 text-[#003399] rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover/item:bg-[#003399] group-hover/item:text-white transition-all duration-500">
                      <Users size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capacidade Máxima</p>
                      <p className="text-lg font-black text-slate-700 tracking-tight italic">{space.capacity || 'Configuração variável'} pessoas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group/item">
                    <div className="w-12 h-12 bg-yellow-50 text-[#e6b800] rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover/item:bg-[#FFCC00] group-hover/item:text-[#003399] transition-all duration-500">
                      <Clock size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duração Sugerida</p>
                      <p className="text-lg font-black text-slate-700 tracking-tight italic">Blocos de 45 min</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group/item">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover/item:bg-green-600 group-hover/item:text-white transition-all duration-500">
                      <Settings size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recursos Disponíveis</p>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed mt-1">
                        {space.name.toLowerCase().includes('estúdio') 
                          ? 'Infraestrutura profissional para gravação, croma key e iluminação.' 
                          : 'Ambiente climatizado com sistema de projeção e áudio integrado.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário Refatorado */}
            <BookingForm spaceId={space.id} spaceName={space.name} />
          </div>

          {/* Lado Direito: Agenda (8 colunas) */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-8">
            <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,51,153,0.08)] border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white text-[#003399] rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#003399] uppercase tracking-widest text-xs italic">Agenda do Ambiente</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{space.unit.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#003399] rounded-full text-[9px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Sincronizado
                </div>
              </div>
              <CalendarView bookings={space.bookings as any} />
            </div>

            {/* Dica de Uso */}
            <div className="bg-gradient-to-r from-blue-600 to-[#003399] p-8 rounded-[2.5rem] text-white flex items-center gap-6 relative overflow-hidden shadow-xl shadow-blue-900/10">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <Settings size={100} />
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                <Info size={32} className="text-[#FFCC00]" />
              </div>
              <div className="relative z-10">
                <h4 className="text-lg font-black tracking-tight italic mb-1">Dica de Agendamento</h4>
                <p className="text-sm text-blue-100 font-medium opacity-80 leading-relaxed">
                  Para eventos que necessitam de suporte técnico avançado, realize a reserva com pelo menos 48h de antecedência para garantir a disponibilidade da equipe de AV.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
