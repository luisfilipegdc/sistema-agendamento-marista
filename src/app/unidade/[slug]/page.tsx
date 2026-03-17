import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users, Video, Building2, ChevronRight, Info } from 'lucide-react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const unit = await prisma.unit.findUnique({
    where: {
      slug: slug
    },
    include: {
      spaces: {
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      }
    }
  })

  if (!unit) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <Header />
      
      {/* Sub-header Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#003399] hover:bg-slate-50 px-4 py-2 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-transparent hover:border-slate-100 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Voltar para Unidades</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-50 text-[#FFCC00] rounded-lg flex items-center justify-center shadow-inner">
              <Building2 size={16} />
            </div>
            <h2 className="text-sm font-black text-[#003399] uppercase tracking-[0.2em] italic">{unit.name}</h2>
          </div>
          <div className="hidden sm:block">
            <div className="px-4 py-2 bg-blue-50 text-[#003399] rounded-full text-[10px] font-black uppercase tracking-widest">
              {unit.spaces.length} Ambientes Ativos
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="mb-16 sm:mb-24 relative">
          <div className="absolute -left-4 top-0 w-1 h-20 bg-[#FFCC00] rounded-full" />
          <h2 className="text-4xl sm:text-6xl font-black text-[#003399] tracking-tight mb-6 italic">
            Espaços <span className="text-slate-300">Educacionais</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            Selecione o ambiente ideal para suas atividades pedagógicas ou eventos institucionais.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
          {unit.spaces.map((space) => (
            <div
              key={space.id}
              className="group relative bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden hover:border-[#003399]/20 hover:shadow-[0_40px_80px_rgba(0,51,153,0.1)] transition-all duration-700 flex flex-col"
            >
              {/* Card Header Decoration */}
              <div className="h-2 w-full bg-slate-50 group-hover:bg-[#FFCC00] transition-colors duration-700" />
              
              <div className="p-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-slate-50 text-[#003399] rounded-2xl flex items-center justify-center group-hover:bg-[#003399] group-hover:text-white transition-all duration-700 shadow-inner group-hover:rotate-6">
                    {space.name.toLowerCase().includes('estúdio') || space.name.toLowerCase().includes('auditório') ? <Video size={32} /> : <Users size={32} />}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Disponível
                    </span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-black text-[#003399] mb-4 tracking-tight italic group-hover:text-blue-700 transition-colors">{space.name}</h3>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-sm text-slate-400 font-bold">
                    <MapPin size={18} className="text-[#FFCC00]" />
                    <span className="uppercase tracking-widest text-[10px]">Infraestrutura Completa</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
                    <Users size={18} className="text-[#FFCC00]" />
                    <span className="tracking-tight italic text-base">Capacidade: {space.capacity || 'Sob demanda'} pessoas</span>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Agenda Ativa</span>
                    <span className="text-base font-black text-[#003399] italic">
                      {space._count.bookings} Reservas
                    </span>
                  </div>
                  <Link
                    href={`/espaco/${space.slug}`}
                    className="w-14 h-14 bg-[#003399] text-white rounded-2xl flex items-center justify-center hover:bg-[#FFCC00] hover:text-[#003399] transition-all duration-500 shadow-lg shadow-blue-900/10 group-hover:scale-110"
                  >
                    <ChevronRight size={24} />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State / Add Suggestion */}
          <div className="bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center text-center group hover:bg-white hover:border-[#003399]/20 transition-all duration-700">
            <div className="w-16 h-16 bg-white text-slate-300 rounded-2xl flex items-center justify-center mb-6 group-hover:text-[#003399] transition-colors">
              <Info size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-400 mb-2 italic">Novos Ambientes?</h4>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[200px]">
              Contate o administrador para cadastrar novos espaços nesta unidade.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
