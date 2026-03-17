import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { 
  Users, 
  Building2, 
  MapPin, 
  Calendar, 
  Activity,
} from 'lucide-react'
import AdminSpaceManager from '@/components/AdminSpaceManager'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  if (!isAdmin) {
    redirect('/')
  }

  const [units, spaces, users, totalBookings] = await Promise.all([
    prisma.unit.findMany({ 
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' } 
    }),
    prisma.space.findMany({ 
      include: { unit: true },
      orderBy: { unit: { name: 'asc' } }
    }),
    prisma.user.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      take: 5 
    }),
    prisma.booking.count()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#003399] tracking-tight">Painel Administrativo</h1>
          <p className="text-gray-500 font-medium">Gestão centralizada de ativos e usuários Marista Brasil.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 text-[#003399] rounded-2xl flex items-center justify-center shadow-sm">
              <Building2 size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidades</p>
              <p className="text-2xl font-black text-[#003399]">{units.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
              <MapPin size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Espaços</p>
              <p className="text-2xl font-black text-[#003399]">{spaces.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reservas</p>
              <p className="text-2xl font-black text-[#003399]">{totalBookings}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuários</p>
              <p className="text-2xl font-black text-[#003399]">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Gerenciador de Espaços (Client Component) */}
          <div className="lg:col-span-2">
            <AdminSpaceManager initialSpaces={spaces as any} units={units as any} />
          </div>

          {/* Logs / Atividades Recentes */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <h2 className="font-black text-[#003399] uppercase tracking-tight">Usuários Recentes</h2>
              </div>
              <div className="p-8 space-y-6">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center font-black border border-gray-100 group-hover:bg-[#003399] group-hover:text-white transition-all duration-300">
                      {user.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold truncate mb-1">{user.email}</p>
                      <span className={`text-[9px] px-2 py-0.5 font-black uppercase tracking-widest rounded-full border ${
                        user.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 
                        user.role === 'AV' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-gray-50/50 border-t border-gray-50">
                <button className="w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-[#003399] transition-colors">
                  Ver Relatório Completo
                </button>
              </div>
            </div>

            {/* Card de Ajuda Admin */}
            <div className="bg-[#003399] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Building2 size={100} />
              </div>
              <h3 className="text-xl font-black mb-4 relative z-10 tracking-tight">Suporte ao Gestor</h3>
              <p className="text-blue-100 text-sm mb-6 font-medium leading-relaxed relative z-10">
                Precisa de ajuda com a configuração de novas unidades ou permissões de usuários?
              </p>
              <Link 
                href="/admin/manual"
                className="w-full py-4 bg-[#FFCC00] text-[#003399] flex items-center justify-center font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white transition-all shadow-lg active:scale-95 relative z-10"
              >
                Manual do Sistema
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

