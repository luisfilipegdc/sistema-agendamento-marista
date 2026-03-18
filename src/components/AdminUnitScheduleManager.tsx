'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarClock, Plus, Pencil, Trash2, Loader2, CheckCircle2, Clock3 } from 'lucide-react'

interface Unit {
  id: string
  name: string
}

interface ScheduleSlot {
  id: string
  label: string | null
  period: string | null
  startTime: string
  endTime: string
  sortOrder: number
  isReservable: boolean
  unitId: string
  unit: {
    id: string
    name: string
  }
}

export default function AdminUnitScheduleManager({ units }: { units: Unit[] }) {
  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id || '')
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    label: '',
    period: '',
    startTime: '08:00',
    endTime: '08:45',
    sortOrder: '1',
    isReservable: true,
  })

  const filteredSlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.unitId === selectedUnitId)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.startTime.localeCompare(b.startTime)),
    [slots, selectedUnitId]
  )

  const fetchSlots = useCallback(async () => {
    if (!selectedUnitId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/unit-schedules?unitId=${selectedUnitId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao buscar horários')
      setSlots(data as ScheduleSlot[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar horários')
    } finally {
      setLoading(false)
    }
  }, [selectedUnitId])

  useEffect(() => {
    void fetchSlots()
  }, [fetchSlots])

  const resetForm = () => {
    setEditingId(null)
    setForm({
      label: '',
      period: '',
      startTime: '08:00',
      endTime: '08:45',
      sortOrder: String(filteredSlots.length + 1),
      isReservable: true,
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    const payload = {
      unitId: selectedUnitId,
      label: form.label.trim() || null,
      period: form.period.trim() || null,
      startTime: form.startTime,
      endTime: form.endTime,
      sortOrder: Number(form.sortOrder) || 0,
      isReservable: form.isReservable,
    }

    try {
      const endpoint = editingId ? `/api/admin/unit-schedules/${editingId}` : '/api/admin/unit-schedules'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar')
      setMessage(editingId ? 'Horário atualizado com sucesso.' : 'Horário criado com sucesso.')
      resetForm()
      await fetchSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar horário')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (slot: ScheduleSlot) => {
    setEditingId(slot.id)
    setForm({
      label: slot.label || '',
      period: slot.period || '',
      startTime: slot.startTime,
      endTime: slot.endTime,
      sortOrder: String(slot.sortOrder),
      isReservable: slot.isReservable,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este horário?')) return
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/unit-schedules/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao excluir')
      setMessage('Horário removido com sucesso.')
      if (editingId === id) resetForm()
      await fetchSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir horário')
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#003399]">
            <CalendarClock size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#003399]">Grade de Horários por Unidade</h2>
            <p className="text-sm font-medium text-gray-500">Defina os horários disponíveis de cada unidade.</p>
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-1 block text-[10px] font-black tracking-[0.14em] text-gray-400 uppercase">Unidade</label>
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#003399]"
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 md:grid-cols-6">
          <input
            value={form.label}
            onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
            placeholder="Nome (ex: 1ª aula)"
            className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#003399] md:col-span-2"
          />
          <input
            value={form.period}
            onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
            placeholder="Período (matutino)"
            className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#003399] md:col-span-1"
          />
          <input
            type="time"
            required
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
            className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#003399] md:col-span-1"
          />
          <input
            type="time"
            required
            value={form.endTime}
            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
            className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#003399] md:col-span-1"
          />
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
            placeholder="Ordem"
            className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#003399] md:col-span-1"
          />

          <label className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 md:col-span-3">
            <input
              type="checkbox"
              checked={form.isReservable}
              onChange={(e) => setForm((prev) => ({ ...prev, isReservable: e.target.checked }))}
            />
            Reservável para agendamento
          </label>

          <div className="flex items-center gap-2 md:col-span-3 md:justify-end">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-[10px] font-black tracking-widest text-gray-500 uppercase transition-colors hover:bg-white"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#003399] px-4 py-2.5 text-[10px] font-black tracking-widest text-white uppercase transition-all hover:bg-[#002266] disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {editingId ? 'Atualizar horário' : 'Adicionar horário'}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-black tracking-[0.14em] text-[#003399] uppercase">Horários cadastrados</h3>
          <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{filteredSlots.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-50 text-[10px] font-black tracking-[0.16em] text-gray-400 uppercase">
              <tr>
                <th className="px-6 py-4">Ordem</th>
                <th className="px-6 py-4">Nome / Período</th>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-bold text-gray-500">
                      <Loader2 size={16} className="animate-spin" />
                      Carregando horários...
                    </div>
                  </td>
                </tr>
              ) : filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm font-medium italic text-gray-400">
                    Nenhum horário cadastrado para esta unidade.
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot) => (
                  <tr key={slot.id} className="group transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-xs font-black text-gray-500">{slot.sortOrder}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[#003399]">{slot.label || 'Sem nome'}</p>
                      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{slot.period || 'Geral'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-black text-gray-700">
                        <Clock3 size={12} />
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-black tracking-wide uppercase ${slot.isReservable ? 'border border-emerald-100 bg-emerald-50 text-emerald-700' : 'border border-slate-100 bg-slate-100 text-slate-500'}`}>
                        {slot.isReservable ? 'Reservável' : 'Intervalo/Bloqueado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(slot)}
                          className="rounded-lg border border-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(slot.id)}
                          className="rounded-lg border border-red-100 p-2 text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={14} />
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
  )
}
