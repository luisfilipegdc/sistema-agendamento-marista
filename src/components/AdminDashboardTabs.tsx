'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Users, 
  Calendar,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  CalendarClock
} from 'lucide-react'
import AdminSpaceManager from './AdminSpaceManager'
import AdminUserManager from './AdminUserManager'
import AdminUnitManager from './AdminUnitManager'
import AdminBlockManager from './AdminBlockManager'
import AdminUnitScheduleManager from './AdminUnitScheduleManager'

interface AdminDashboardTabsProps {
  units: any[]
  spaces: any[]
  users: any[]
  totalBookings: number
  recentUsers: any[]
}

export default function AdminDashboardTabs({ 
  units, 
  spaces, 
  users, 
  totalBookings,
  recentUsers 
}: AdminDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'units' | 'spaces' | 'users' | 'blocks' | 'schedules'>('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'units', label: 'Unidades', icon: Building2 },
    { id: 'spaces', label: 'Ambientes', icon: MapPin },
    { id: 'schedules', label: 'Horários', icon: CalendarClock },
    { id: 'blocks', label: 'Bloqueios', icon: ShieldAlert },
    { id: 'users', label: 'Usuários', icon: Users },
  ]

  return (
    <div className="space-y-10">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white/50 p-2 rounded-[2rem] border border-gray-100 backdrop-blur-sm sticky top-24 z-40 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all duration-300 group ${
                isActive 
                  ? 'bg-[#003399] text-white shadow-lg shadow-blue-900/20' 
                  : 'text-gray-400 hover:text-[#003399] hover:bg-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#FFCC00]' : 'group-hover:scale-110 transition-transform'} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Stats Column */}
            <div className="lg:col-span-2 space-y-10">
              {/* Stats Grid Refresh */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total de Unidades</p>
                      <h3 className="text-4xl font-black text-[#003399] tracking-tight">{units.length}</h3>
                      <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                        <TrendingUp size={14} /> Ativas na rede
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 text-[#003399] rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-[#003399] group-hover:text-white transition-all">
                      <Building2 size={32} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total de Ambientes</p>
                      <h3 className="text-4xl font-black text-[#003399] tracking-tight">{spaces.length}</h3>
                      <p className="text-xs text-[#FFCC00] font-bold mt-2 flex items-center gap-1">
                        <Activity size={14} /> Prontos para uso
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-yellow-50 text-[#FFCC00] rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-[#FFCC00] group-hover:text-[#003399] transition-all">
                      <MapPin size={32} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total de Reservas</p>
                      <h3 className="text-4xl font-black text-[#003399] tracking-tight">{totalBookings}</h3>
                      <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Confirmadas no sistema
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-green-600 group-hover:text-white transition-all">
                      <Calendar size={32} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total de Usuários</p>
                      <h3 className="text-4xl font-black text-[#003399] tracking-tight">{users.length}</h3>
                      <p className="text-xs text-purple-600 font-bold mt-2 flex items-center gap-1">
                        <Users size={14} /> Educadores Maristas
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <Users size={32} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-gradient-to-br from-[#003399] to-[#001a4d] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <LayoutDashboard size={150} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-4 tracking-tight italic">Ações Rápidas</h3>
                  <p className="text-blue-100 mb-8 max-w-md font-medium">
                    Acesse as ferramentas de gestão para manter o ecossistema Marista organizado.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => setActiveTab('units')} className="px-6 py-4 bg-[#FFCC00] text-[#003399] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2">
                      Gerenciar Unidades <ArrowRight size={14} />
                    </button>
                    <button onClick={() => setActiveTab('spaces')} className="px-6 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20">
                      Novo Ambiente
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Column */}
            <div className="space-y-10">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <h2 className="font-black text-[#003399] uppercase tracking-tight italic">Cadastros Recentes</h2>
                </div>
                <div className="p-8 space-y-6">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-4 group cursor-default">
                      <div className="w-12 h-12 bg-gray-50 text-[#003399] rounded-2xl flex items-center justify-center font-black border border-gray-100 group-hover:bg-[#FFCC00] transition-all duration-300">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate tracking-tight">{user.name || 'Sem nome'}</p>
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
                <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center">
                  <button onClick={() => setActiveTab('users')} className="text-[10px] font-black text-[#003399] uppercase tracking-[0.2em] hover:underline transition-all italic">
                    Gerenciar todos os usuários
                  </button>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-[#FFCC00]/10 border border-[#FFCC00]/20 p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={18} className="text-[#003399]" />
                  <h4 className="text-sm font-black text-[#003399] uppercase tracking-widest italic">Dica do Sistema</h4>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Você sabia que pode trocar a senha de qualquer usuário clicando no ícone de chave na aba de Gestão de Usuários? Use essa ferramenta para dar suporte rápido aos professores.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && <AdminUnitManager />}
        {activeTab === 'schedules' && <AdminUnitScheduleManager units={units} />}
        {activeTab === 'spaces' && <AdminSpaceManager initialSpaces={spaces} units={units} />}
        {activeTab === 'blocks' && <AdminBlockManager spaces={spaces} />}
        {activeTab === 'users' && <AdminUserManager />}
      </div>
    </div>
  )
}
