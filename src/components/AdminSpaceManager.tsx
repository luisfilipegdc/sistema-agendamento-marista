'use client'

import { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Building2,
  Users,
  FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Space {
  id: string
  name: string
  slug: string
  capacity: number
  description: string | null
  unitId: string
  unit: { name: string }
}

interface Unit {
  id: string
  name: string
}

interface AdminSpaceManagerProps {
  initialSpaces: Space[]
  units: Unit[]
}

export default function AdminSpaceManager({ initialSpaces, units }: AdminSpaceManagerProps) {
  const router = useRouter()
  const [spaces, setSpaces] = useState(initialSpaces)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form State
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    unitId: units[0]?.id || '',
    capacity: '30',
    description: ''
  })

  const openModal = (space?: Space) => {
    if (space) {
      setEditingSpace(space)
      setFormData({
        name: space.name,
        unitId: space.unitId,
        capacity: (space.capacity ?? 0).toString(),
        description: space.description || ''
      })
    } else {
      setEditingSpace(null)
      setFormData({
        name: '',
        unitId: units[0]?.id || '',
        capacity: '30',
        description: ''
      })
    }
    setIsModalOpen(true)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = '/api/admin/spaces'
      const method = editingSpace ? 'PATCH' : 'POST'
      const body = editingSpace ? { ...formData, id: editingSpace.id } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) throw new Error('Erro ao salvar espaço')

      setSuccess(editingSpace ? 'Espaço atualizado com sucesso!' : 'Novo espaço criado!')
      setTimeout(() => setSuccess(null), 3000)
      setIsModalOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este espaço? Todos os agendamentos vinculados serão perdidos.')) return

    setIsDeleting(id)
    try {
      const res = await fetch(`/api/admin/spaces?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir espaço')
      
      setSuccess('Espaço excluído com sucesso')
      setTimeout(() => setSuccess(null), 3000)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsDeleting(null)
    }
  }

  // Agrupar espaços por unidade
  const spacesByUnit = units.map(unit => ({
    ...unit,
    spaces: spaces.filter(s => s.unitId === unit.id)
  }))

  return (
    <div className="space-y-12">
      {/* Header com botão de Criar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#003399] tracking-tight">Gestão de Ambientes</h1>
          <p className="text-gray-500 text-sm font-medium">Cadastre e organize os espaços por unidade.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-[#003399] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#002266] transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Novo Espaço
        </button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          {success}
        </div>
      )}

      {/* Listagem de Espaços Agrupados por Unidade */}
      <div className="space-y-10">
        {spacesByUnit.map((unitGroup) => (
          <div key={unitGroup.id} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 bg-blue-50 text-[#003399] rounded-lg flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <h2 className="text-sm font-black text-[#003399] uppercase tracking-[0.15em]">{unitGroup.name}</h2>
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{unitGroup.spaces.length} Ambientes</span>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5">Nome do Ambiente</th>
                      <th className="px-8 py-5">Capacidade</th>
                      <th className="px-8 py-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {unitGroup.spaces.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center">
                          <p className="text-sm text-gray-400 font-medium italic">Nenhum ambiente cadastrado nesta unidade.</p>
                        </td>
                      </tr>
                    ) : (
                      unitGroup.spaces.map((space) => (
                        <tr key={space.id} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-50 text-[#003399] rounded-xl flex items-center justify-center group-hover:bg-[#003399] group-hover:text-white transition-all">
                                {space.name.toLowerCase().includes('anfiteatro') ? <Users size={20} /> : <Building2 size={20} />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#003399]">{space.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{space.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                              <Users size={14} className="text-gray-300" />
                              {space.capacity} pessoas
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3">
                              <button 
                                onClick={() => openModal(space)}
                                className="p-2.5 text-gray-400 hover:text-[#003399] hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                                title="Editar Espaço"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(space.id)}
                                disabled={isDeleting === space.id}
                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 disabled:opacity-50"
                                title="Excluir Espaço"
                              >
                                {isDeleting === space.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#003399] p-8 text-white relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                {editingSpace ? <Edit size={24} className="text-[#FFCC00]" /> : <Plus size={24} className="text-[#FFCC00]" />}
                {editingSpace ? 'Editar Espaço' : 'Novo Espaço'}
              </h2>
              <p className="text-blue-100 text-xs font-medium mt-1 uppercase tracking-widest opacity-80">
                Informações Técnicas do Ambiente
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Nome do Espaço
                </label>
                <div className="relative group">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#003399] transition-colors" />
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] outline-none transition-all"
                    placeholder="Ex: Anfiteatro Dom Bosco"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                    Unidade
                  </label>
                  <select
                    required
                    value={formData.unitId}
                    onChange={e => setFormData({ ...formData, unitId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] outline-none transition-all appearance-none cursor-pointer"
                  >
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                    Capacidade
                  </label>
                  <div className="relative group">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#003399] transition-colors" />
                    <input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] outline-none transition-all"
                      placeholder="Ex: 50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Descrição / Recursos
                </label>
                <div className="relative group">
                  <FileText size={18} className="absolute left-4 top-4 text-gray-300 group-focus-within:text-[#003399] transition-colors" />
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] outline-none transition-all resize-none"
                    placeholder="Equipamentos, finalidade, observações..."
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-4 bg-[#003399] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#002266] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      {editingSpace ? 'Atualizar Dados' : 'Criar Espaço'}
                      <span className="text-lg">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
