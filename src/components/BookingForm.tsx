'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Music,
  FileText,
  Users,
  BookOpen,
  HelpCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

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
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    class: '',
    purpose: '',
    date: undefined as Date | undefined,
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
    audioSupport: false,
    techNotes: ''
  })

  // Buscar disponibilidade quando a data mudar
  useEffect(() => {
    if (formData.date) {
      const dateStr = format(formData.date, 'yyyy-MM-dd')
      fetchAvailability(dateStr)
    }
  }, [formData.date])

  const fetchAvailability = async (date: string) => {
    if (!date || !spaceId) return
    setIsLoadingSlots(true)
    try {
      const res = await fetch(`/api/availability?spaceId=${spaceId}&date=${date}`)
      const data = await res.json()
      setAvailableSlots(data)
    } catch (err) {
      console.error('Error fetching slots')
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day) 
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }))
  }

  const selectSlot = (slot: any) => {
    if (slot.status !== 'available') return
    setFormData(prev => ({ ...prev, startTime: slot.start, endTime: slot.end }))
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.class || !formData.purpose || !formData.date || !formData.startTime || !formData.endTime) {
        setError('Por favor, preencha todos os campos obrigatórios e selecione um horário.')
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

    const dateStr = format(formData.date!, 'yyyy-MM-dd')
    const start = new Date(`${dateStr}T${formData.startTime}`)
    const end = new Date(`${dateStr}T${formData.endTime}`)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: dateStr,
          start,
          end,
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
          class: '',
          purpose: '',
          date: undefined,
          startTime: '',
          endTime: '',
          type: 'ONE_OFF',
          repeatUntil: '',
          daysOfWeek: [],
          airConditioning: true,
          microphones: 0,
          wirelessMic: false,
          projection: false,
          schoolComputer: false,
          externalComputer: false,
          audioSupport: false,
          techNotes: ''
        })
      }, 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <Card className="bg-[#003399] border-none shadow-2xl text-white overflow-hidden relative group rounded-[2.5rem]">
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
          <CalendarIcon size={160} />
        </div>
        <CardHeader className="relative z-10 pt-10 px-10">
          <CardTitle className="text-3xl font-black italic tracking-tight">Novo Agendamento</CardTitle>
          <CardDescription className="text-blue-100/70 text-base font-medium leading-relaxed">
            Identifique-se para reservar este ambiente e receber as confirmações por e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 p-10 pt-0">
          <Button 
            onClick={() => router.push('/login')}
            className="w-full h-14 bg-[#FFCC00] text-[#003399] font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white hover:text-[#003399] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 border-none"
          >
            Acessar Sistema Marista <ChevronRight size={16} />
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-green-100 shadow-[0_30px_60px_rgba(0,51,153,0.15)] rounded-[3rem] overflow-hidden text-center p-12 relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50" />
          <CardHeader className="flex flex-col items-center pb-8">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
              <CheckCircle2 size={48} />
            </div>
            <CardTitle className="text-3xl font-black text-[#003399] italic tracking-tight">🎉 Reserva Confirmada!</CardTitle>
            <CardDescription className="text-slate-600 font-bold text-lg mt-2">
              Bom uso do {spaceName}!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Atividade</span>
                <span className="text-[#003399]">{formData.title}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Horário</span>
                <span className="text-[#003399]">{formData.startTime} - {formData.endTime}</span>
              </div>
            </div>
            <Button 
              variant="link" 
              onClick={() => setSuccess(false)}
              className="text-[10px] font-black text-[#003399] uppercase tracking-[0.3em] hover:no-underline opacity-70 hover:opacity-100 transition-opacity"
            >
              Fazer nova reserva
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <Card className="border-slate-100 shadow-[0_20px_50px_rgba(0,51,153,0.05)] rounded-[3rem] overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Badge className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center p-0 font-black transition-all duration-500",
              step >= 1 ? "bg-[#003399] text-white shadow-lg shadow-blue-900/20" : "bg-slate-200 text-slate-400"
            )}>1</Badge>
            <div className={cn("h-px w-8 transition-all duration-500", step >= 2 ? "bg-[#003399]" : "bg-slate-200")} />
            <Badge className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center p-0 font-black transition-all duration-500",
              step >= 2 ? "bg-[#003399] text-white shadow-lg shadow-blue-900/20" : "bg-slate-200 text-slate-400"
            )}>2</Badge>
          </div>
          <Badge variant="outline" className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-slate-200 px-4 py-1.5 rounded-full">
            Passo {step} de 2
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white text-[#003399] rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            {step === 1 ? <CalendarIcon size={28} /> : <Settings size={28} />}
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-[#003399] italic tracking-tight">
              {step === 1 ? 'Dados da Reserva' : 'Requisitos Técnicos'}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {step === 1 ? 'Informações básicas e horários' : 'Equipamentos e suporte extra'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl flex items-start gap-3"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}

            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Título */}
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título da Atividade</Label>
                  <div className="relative group">
                    <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003399] transition-colors" />
                    <Input 
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Aula de Robótica"
                      className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl text-sm font-bold focus-visible:ring-[#003399] focus-visible:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Turma e Finalidade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turma</Label>
                    <div className="relative group">
                      <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003399] transition-colors" />
                      <Input 
                        value={formData.class}
                        onChange={e => setFormData({ ...formData, class: e.target.value })}
                        placeholder="Ex: 2º Ano B"
                        className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl text-sm font-bold focus-visible:ring-[#003399] focus-visible:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Finalidade</Label>
                    <div className="relative group">
                      <HelpCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003399] transition-colors" />
                      <Input 
                        value={formData.purpose}
                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder="Ex: Avaliação"
                        className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl text-sm font-bold focus-visible:ring-[#003399] focus-visible:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Data com Popover/Calendar shadcn */}
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quando você quer usar?</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-14 justify-start text-left font-bold bg-slate-50 border-slate-100 rounded-2xl px-4 hover:bg-slate-100",
                          !formData.date && "text-slate-400"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-slate-300" />
                        {formData.date ? format(formData.date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-slate-100 shadow-2xl" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={date => setFormData({ ...formData, date })}
                        initialFocus
                        locale={ptBR}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Slots de Horário */}
                {formData.date && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4 border-t border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black text-[#003399] uppercase tracking-widest italic flex items-center gap-2">
                        Horários Disponíveis (45min)
                        {isLoadingSlots && <Loader2 size={12} className="animate-spin" />}
                      </Label>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {availableSlots.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          disabled={slot.status !== 'available'}
                          onClick={() => selectSlot(slot)}
                          className={cn(
                            "group py-4 px-2 rounded-2xl text-[10px] font-black transition-all border flex flex-col items-center gap-2 relative overflow-hidden",
                            slot.status === 'available' 
                              ? formData.startTime === slot.start 
                                ? "bg-[#003399] text-white border-[#003399] shadow-xl scale-95" 
                                : "bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-blue-50/50"
                              : slot.status === 'booked'
                                ? "bg-red-50/50 text-red-300 border-red-50 cursor-not-allowed"
                                : "bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed"
                          )}
                        >
                          {slot.status === 'available' && formData.startTime === slot.start && (
                            <motion.div layoutId="active-slot" className="absolute inset-0 bg-[#003399] z-[-1]" />
                          )}
                          <span className="relative z-10">{slot.start}</span>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full relative z-10",
                            slot.status === 'available' ? "bg-green-500" : 
                            slot.status === 'booked' ? "bg-red-500" : "bg-slate-400"
                          )} />
                        </button>
                      ))}
                    </div>

                    {/* Legenda */}
                    <div className="flex items-center justify-center gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Livre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ocupado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bloqueado</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Recorrência */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequência</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={val => setFormData({ 
                      ...formData, 
                      type: val,
                      daysOfWeek: val === 'FIXED' && formData.date ? [formData.date.getDay()] : formData.daysOfWeek
                    })}
                  >
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold focus:ring-[#003399]">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                      <SelectItem value="ONE_OFF" className="font-bold py-3">Evento Único</SelectItem>
                      <SelectItem value="FIXED" className="font-bold py-3">Horário Fixo (Recorrente)</SelectItem>
                    </SelectContent>
                  </Select>

                  {formData.type === 'FIXED' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-6 p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100"
                    >
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black text-[#003399] uppercase tracking-widest ml-1">Repetir nos dias:</Label>
                        <div className="flex flex-wrap gap-2.5">
                          {[
                            { l: 'D', v: 0 }, { l: 'S', v: 1 }, { l: 'T', v: 2 }, 
                            { l: 'Q', v: 3 }, { l: 'Q', v: 4 }, { l: 'S', v: 5 }, { l: 'S', v: 6 }
                          ].map((day, i) => (
                            <Button
                              key={i}
                              type="button"
                              variant={formData.daysOfWeek.includes(day.v) ? "default" : "outline"}
                              onClick={() => toggleDay(day.v)}
                              className={cn(
                                "w-11 h-11 rounded-xl font-black text-xs transition-all p-0",
                                formData.daysOfWeek.includes(day.v) 
                                  ? "bg-[#003399] text-white shadow-lg shadow-blue-900/20 border-none" 
                                  : "bg-white text-slate-400 border-slate-100 hover:border-blue-200"
                              )}
                            >
                              {day.l}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-black text-[#003399] uppercase tracking-widest ml-1">Até quando repetir?</Label>
                        <Input 
                          type="date"
                          value={formData.repeatUntil}
                          min={formData.date ? format(formData.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                          onChange={e => setFormData({ ...formData, repeatUntil: e.target.value })}
                          className="h-14 bg-white border-blue-100 rounded-2xl text-sm font-bold focus-visible:ring-[#003399]"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ar Condicionado */}
                  <div className={cn(
                    "flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer group",
                    formData.airConditioning ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                  )} onClick={() => setFormData({...formData, airConditioning: !formData.airConditioning})}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        formData.airConditioning ? "bg-[#003399] text-white" : "bg-white text-slate-300"
                      )}>
                        <Wind size={24} />
                      </div>
                      <div>
                        <p className={cn("text-xs font-black uppercase tracking-widest", formData.airConditioning ? "text-[#003399]" : "text-slate-400")}>Ar Condicionado</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Climatizar</p>
                      </div>
                    </div>
                    <Checkbox checked={formData.airConditioning} className="rounded-lg border-slate-200 data-[state=checked]:bg-[#003399]" />
                  </div>

                  {/* Projeção */}
                  <div className={cn(
                    "flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer group",
                    formData.projection ? "bg-green-50 border-green-200 shadow-sm" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                  )} onClick={() => setFormData({...formData, projection: !formData.projection})}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        formData.projection ? "bg-green-600 text-white" : "bg-white text-slate-300"
                      )}>
                        <Monitor size={24} />
                      </div>
                      <div>
                        <p className={cn("text-xs font-black uppercase tracking-widest", formData.projection ? "text-green-700" : "text-slate-400")}>Projeção / TV</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Uso de tela</p>
                      </div>
                    </div>
                    <Checkbox checked={formData.projection} className="rounded-lg border-slate-200 data-[state=checked]:bg-green-600" />
                  </div>
                </div>

                {/* Microfones */}
                <div className={cn(
                  "p-8 rounded-[2.5rem] border transition-all",
                  formData.microphones > 0 ? "bg-yellow-50 border-yellow-200 shadow-sm" : "bg-slate-50 border-slate-100"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        formData.microphones > 0 ? "bg-[#FFCC00] text-[#003399]" : "bg-white text-slate-300"
                      )}>
                        <Mic size={24} />
                      </div>
                      <div>
                        <p className={cn("text-xs font-black uppercase tracking-widest", formData.microphones > 0 ? "text-[#003399]" : "text-slate-400")}>Microfones</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Quantidade e tipo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-8 h-8 p-0 rounded-lg bg-white border-slate-100"
                        onClick={() => setFormData(prev => ({ ...prev, microphones: Math.max(0, prev.microphones - 1) }))}
                      >-</Button>
                      <span className="text-sm font-black text-[#003399] w-4 text-center">{formData.microphones}</span>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-8 h-8 p-0 rounded-lg bg-white border-slate-100"
                        onClick={() => setFormData(prev => ({ ...prev, microphones: Math.min(10, prev.microphones + 1) }))}
                      >+</Button>
                    </div>
                  </div>
                  {formData.microphones > 0 && (
                    <div className="flex items-center gap-3 ml-16 animate-in slide-in-from-left-2">
                      <Checkbox 
                        id="wireless" 
                        checked={formData.wirelessMic} 
                        onCheckedChange={val => setFormData({...formData, wirelessMic: !!val})}
                        className="rounded-lg border-yellow-300 data-[state=checked]:bg-[#FFCC00] data-[state=checked]:text-[#003399]"
                      />
                      <Label htmlFor="wireless" className="text-[10px] font-black text-[#003399] uppercase tracking-widest opacity-70">Preferência por Sem Fio</Label>
                    </div>
                  )}
                </div>

                {/* Computadores */}
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData({...formData, schoolComputer: !formData.schoolComputer, externalComputer: false})}
                    className={cn(
                      "flex flex-col items-center justify-center p-8 rounded-[2.5rem] border transition-all gap-4 cursor-pointer",
                      formData.schoolComputer ? "bg-blue-50 border-[#003399] text-[#003399] shadow-sm" : "bg-slate-50 border-slate-100 text-slate-300"
                    )}
                  >
                    <Laptop size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">PC Escola</span>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, externalComputer: !formData.externalComputer, schoolComputer: false})}
                    className={cn(
                      "flex flex-col items-center justify-center p-8 rounded-[2.5rem] border transition-all gap-4 cursor-pointer",
                      formData.externalComputer ? "bg-orange-50 border-orange-600 text-orange-600 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-300"
                    )}
                  >
                    <Laptop size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Meu Notebook</span>
                  </div>
                </div>

                {formData.externalComputer && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-orange-50 border border-orange-100 rounded-[2rem] flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <Info size={20} className="text-orange-600" />
                    </div>
                    <p className="text-[10px] text-orange-800 font-bold leading-relaxed uppercase tracking-tighter">
                      Não esqueça os adaptadores <strong>HDMI</strong> e de baixar seus arquivos previamente.
                    </p>
                  </motion.div>
                )}

                {/* Suporte de Áudio */}
                <div className={cn(
                  "flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer group",
                  formData.audioSupport ? "bg-purple-50 border-purple-200 shadow-sm" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                )} onClick={() => setFormData({...formData, audioSupport: !formData.audioSupport})}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                      formData.audioSupport ? "bg-purple-600 text-white" : "bg-white text-slate-300"
                    )}>
                      <Music size={24} />
                    </div>
                    <div>
                      <p className={cn("text-xs font-black uppercase tracking-widest", formData.audioSupport ? "text-purple-700" : "text-slate-400")}>Suporte de Áudio</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Auxílio técnico</p>
                    </div>
                  </div>
                  <Checkbox checked={formData.audioSupport} className="rounded-lg border-slate-200 data-[state=checked]:bg-purple-600" />
                </div>

                {/* Observações */}
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações Técnicas</Label>
                  <div className="relative group">
                    <FileText size={18} className="absolute left-4 top-4 text-slate-300 group-focus-within:text-[#003399] transition-colors" />
                    <Textarea 
                      value={formData.techNotes}
                      onChange={e => setFormData({ ...formData, techNotes: e.target.value })}
                      placeholder="Descreva detalhes adicionais (cabos, adaptadores, microfones extras...)"
                      className="pl-12 min-h-[120px] bg-slate-50 border-slate-100 rounded-[2rem] text-sm font-bold focus-visible:ring-[#003399] focus-visible:bg-white transition-all resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardContent>

      <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-8 gap-4">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex-1 h-14 bg-white text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl border-slate-100 hover:bg-slate-50 hover:text-[#003399] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Voltar
          </Button>
        )}
        
        {step < 2 ? (
          <Button
            onClick={nextStep}
            className="flex-1 h-14 bg-[#003399] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#002266] transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2 active:scale-95 border-none"
          >
            Próximo Passo <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-[2] h-14 bg-[#003399] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-[#002266] transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 border-none"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Confirmar Reserva Marista
                <CheckCircle2 size={18} />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
