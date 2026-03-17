import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, Video, QrCode } from 'lucide-react'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
    <div className="min-h-screen bg-white">
      <Header />
      <header className="bg-gray-50 border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href={`/unidade/${space.unit.slug}`} className="flex items-center gap-2 text-[#003399] hover:bg-white px-3 py-1.5 rounded-lg transition-all text-sm font-bold border border-transparent hover:border-gray-200">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Voltar para {space.unit.name}</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
          <div className="text-center">
            <h2 className="text-xs sm:text-sm font-black text-[#003399] uppercase tracking-[0.15em] leading-tight">{space.name}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest sm:hidden">{space.unit.name}</p>
          </div>
          <div className="flex justify-end">
             <QRCodeDisplay slug={space.slug} spaceName={space.name} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Informações e Formulário */}
          <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Users size={60} />
              </div>
              <h2 className="text-xl font-black text-[#003399] mb-6 tracking-tight">Detalhes do Ambiente</h2>
              <div className="space-y-5">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-blue-50 text-[#003399] rounded-xl flex items-center justify-center shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacidade</p>
                    <p className="text-sm font-bold text-gray-900">{space.capacity || 'Configuração variável'} pessoas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 bg-yellow-50 text-[#e6b800] rounded-xl flex items-center justify-center shrink-0">
                    <Video size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recursos Disponíveis</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {space.name.toLowerCase().includes('estúdio') 
                        ? 'Infraestrutura completa para gravação, croma key e iluminação profissional.' 
                        : 'Sistema de projeção, áudio integrado e climatização.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <BookingForm spaceId={space.id} spaceName={space.name} />
          </div>

          {/* Agenda / Calendário Mensal */}
          <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-black text-[#003399] uppercase tracking-widest">Calendário de Ocupação</h3>
              <CalendarExport bookings={space.bookings as any} spaceName={space.name} />
            </div>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <CalendarView bookings={space.bookings as any} />
            </div>
            
            {isAdmin && (
              <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl flex items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-orange-900 uppercase tracking-tight">Gestão Administrativa</h4>
                    <p className="text-xs text-orange-700 font-medium">Controle de ocupação e edição de reservas habilitado.</p>
                  </div>
                </div>
                <button className="px-5 py-2.5 bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-orange-700 transition-all shadow-md active:scale-95 whitespace-nowrap">
                  Editar Agenda
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
