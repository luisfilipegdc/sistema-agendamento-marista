'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { 
  Calendar as CalendarIcon, 
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

type AvailabilitySlot = {
  start: string
  end: string
  status: 'available' | 'booked' | 'blocked'
}

export default function BookingForm({ spaceId, spaceName }: BookingFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
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

  useEffect(() => {
    if (!success) return
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#6755F5', '#21C8A8', '#F59E0B', '#FFFFFF'],
    })
  }, [success])

  const fetchAvailability = async (date: string) => {
    if (!date || !spaceId) return
    setIsLoadingSlots(true)
    setError(null)
    try {
      const res = await fetch(`/api/availability?spaceId=${spaceId}&date=${date}`)
      const data = await res.json()
      if (!res.ok) {
        setAvailableSlots([])
        setError(data?.message || 'Não foi possível carregar os horários disponíveis.')
        return
      }
      if (!Array.isArray(data)) {
        setAvailableSlots([])
        setError('Formato de horários inválido. Tente novamente em instantes.')
        return
      }
      setAvailableSlots(data as AvailabilitySlot[])
    } catch {
      setAvailableSlots([])
      setError('Erro ao buscar horários disponíveis.')
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

  const selectSlot = (slot: AvailabilitySlot) => {
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

  const handleSubmit = async () => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar agendamento')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
          <CalendarIcon size={160} />
        </div>
        <CardHeader className="relative z-10 p-6 pb-2">
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Novo Agendamento</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Identifique-se para reservar este ambiente e receber as confirmações por e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 p-6 pt-2">
          <Button 
            onClick={() => router.push('/login')}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-medium text-primary-foreground shadow-[0_14px_22px_-14px] shadow-primary transition-all hover:-translate-y-0.5 hover:bg-primary/90"
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
        <Card className="relative overflow-hidden rounded-2xl border border-border p-8 text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50" />
          <CardHeader className="flex flex-col items-center pb-8">
            <div className="relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={48} />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Reserva Confirmada</CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              Bom uso do {spaceName}!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                <span>Atividade</span>
                <span className="text-foreground">{formData.title}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                <span>Horário</span>
                <span className="text-foreground">{formData.startTime} - {formData.endTime}</span>
              </div>
            </div>
            <Button 
              variant="link" 
              onClick={() => setSuccess(false)}
              className="text-[10px] font-medium text-primary uppercase tracking-[0.16em] hover:no-underline"
            >
              Fazer nova reserva
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
      <Card className="overflow-hidden rounded-3xl border-border/80 bg-card/95 shadow-[0_30px_44px_-36px] shadow-primary/45">
        <CardHeader className="border-b border-border bg-card/90 p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs font-medium transition-all",
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}>1</Badge>
            <div className={cn("h-px w-7 transition-all duration-500", step >= 2 ? "bg-primary" : "bg-border")} />
            <Badge className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs font-medium transition-all",
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}>2</Badge>
          </div>
          <Badge variant="outline" className="rounded-full border-border px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Passo {step} de 2
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_24px_-16px] shadow-primary">
            {step === 1 ? <CalendarIcon size={28} /> : <Settings size={28} />}
          </div>
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              {step === 1 ? 'Dados da Reserva' : 'Requisitos Técnicos'}
            </CardTitle>
            <CardDescription className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              {step === 1 ? 'Informações básicas e horários' : 'Equipamentos e suporte extra'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }} className="space-y-8">
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
                    <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input 
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Aula de Robótica"
                      className="h-12 rounded-lg border-border bg-secondary/40 pl-12 text-sm font-medium transition-all focus-visible:ring-primary focus-visible:bg-background"
                    />
                  </div>
                </div>

                {/* Turma e Finalidade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turma</Label>
                    <div className="relative group">
                      <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input 
                        value={formData.class}
                        onChange={e => setFormData({ ...formData, class: e.target.value })}
                        placeholder="Ex: 2º Ano B"
                        className="h-12 rounded-lg border-border bg-secondary/40 pl-12 text-sm font-medium transition-all focus-visible:ring-primary focus-visible:bg-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Finalidade</Label>
                    <div className="relative group">
                      <HelpCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input 
                        value={formData.purpose}
                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder="Ex: Avaliação"
                        className="h-12 rounded-lg border-border bg-secondary/40 pl-12 text-sm font-medium transition-all focus-visible:ring-primary focus-visible:bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Data com Popover/Calendar shadcn */}
                <div className="space-y-2.5">
                  <Label className="ml-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Quando você quer usar?</Label>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-12 w-full justify-start rounded-lg border-border bg-secondary/40 px-4 text-left font-medium hover:bg-secondary",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-primary/70" />
                        {formData.date ? format(formData.date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden rounded-xl border-border p-0 shadow-lg" align="start">
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
                    className="space-y-4 border-t border-border pt-5"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-primary uppercase">
                        Horários Disponíveis da Unidade
                        {isLoadingSlots && <Loader2 size={12} className="animate-spin" />}
                      </Label>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      {availableSlots.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          disabled={slot.status !== 'available'}
                          onClick={() => selectSlot(slot)}
                          className={cn(
                            "group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border px-2 py-3 text-[10px] font-semibold transition-all duration-300",
                            slot.status === 'available' 
                              ? formData.startTime === slot.start 
                                ? "scale-[0.97] border-primary bg-primary text-primary-foreground shadow-[0_12px_20px_-14px] shadow-primary" 
                                : "border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-[0_14px_20px_-16px] hover:shadow-emerald-300"
                              : slot.status === 'booked'
                                ? "cursor-not-allowed border-red-200 bg-red-50 text-red-400"
                                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          )}
                        >
                          {slot.status === 'available' && formData.startTime === slot.start && (
                            <motion.div layoutId="active-slot" className="absolute inset-0 z-[-1] bg-primary" />
                          )}
                          <span className="relative z-10">{slot.start}</span>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full relative z-10",
                            slot.status === 'available' ? "bg-emerald-500" : 
                            slot.status === 'booked' ? "bg-red-500" : "bg-slate-400"
                          )} />
                        </button>
                      ))}
                    </div>

                    {/* Legenda */}
                    <div className="flex items-center justify-center gap-4 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-semibold tracking-wide text-emerald-700 uppercase">Livre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-[8px] font-semibold tracking-wide text-red-700 uppercase">Ocupado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-500" />
                        <span className="text-[8px] font-semibold tracking-wide text-slate-600 uppercase">Bloqueado</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Recorrência */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <Label className="ml-1 text-[10px] font-semibold tracking-wide text-primary uppercase">Frequência</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={val => setFormData({ 
                      ...formData, 
                      type: val ?? 'ONE_OFF',
                      daysOfWeek: val === 'FIXED' && formData.date ? [formData.date.getDay()] : formData.daysOfWeek
                    })}
                  >
                    <SelectTrigger className="h-12 rounded-lg border-border bg-secondary/40 font-medium text-foreground focus:ring-primary">
                      <SelectValue placeholder="Selecione a frequência">
                        {formData.type === 'FIXED' ? 'Horário Fixo (Recorrente)' : 'Evento Único'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-border shadow-lg">
                      <SelectItem value="ONE_OFF" className="py-2.5 font-medium">Evento Único</SelectItem>
                      <SelectItem value="FIXED" className="py-2.5 font-medium">Horário Fixo (Recorrente)</SelectItem>
                    </SelectContent>
                  </Select>

                  {formData.type === 'FIXED' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-5 rounded-xl border border-border bg-secondary/50 p-5"
                    >
                      <div className="space-y-3">
                        <Label className="ml-1 text-[10px] font-medium tracking-wide text-primary uppercase">Repetir nos dias:</Label>
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
                                "h-10 w-10 rounded-lg p-0 text-xs font-medium transition-all",
                                formData.daysOfWeek.includes(day.v) 
                                  ? "border-primary bg-primary text-primary-foreground" 
                                  : "border-border bg-background text-muted-foreground hover:border-primary/30"
                              )}
                            >
                              {day.l}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label className="ml-1 text-[10px] font-medium tracking-wide text-primary uppercase">Até quando repetir?</Label>
                        <Input 
                          type="date"
                          value={formData.repeatUntil}
                          min={formData.date ? format(formData.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                          onChange={e => setFormData({ ...formData, repeatUntil: e.target.value })}
                          className="h-12 rounded-lg border-border bg-background text-sm font-medium focus-visible:ring-primary"
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
                    "group flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                    formData.airConditioning ? "border-primary/30 bg-primary/10" : "border-border bg-secondary/50 hover:bg-secondary"
                  )} onClick={() => setFormData({...formData, airConditioning: !formData.airConditioning})}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                        formData.airConditioning ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                      )}>
                        <Wind size={24} />
                      </div>
                      <div>
                        <p className={cn("text-xs font-medium tracking-wide uppercase", formData.airConditioning ? "text-primary" : "text-muted-foreground")}>Ar Condicionado</p>
                        <p className="text-[9px] font-medium text-muted-foreground uppercase">Climatizar</p>
                      </div>
                    </div>
                    <Checkbox checked={formData.airConditioning} className="rounded border-border data-[state=checked]:bg-primary" />
                  </div>

                  {/* Projeção */}
                  <div className={cn(
                    "group flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                    formData.projection ? "border-primary/30 bg-primary/10" : "border-border bg-secondary/50 hover:bg-secondary"
                  )} onClick={() => setFormData({...formData, projection: !formData.projection})}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                        formData.projection ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                      )}>
                        <Monitor size={24} />
                      </div>
                      <div>
                        <p className={cn("text-xs font-medium tracking-wide uppercase", formData.projection ? "text-primary" : "text-muted-foreground")}>Projeção / TV</p>
                        <p className="text-[9px] font-medium text-muted-foreground uppercase">Uso de tela</p>
                      </div>
                    </div>
                    <Checkbox checked={formData.projection} className="rounded border-border data-[state=checked]:bg-primary" />
                  </div>
                </div>

                {/* Microfones */}
                <div className={cn(
                  "rounded-xl border p-5 transition-all",
                  formData.microphones > 0 ? "border-primary/30 bg-primary/10" : "border-border bg-secondary/50"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                        formData.microphones > 0 ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                      )}>
                        <Mic size={24} />
                      </div>
                      <div>
                        <p className={cn("text-xs font-medium tracking-wide uppercase", formData.microphones > 0 ? "text-primary" : "text-muted-foreground")}>Microfones</p>
                        <p className="text-[9px] font-medium text-muted-foreground uppercase">Quantidade e tipo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-8 h-8 p-0 rounded-lg bg-white border-slate-100"
                        onClick={() => setFormData(prev => ({ ...prev, microphones: Math.max(0, prev.microphones - 1) }))}
                      >-</Button>
                      <span className="w-4 text-center text-sm font-medium text-foreground">{formData.microphones}</span>
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
                        className="rounded border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <Label htmlFor="wireless" className="text-[10px] font-medium tracking-wide text-primary uppercase opacity-80">Preferência por Sem Fio</Label>
                    </div>
                  )}
                </div>

                {/* Computadores */}
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setFormData({...formData, schoolComputer: !formData.schoolComputer, externalComputer: false})}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border p-5 transition-all",
                      formData.schoolComputer ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    <Laptop size={26} />
                    <span className="text-[10px] font-medium tracking-wide uppercase">PC Escola</span>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, externalComputer: !formData.externalComputer, schoolComputer: false})}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border p-5 transition-all",
                      formData.externalComputer ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    <Laptop size={26} />
                    <span className="text-[10px] font-medium tracking-wide uppercase">Meu Notebook</span>
                  </div>
                </div>

                {formData.externalComputer && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start gap-3 rounded-lg border border-border bg-secondary/60 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Info size={18} className="text-primary" />
                    </div>
                    <p className="text-[10px] font-medium leading-relaxed tracking-wide text-muted-foreground uppercase">
                      Não esqueça os adaptadores <strong>HDMI</strong> e de baixar seus arquivos previamente.
                    </p>
                  </motion.div>
                )}

                {/* Suporte de Áudio */}
                <div className={cn(
                  "group flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all",
                  formData.audioSupport ? "border-primary/30 bg-primary/10" : "border-border bg-secondary/50 hover:bg-secondary"
                )} onClick={() => setFormData({...formData, audioSupport: !formData.audioSupport})}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                      formData.audioSupport ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                    )}>
                      <Music size={24} />
                    </div>
                    <div>
                      <p className={cn("text-xs font-medium tracking-wide uppercase", formData.audioSupport ? "text-primary" : "text-muted-foreground")}>Suporte de Áudio</p>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase">Auxílio técnico</p>
                    </div>
                  </div>
                  <Checkbox checked={formData.audioSupport} className="rounded border-border data-[state=checked]:bg-primary" />
                </div>

                {/* Observações */}
                <div className="space-y-2.5">
                  <Label className="ml-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Observações Técnicas</Label>
                  <div className="relative group">
                    <FileText size={18} className="absolute left-4 top-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Textarea 
                      value={formData.techNotes}
                      onChange={e => setFormData({ ...formData, techNotes: e.target.value })}
                      placeholder="Descreva detalhes adicionais (cabos, adaptadores, microfones extras...)"
                      className="min-h-[120px] resize-none rounded-lg border-border bg-secondary/40 pl-12 text-sm font-medium transition-all focus-visible:ring-primary focus-visible:bg-background"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardContent>

      <CardFooter className="gap-3 border-t border-border bg-card p-5 sm:p-6">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border-border bg-background text-xs font-medium tracking-wide text-muted-foreground uppercase hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft size={16} /> Voltar
          </Button>
        )}
        
        {step < 2 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-medium tracking-wide text-primary-foreground uppercase shadow-[0_14px_22px_-14px] shadow-primary transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Próximo Passo <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isLoading}
            className="flex h-11 flex-[2] items-center justify-center gap-3 rounded-xl bg-primary text-xs font-medium tracking-wide text-primary-foreground uppercase shadow-[0_14px_22px_-14px] shadow-primary transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-50"
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
