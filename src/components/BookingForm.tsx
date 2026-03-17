'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Loader2, 
  AlertCircle, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Info,
  Laptop,
  Wind,
  Mic,
  Monitor,
  Music
} from 'lucide-react'

interface BookingFormProps {
  spaceId: string
  spaceName: string
}

export default function BookingForm({ spaceId, spaceName }: BookingFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'ONE_OFF',
    repeatUntil: '',
    daysOfWeek: [] as number[],
    airConditioning: true,
    microphones: 0,
    wirelessMic: false,
    projection: false,
    schoolComputer: false,
    externalComputer: false,
    audioSupport: false
  })

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day) 
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }))
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
        setError('Por favor, preencha todos os campos obrigatórios.')
        return
      }
      if (formData.type === 'FIXED' && (!formData.repeatUntil || formData.daysOfWeek.length === 0)) {
        setError('Para horários fixos, selecione os dias da semana e a data limite.')
        return
      }
      setError(null)
    }
    setStep(step + 1)
  }

  const prevStep = () => {
    setError(null)
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Se ainda estiver no passo 1, apenas avança
    if (step === 1) {
      nextStep()
      return
    }

    if (!session) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    setError(null)

    // Criar objetos Date
    const start = new Date(`${formData.date}T${formData.startTime}`)
    const end = new Date(`${formData.date}T${formData.endTime}`)

    if (start >= end) {
      setError('O horário de término deve ser após o de início.')
      setIsLoading(false)
      setStep(1) // Volta para o passo 1 se o erro for de horário
      return
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          start,
          end,
          repeatUntil: formData.repeatUntil ? new Date(`${formData.repeatUntil}T23:59:59`) : null,
          spaceId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Erro ao realizar agendamento')
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
        setStep(1)
        setFormData({
          title: '',
          date: '',
          startTime: '',
          endTime: '',
          type: 'ONE_OFF',
          airConditioning: true,
          microphones: 0,
          wirelessMic: false,
          projection: false,
          schoolComputer: false,
          externalComputer: false,
          audioSupport: false
        })
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="bg-[#003399] p-10 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group border border-white/10">
        <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
          <CalendarIcon size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-4 tracking-tight italic">Novo Agendamento</h2>
          <p className="text-blue-100 text-sm mb-10 font-medium leading-relaxed opacity-80">
            Identifique-se para reservar este ambiente e receber as confirmações por e-mail.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-4 bg-[#FFCC00] text-[#003399] font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            Acessar Sistema Marista <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,51,153,0.1)] border border-green-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-[#003399] mb-2 tracking-tight italic">Reserva Confirmada!</h2>
        <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[240px]">
          Seu agendamento foi registrado com sucesso. Enviamos um e-mail de confirmação.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,51,153,0.05)] border border-gray-100">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step >= 1 ? 'bg-[#003399] text-white shadow-lg shadow-blue-900/20' : 'bg-gray-100 text-gray-400'}`}>
            1
          </div>
          <div className={`h-px w-8 transition-all duration-500 ${step >= 2 ? 'bg-[#003399]' : 'bg-gray-100'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step >= 2 ? 'bg-[#003399] text-white shadow-lg shadow-blue-900/20' : 'bg-gray-100 text-gray-400'}`}>
            2
          </div>
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
          Passo {step} de 2
        </span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-50 text-[#003399] rounded-2xl flex items-center justify-center shadow-inner">
          {step === 1 ? <CalendarIcon size={24} /> : <Settings size={24} />}
        </div>
        <div>
          <h2 className="text-xl font-black text-[#003399] tracking-tight italic">
            {step === 1 ? 'Dados da Reserva' : 'Requisitos Técnicos'}
          </h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            {step === 1 ? 'Informações básicas' : 'Equipamentos e suporte'}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                Atividade Acadêmica
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] outline-none transition-all placeholder:text-gray-300"
                placeholder="Ex: Aula de Robótica - 2º Ano B"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                Data da Reserva
              </label>
              <div className="relative group">
                <CalendarIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#003399] transition-colors" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Início
                </label>
                <div className="relative group">
                  <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#003399] transition-colors" />
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Término
                </label>
                <div className="relative group">
                  <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#003399] transition-colors" />
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                Frequência
              </label>
              <select
                value={formData.type}
                onChange={e => {
                  const val = e.target.value
                  setFormData({ 
                    ...formData, 
                    type: val,
                    // Se mudar para FIXED, tenta pré-selecionar o dia da data já escolhida
                    daysOfWeek: val === 'FIXED' && formData.date 
                      ? [new Date(`${formData.date}T12:00:00`).getDay()] 
                      : formData.daysOfWeek
                  })
                }}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-[#003399] outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="ONE_OFF">Evento Único</option>
                <option value="FIXED">Horário Fixo (Recorrente)</option>
              </select>
            </div>

            {/* Recurrence Details */}
            {formData.type === 'FIXED' && (
              <div className="space-y-5 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-[#003399] uppercase tracking-widest ml-1">
                    Repetir nos dias:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { l: 'D', v: 0 }, { l: 'S', v: 1 }, { l: 'T', v: 2 }, 
                      { l: 'Q', v: 3 }, { l: 'Q', v: 4 }, { l: 'S', v: 5 }, { l: 'S', v: 6 }
                    ].map((day) => (
                      <button
                        key={day.v}
                        type="button"
                        onClick={() => toggleDay(day.v)}
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                          formData.daysOfWeek.includes(day.v)
                            ? 'bg-[#003399] text-white shadow-lg shadow-blue-900/20'
                            : 'bg-white text-gray-400 border border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        {day.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#003399] uppercase tracking-widest ml-1">
                    Até quando repetir?
                  </label>
                  <input
                    type="date"
                    required
                    min={formData.date || new Date().toISOString().split('T')[0]}
                    value={formData.repeatUntil}
                    onChange={e => setFormData({ ...formData, repeatUntil: e.target.value })}
                    className="w-full px-5 py-4 bg-white border border-blue-100 rounded-2xl text-sm text-slate-800 font-bold focus:ring-2 focus:ring-[#003399] outline-none transition-all"
                  />
                  <p className="text-[9px] text-blue-400 font-bold italic ml-1">
                    * A reserva será criada para cada dia selecionado até esta data.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Technical Requirements */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 gap-3">
              {/* Ar Condicionado */}
              <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all ${formData.airConditioning ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.airConditioning ? 'bg-[#003399] text-white' : 'bg-white text-gray-300'}`}>
                  <Wind size={20} />
                </div>
                <div className="flex-1">
                  <span className={`block text-xs font-black uppercase tracking-tighter ${formData.airConditioning ? 'text-[#003399]' : 'text-gray-400'}`}>Ar Condicionado</span>
                  <span className="text-[9px] text-gray-400 font-bold">Climatizar o ambiente</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.airConditioning} 
                  onChange={e => setFormData({...formData, airConditioning: e.target.checked})}
                  className="w-5 h-5 text-[#003399] rounded-lg border-gray-300 focus:ring-[#003399]" 
                />
              </label>

              {/* Microfones */}
              <div className={`p-4 rounded-2xl border transition-all ${formData.microphones > 0 ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.microphones > 0 ? 'bg-[#FFCC00] text-[#003399]' : 'bg-white text-gray-300'}`}>
                    <Mic size={20} />
                  </div>
                  <div className="flex-1">
                    <span className={`block text-xs font-black uppercase tracking-tighter ${formData.microphones > 0 ? 'text-[#003399]' : 'text-gray-400'}`}>Microfones</span>
                    <span className="text-[9px] text-gray-400 font-bold">Quantidade necessária</span>
                  </div>
                  <input 
                    type="number" 
                    min="0" max="10" 
                    value={formData.microphones}
                    onChange={e => setFormData({...formData, microphones: parseInt(e.target.value) || 0})}
                    className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-[#003399]"
                  />
                </div>
                {formData.microphones > 0 && (
                  <label className="flex items-center gap-2 ml-14 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.wirelessMic}
                      onChange={e => setFormData({...formData, wirelessMic: e.target.checked})}
                      className="w-4 h-4 text-[#FFCC00] rounded border-gray-300" 
                    />
                    <span className="text-[10px] font-black text-[#003399] uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">Preferência por sem fio</span>
                  </label>
                )}
              </div>

              {/* Projeção */}
              <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all ${formData.projection ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.projection ? 'bg-green-600 text-white' : 'bg-white text-gray-300'}`}>
                  <Monitor size={20} />
                </div>
                <div className="flex-1">
                  <span className={`block text-xs font-black uppercase tracking-tighter ${formData.projection ? 'text-green-700' : 'text-gray-400'}`}>Projeção / TV</span>
                  <span className="text-[9px] text-gray-400 font-bold">Uso de tela</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.projection} 
                  onChange={e => setFormData({...formData, projection: e.target.checked})}
                  className="w-5 h-5 text-green-600 rounded-lg border-gray-300 focus:ring-green-600" 
                />
              </label>

              {/* Computador */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, schoolComputer: !formData.schoolComputer, externalComputer: false})}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${formData.schoolComputer ? 'bg-blue-50 border-[#003399] text-[#003399]' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                >
                  <Laptop size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">PC Escola</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, externalComputer: !formData.externalComputer, schoolComputer: false})}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${formData.externalComputer ? 'bg-orange-50 border-orange-600 text-orange-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                >
                  <Laptop size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Notebook Próprio</span>
                </button>
              </div>

              {/* Warning for External Computer */}
              {formData.externalComputer && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3 animate-in zoom-in-95">
                  <Info size={18} className="text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-orange-800 font-bold leading-relaxed">
                    Lembre-se de trazer adaptadores <strong>HDMI</strong> e baixar seus arquivos.
                  </p>
                </div>
              )}

              {/* Suporte Áudio */}
              <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all ${formData.audioSupport ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.audioSupport ? 'bg-purple-600 text-white' : 'bg-white text-gray-300'}`}>
                  <Music size={20} />
                </div>
                <div className="flex-1">
                  <span className={`block text-xs font-black uppercase tracking-tighter ${formData.audioSupport ? 'text-purple-700' : 'text-gray-400'}`}>Suporte de Áudio</span>
                  <span className="text-[9px] text-gray-400 font-bold">Auxílio técnico</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.audioSupport} 
                  onChange={e => setFormData({...formData, audioSupport: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded-lg border-gray-300 focus:ring-purple-600" 
                />
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button
              key="prev-btn"
              type="button"
              onClick={prevStep}
              className="flex-1 py-4 bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ChevronLeft size={16} /> Voltar
            </button>
          )}
          
          {step < 2 ? (
            <button
              key="next-btn"
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                nextStep()
              }}
              className="flex-1 py-4 bg-[#003399] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#002266] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 active:scale-95"
            >
              Próximo Passo <ChevronRight size={16} />
            </button>
          ) : (
            <button
              key="submit-btn"
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-4 bg-[#003399] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#002266] transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Confirmar Reserva Marista
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-[10px] text-center text-gray-400 font-medium italic">
          * A reserva será confirmada instantaneamente se não houver conflitos.
        </p>
      </form>
    </div>
  )
}
