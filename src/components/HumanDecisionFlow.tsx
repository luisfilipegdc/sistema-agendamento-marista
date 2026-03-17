'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, ArrowRight, Users, Calendar, ChevronLeft } from 'lucide-react'

interface Unit {
  id: string
  name: string
  slug: string
  _count: { spaces: number }
  spaces: Array<{
    id: string
    name: string
    slug: string
    capacity: number | null
  }>
}

export default function HumanDecisionFlow({ units }: { units: Unit[] }) {
  const [step, setStep] = useState(1)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit)
    setStep(2)
    document.getElementById('decision-flow')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div id="decision-flow" className="mx-auto w-full max-w-5xl">
      <div className="mb-7 text-center">
        <h3 className="text-2xl leading-tight font-semibold tracking-tight text-foreground sm:text-3xl">
          {step === 1 ? 'Onde vamos agendar hoje?' : `Qual espaço no ${selectedUnit?.name}?`}
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          {step === 1 
            ? 'Selecione a unidade educacional para ver os ambientes disponíveis.' 
            : 'Escolha o ambiente ideal para sua atividade acadêmica.'}
        </p>
      </div>

      <div className="relative min-h-[320px]">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((unit, index) => (
              <motion.button
                key={unit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleUnitSelect(unit)}
                className="group flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center transition-colors hover:bg-secondary/40"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Building2 size={22} />
                </div>
                <h4 className="text-base font-semibold tracking-tight text-foreground">{unit.name}</h4>
                <p className="mb-4 mt-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {unit._count.spaces} Ambientes
                </p>
                <div className="mt-auto inline-flex items-center gap-1 text-[10px] font-medium tracking-wide text-primary">
                  Ver Espaços <ArrowRight size={14} />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {step === 2 && selectedUnit && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <button 
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-[10px] font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft size={12} />
              Voltar para Unidades
            </button>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedUnit.spaces.map((space, index) => (
                <Link
                  key={space.id}
                  href={`/espaco/${space.slug}`}
                  className="group rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
                >
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar size={18} />
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-1 text-[9px] font-medium tracking-wide text-foreground">
                      Disponível
                    </span>
                  </div>
                  <h4 className="text-base font-semibold tracking-tight text-foreground">{space.name}</h4>
                  <div className="mb-5 mt-2 flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                    <Users size={14} className="text-primary" />
                    <span>Capacidade: {space.capacity || '--'} pessoas</span>
                  </div>
                  <div className="mt-auto w-full rounded-lg bg-primary py-2.5 text-center text-[10px] font-medium tracking-wide text-primary-foreground transition-colors group-hover:bg-primary/90">
                    Agendar Agora
                  </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
