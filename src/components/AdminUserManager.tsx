'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Edit2, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  Key, 
  X, 
  Save, 
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Unit {
  id: string
  name: string
}

interface User {
  id: string
  name: string | null
  email: string
  role: 'ADMIN' | 'AV' | 'USER'
  unitId: string | null
  unit?: { name: string }
  _count?: { bookings: number }
}

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form states
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState<'ADMIN' | 'AV' | 'USER'>('USER')
  const [editUnitId, setEditUnitId] = useState('')
  const [editPassword, setEditPassword] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, unitsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/units')
      ])
      const usersData = await usersRes.json()
      const unitsData = await unitsRes.json()
      setUsers(usersData)
      setUnits(unitsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setEditName(user.name || '')
    setEditRole(user.role)
    setEditUnitId(user.unitId || '')
    setEditPassword('')
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!editingUser) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editName,
          role: editRole,
          unitId: editUnitId,
          password: editPassword || undefined
        })
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' })
        fetchData()
        setIsModalOpen(false)
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Erro ao atualizar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão' })
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Usuário excluído!' })
        fetchData()
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Erro ao excluir' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão' })
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003399]" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-[#003399] rounded-2xl flex items-center justify-center shadow-inner">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#003399] tracking-tight italic">Gestão de Usuários</h2>
            <p className="text-sm text-gray-500 font-medium">{users.length} usuários cadastrados</p>
          </div>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#003399]/20 transition-all font-medium text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold text-sm">{message.text}</p>
          <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100"><X size={18}/></button>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-[#003399] uppercase tracking-[0.2em]">Usuário</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#003399] uppercase tracking-[0.2em]">Perfil / Unidade</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#003399] uppercase tracking-[0.2em]">Atividade</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#003399] uppercase tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FFCC00]/10 text-[#003399] rounded-xl flex items-center justify-center font-black text-sm">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-[#003399] text-sm tracking-tight italic">{user.name || 'Sem nome'}</p>
                        <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                        user.role === 'AV' ? 'bg-blue-50 text-[#003399]' : 'bg-gray-50 text-gray-600'
                      }`}>
                        <Shield size={10} />
                        {user.role}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Building size={12} className="text-[#FFCC00]" />
                        {user.unit?.name || 'Não vinculada'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#003399]">{user._count?.bookings || 0}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Reservas</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-gray-400 hover:text-[#003399] hover:bg-blue-50 rounded-xl transition-all"
                        title="Editar Usuário"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir Usuário"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#003399] text-white rounded-xl flex items-center justify-center">
                  <UserIcon size={20} />
                </div>
                <h3 className="text-xl font-black text-[#003399] tracking-tight italic">Editar Usuário</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFCC00]" size={18} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#003399]/20 font-medium"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Perfil de Acesso</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFCC00]" size={18} />
                    <select
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#003399]/20 font-medium appearance-none"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                    >
                      <option value="USER">Professor</option>
                      <option value="AV">Equipe AV</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Unidade</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFCC00]" size={18} />
                    <select
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#003399]/20 font-medium appearance-none"
                      value={editUnitId}
                      onChange={(e) => setEditUnitId(e.target.value)}
                    >
                      <option value="">Nenhuma</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-6 bg-[#003399]/5 rounded-[2rem] border border-[#003399]/10">
                <div className="flex items-center gap-2 mb-2">
                  <Key size={16} className="text-[#003399]" />
                  <label className="text-[10px] font-black text-[#003399] uppercase tracking-[0.2em]">Redefinir Senha</label>
                </div>
                <input
                  type="password"
                  placeholder="Nova senha (deixe em branco para manter)"
                  className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-[#003399]/20 font-medium text-sm"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 font-medium italic">* Mínimo 6 caracteres caso queira trocar.</p>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 px-6 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-4 px-6 bg-[#003399] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#002266] shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
