import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CalendarClock, ArrowRight, Clock3, CalendarDays, BarChart3, Users, MapPin } from 'lucide-react'
import Header from '@/components/Header'
import CalendarView from '@/components/CalendarView'
import HumanDecisionFlow from '@/components/HumanDecisionFlow'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [units, allBookings] = await Promise.all([
    prisma.unit.findMany({
      include: {
        _count: {
          select: { spaces: true }
        },
        spaces: {
          select: {
            id: true,
            name: true,
            slug: true,
            capacity: true
          }
        }
      }
    }),
    prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        start: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      include: {
        user: { select: { name: true } },
        space: { include: { unit: true } }
      },
      orderBy: { start: 'asc' }
    })
  ])

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        <section className="mb-8 rounded-2xl border border-border/80 bg-card/95 p-5 shadow-[0_24px_40px_-32px] shadow-primary/40 sm:p-7">
          <div className="mb-3 inline-flex items-center rounded-full bg-primary/12 px-3 py-1 text-[11px] font-medium tracking-wide text-primary">
            Agendamento guiado em 4 passos
          </div>
          <h2 className="text-2xl leading-[1.08] font-semibold tracking-[-0.02em] text-foreground sm:text-[2.15rem]">
            Agende com clareza, sem erro e sem burocracia
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px] md:text-base">
            Unidade, espaço, data e horário em sequência guiada com feedback imediato de disponibilidade.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {['1. Unidade', '2. Espaço', '3. Data', '4. Horário'].map((step) => (
              <span key={step} className="rounded-full border border-border bg-secondary/70 px-2.5 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
                {step}
              </span>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href="#fluxo-decisao" className="group rounded-xl bg-primary px-4 py-3.5 text-primary-foreground shadow-[0_16px_28px_-18px] shadow-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_34px_-20px] hover:shadow-primary/70 hover:bg-primary/90 active:translate-y-0">
              <div className="flex items-center justify-between">
                <CalendarClock size={18} />
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-3 text-base font-medium">Agendar agora</h3>
              <p className="mt-1 text-xs opacity-90">Começar fluxo guiado de agendamento.</p>
            </a>
            <Link href="/minhas-reservas" className="group rounded-xl border border-border bg-background px-4 py-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_-24px] hover:shadow-primary/35 hover:bg-secondary/60 active:translate-y-0">
              <div className="flex items-center justify-between text-primary">
                <Clock3 size={18} />
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-3 text-base font-medium text-foreground">Ver minhas reservas</h3>
              <p className="mt-1 text-xs text-muted-foreground">Acompanhe, ajuste e cancele horários.</p>
            </Link>
          </div>
        </section>

        <div id="fluxo-decisao" className="mb-9 scroll-mt-24">
          <section className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-[0_24px_38px_-34px] shadow-primary/35 sm:p-5">
            <HumanDecisionFlow units={units as any} />
          </section>
        </div>

        <section className="mb-9">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-medium tracking-tight text-foreground">Agenda Global</h3>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <CalendarDays size={13} />
              {allBookings.length} hoje
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-[0_24px_38px_-34px] shadow-primary/30 lg:col-span-2">
              <CalendarView bookings={allBookings as any} />
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-[0_24px_38px_-34px] shadow-primary/30">
              <h4 className="mb-3 text-sm font-semibold tracking-wide text-foreground">Próximas atividades</h4>
              <div className="space-y-3">
                {allBookings.slice(0, 4).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-xs font-medium text-muted-foreground">
                    Nenhuma atividade agendada para hoje.
                  </div>
                ) : (
                  allBookings.slice(0, 4).map((booking) => (
                    <div key={booking.id} className="rounded-xl border border-border bg-background/95 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_24px_-20px] hover:shadow-primary/40">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold tracking-wide text-primary">
                          {new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground">{booking.space.unit.name}</span>
                      </div>
                      <p className="truncate text-sm font-medium text-foreground">{booking.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        {booking.space.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3.5 sm:grid-cols-3">
          {[
            { icon: CalendarDays, title: 'Agendamento rápido', desc: 'Fluxo simples e objetivo.' },
            { icon: BarChart3, title: 'Visão em tempo real', desc: 'Status por horário e disponibilidade.' },
            { icon: Users, title: 'Apoio técnico', desc: 'Detalhes para equipe AV no mesmo fluxo.' }
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_20px_34px_-34px] shadow-primary/40">
              <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <feature.icon size={16} />
              </div>
              <p className="text-sm font-medium text-foreground">{feature.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mt-10 border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Colégio Marista</span>
          <span>Sistema inteligente de organização de espaços</span>
        </div>
      </footer>
    </div>
  )
}
