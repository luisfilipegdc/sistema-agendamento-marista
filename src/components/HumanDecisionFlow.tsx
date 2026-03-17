'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, ArrowRight, Sparkles, MapPin, Users, Calendar } from 'lucide-react'

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
  const [step, setStep] = useState(1) // 1: Unidade, 2: Espaço
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit)
    setStep(2)
    // Scroll suave para o topo do seletor
    document.getElementById('decision-flow')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div id="decision-flow" className="w-full max-w-5xl mx-auto">
      {/* Header do Fluxo */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-yellow-100 animate-pulse">
          <Sparkles size={12} /> Comece por aqui
        </div>
        <h3 className="text-3xl sm:text-5xl font-black text-[#003399] tracking-tight italic mb-4">
          {step === 1 ? 'Onde vamos agendar hoje?' : `Qual espaço no ${selectedUnit?.name}?`}
        </h3>
        <p className="text-slate-400 font-medium text-sm sm:text-base">
          {step === 1 
            ? 'Selecione a unidade educacional para ver os ambientes disponíveis.' 
            : 'Escolha o ambiente ideal para sua atividade acadêmica.'}
        </p>
      </div>

      {/* Grid de Decisão */}
      <div className="relative min-h-[400px]">
        {/* Passo 1: Seleção de Unidade */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => handleUnitSelect(unit)}
                className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 text-left relative overflow-hidden flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-slate-50 text-[#003399] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#003399] group-hover:text-white group-hover:rotate-6 transition-all duration-700 shadow-inner">
                  <Building2 size={32} />
                </div>
                <h4 className="text-2xl font-black text-[#003399] mb-2 tracking-tight italic">{unit.name}</h4>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">
                  {unit._count.spaces} Ambientes
                </p>
                <div className="mt-auto flex items-center gap-2 text-[#003399] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  Ver Espaços <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Passo 2: Seleção de Espaço */}
        {step === 2 && selectedUnit && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Botão Voltar */}
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-slate-400 hover:text-[#003399] font-black text-[10px] uppercase tracking-widest transition-colors mb-4"
            >
              ← Voltar para Unidades
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedUnit.spaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/espaco/${space.slug}`}
                  className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 text-left flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-blue-50 text-[#003399] rounded-2xl flex items-center justify-center group-hover:bg-[#FFCC00] group-hover:text-[#003399] transition-all duration-500">
                      <Calendar size={24} />
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100">
                      Disponível
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-[#003399] mb-4 tracking-tight italic group-hover:text-blue-700">{space.name}</h4>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold mb-8">
                    <Users size={14} className="text-[#FFCC00]" />
                    <span>Capacidade: {space.capacity || '--'} pessoas</span>
                  </div>
                  <div className="mt-auto w-full py-4 bg-slate-50 group-hover:bg-[#003399] group-hover:text-white rounded-2xl text-center text-[10px] font-black uppercase tracking-widest transition-all">
                    Agendar Agora
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
