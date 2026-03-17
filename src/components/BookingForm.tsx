'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Calendar as CalendarIcon, Clock, Loader2, AlertCircle } from 'lucide-react'

interface BookingFormProps {
  spaceId: string
  spaceName: string
}

export default function BookingForm({ spaceId, spaceName }: BookingFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string
    const type = formData.get('type') as string

    // Criar objetos Date
    const start = new Date(`${date}T${startTime}`)
    const end = new Date(`${date}T${endTime}`)

    if (start >= end) {
      setError('O horário de término deve ser após o de início.')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          start,
          end,
          spaceId,
          type,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Erro ao realizar agendamento')
      }

      ;(router as any).refresh();
      // Limpar formulário ou mostrar sucesso
      (e.target as HTMLFormElement).reset()
      alert('Agendamento realizado com sucesso!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="bg-[#003399] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <CalendarIcon size={80} />
        </div>
        <h2 className="text-xl font-black mb-4 relative z-10">Novo Agendamento</h2>
        <p className="text-blue-100 text-sm mb-8 font-medium leading-relaxed relative z-10">
          Identifique-se para reservar este ambiente e receber as confirmações por e-mail.
        </p>
        <button 
          onClick={() => router.push('/login')}
          className="w-full py-4 bg-[#FFCC00] text-[#003399] font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-all shadow-lg active:scale-95 relative z-10"
        >
          Acessar Sistema
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 text-[#003399] rounded-xl flex items-center justify-center shadow-sm">
          <CalendarIcon size={20} />
        </div>
        <h2 className="text-xl font-black text-[#003399] tracking-tight">Reservar Espaço</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
            Atividade Acadêmica
          </label>
          <input
            name="title"
            type="text"
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
            placeholder="Ex: Aula de Robótica - 2º Ano B"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
            Data da Reserva
          </label>
          <div className="relative group">
            <CalendarIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003399] transition-colors" />
            <input
              name="date"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
              Início
            </label>
            <div className="relative group">
              <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003399] transition-colors" />
              <input
                name="startTime"
                type="time"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
              Término
            </label>
            <div className="relative group">
              <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#003399] transition-colors" />
              <input
                name="endTime"
                type="time"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
            Frequência
          </label>
          <select
            name="type"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="ONE_OFF">Evento Único</option>
            <option value="FIXED">Horário Fixo (Recorrente)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 mt-2 bg-[#003399] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#002266] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              Confirmar Reserva
              <span className="text-lg">→</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-gray-400 font-medium">
          * Confirmação e lembretes serão enviados para seu e-mail.
        </p>
      </form>
    </div>
  )
}
