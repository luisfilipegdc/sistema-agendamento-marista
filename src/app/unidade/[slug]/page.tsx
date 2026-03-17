import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users, Video, Building2 } from 'lucide-react'
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
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <header className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#003399] hover:bg-white px-3 py-1.5 rounded-lg transition-all text-sm font-bold border border-transparent hover:border-gray-200">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Voltar para Unidades</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#FFCC00]" />
            <h2 className="text-xs sm:text-sm font-black text-[#003399] uppercase tracking-[0.15em]">{unit.name}</h2>
          </div>
          <div className="w-24 sm:w-32"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-[#003399] tracking-tight mb-2">Espaços Educacionais</h2>
          <div className="h-1 w-20 bg-[#FFCC00] rounded-full mb-4" />
          <p className="text-gray-600 font-medium">Selecione o ambiente para reserva técnica ou pedagógica.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {unit.spaces.map((space) => (
            <div
              key={space.id}
              className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:border-[#003399]/30 hover:shadow-[0_8px_30px_rgb(0,51,153,0.08)] transition-all duration-500 group"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-blue-50 text-[#003399] rounded-2xl group-hover:bg-[#003399] group-hover:text-white transition-all duration-500 shadow-sm">
                    {space.name.toLowerCase().includes('estúdio') ? <Video size={28} /> : <Users size={28} />}
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-green-100">
                    Ativo
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-[#003399] mb-3">{space.name}</h3>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <MapPin size={16} className="text-[#FFCC00]" />
                    <span>Ambiente Interno</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <Users size={16} className="text-[#FFCC00]" />
                    <span>Capacidade: {space.capacity || 'Sob demanda'}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reservas</span>
                    <span className="text-sm font-bold text-[#003399]">
                      {space._count.bookings} registradas
                    </span>
                  </div>
                  <Link
                    href={`/espaco/${space.slug}`}
                    className="px-6 py-3 bg-[#003399] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#002266] transition-all shadow-md active:scale-95"
                  >
                    Ver Agenda
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
