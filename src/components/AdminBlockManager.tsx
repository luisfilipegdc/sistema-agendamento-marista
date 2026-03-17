'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
  Building2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Space {
  id: string
  name: string
  unit: { name: string }
}

interface BlockedSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  reason: string | null
  spaceId: string
  space: { name: string, unit: { name: string } }
}

export default function AdminBlockManager({ spaces }: { spaces: Space[] }) {
  const router = useRouter()
  const [blocks, setBlocks] = useState<BlockedSlot[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    spaceId: spaces[0]?.id || '',
    date: '',
    startTime: '07:15',
    endTime: '17:30',
    reason: ''
  })

  useEffect(() => {
    fetchBlocks()
  }, [])

  const fetchBlocks = async () => {
    try {
      const res = await fetch('/api/admin/blocks')
      const data = await res.json()
      setBlocks(data)
    } catch (err) {
      console.error('Error fetching blocks')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Erro ao criar bloqueio')

      setSuccess('Horário bloqueado com sucesso!')
      setTimeout(() => setSuccess(null), 3000)
      setIsModalOpen(false)
      fetchBlocks()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja liberar este horário?')) return

    try {
      const res = await fetch(`/api/admin/blocks?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao remover bloqueio')
      
      setSuccess('Horário liberado!')
      setTimeout(() => setSuccess(null), 3000)
      fetchBlocks()
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#003399] tracking-tight">Bloqueios Administrativos</h1>
          <p className="text-gray-500 text-sm font-medium">Impeça agendamentos em datas ou horários específicos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-95"
        >
          <ShieldAlert size={18} />
          Bloquear Horário
        </button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          {success}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
            <tr>
              <th className="px-8 py-5">Ambiente / Unidade</th>
              <th className="px-8 py-5">Data / Período</th>
              <th className="px-8 py-5">Motivo</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isFetching ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-[#003399]" size={32} />
                </td>
              </tr>
            ) : blocks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <p className="text-sm text-gray-400 font-medium italic">Nenhum bloqueio ativo.</p>
                </td>
              </tr>
            ) : (
              blocks.map((block) => (
                <tr key={block.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#003399]">{block.space.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{block.space.unit.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                        <Calendar size={14} className="text-red-400" />
                        {format(new Date(block.date), "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                        <Clock size={14} />
                        {block.startTime} - {block.endTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-500 font-medium">{block.reason || 'Manutenção / Evento'}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(block.id)}
                      className="p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-red-600 p-8 text-white relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 italic">
                <ShieldAlert size={28} className="text-[#FFCC00]" />
                Bloquear Horário
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Ambiente
                </label>
                <select
                  required
                  value={formData.spaceId}
                  onChange={e => setFormData({ ...formData, spaceId: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-red-600 outline-none transition-all appearance-none"
                >
                  {spaces.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.unit.name})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Data do Bloqueio
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-red-600 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                    Início
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-red-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                    Término
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-red-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Motivo (Opcional)
                </label>
                <input
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-red-600 outline-none transition-all"
                  placeholder="Ex: Manutenção Elétrica"
                />
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
                  className="flex-[2] py-4 bg-red-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Bloquear Horário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
