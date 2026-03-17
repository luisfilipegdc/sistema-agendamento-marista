'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Hash,
  Layout
} from 'lucide-react'

interface Unit {
  id: string
  name: string
  slug: string
  _count?: { spaces: number }
}

export default function AdminUnitManager() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/units')
      const data = await res.json()
      setUnits(data)
    } catch (error) {
      console.error('Erro ao carregar unidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit)
      setName(unit.name)
      setSlug(unit.slug)
    } else {
      setEditingUnit(null)
      setName('')
      setSlug('')
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!name || !slug) {
      setMessage({ type: 'error', text: 'Preencha todos os campos!' })
      return
    }

    const method = editingUnit ? 'PATCH' : 'POST'
    const url = editingUnit ? `/api/units/${editingUnit.id}` : '/api/units'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug })
      })

      if (res.ok) {
        setMessage({ type: 'success', text: editingUnit ? 'Unidade atualizada!' : 'Unidade cadastrada!' })
        fetchUnits()
        setIsModalOpen(false)
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Erro ao salvar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão' })
    }
  }

  const handleDelete = async (unitId: string) => {
    if (!confirm('Atenção: Excluir uma unidade apagará todos os seus espaços e agendamentos vinculados. Deseja continuar?')) return

    try {
      const res = await fetch(`/api/units/${unitId}`, { method: 'DELETE' })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Unidade excluída!' })
        fetchUnits()
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Erro ao excluir' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão' })
    }
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003399]" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 text-[#FFCC00] rounded-2xl flex items-center justify-center shadow-inner">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#003399] tracking-tight italic">Gestão de Unidades</h2>
            <p className="text-sm text-gray-500 font-medium">Cadastre e edite as unidades educacionais</p>
          </div>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-[#003399] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#002266] transition-all shadow-lg shadow-blue-900/10"
        >
          <Plus size={18} />
          Nova Unidade
        </button>
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

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform text-[#003399]">
              <Building2 size={80} />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-[#FFCC00] uppercase tracking-[0.2em] bg-yellow-50 px-3 py-1 rounded-full">
                  ID: {unit.slug}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(unit)}
                    className="p-2 text-gray-400 hover:text-[#003399] hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(unit.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-black text-[#003399] tracking-tight italic mb-4">{unit.name}</h3>
              
              <div className="flex items-center gap-4 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-2">
                  <Layout size={14} className="text-gray-400" />
                  <span className="text-xs font-black text-[#003399]">{unit._count?.spaces || 0}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Ambientes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFCC00] text-[#003399] rounded-xl flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <h3 className="text-xl font-black text-[#003399] tracking-tight italic">
                  {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nome da Unidade</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFCC00]" size={18} />
                  <input
                    type="text"
                    placeholder="Ex: Marista Glória"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#003399]/20 font-medium"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (!editingUnit) {
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''))
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Slug (Identificador na URL)</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFCC00]" size={18} />
                  <input
                    type="text"
                    placeholder="ex: marista-gloria"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#003399]/20 font-medium"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic">* Usado para criar links personalizados.</p>
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
                {editingUnit ? 'Salvar Alterações' : 'Cadastrar Unidade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
