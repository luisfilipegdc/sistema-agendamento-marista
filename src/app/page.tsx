import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CalendarClock, ArrowRight, Sparkles, Clock3, CalendarDays, BarChart3, Users, MapPin } from 'lucide-react'
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

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-[0_28px_40px_-34px] shadow-primary/70 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-wide text-primary">
            <Sparkles size={14} />
            Agenda com design comportamental
          </div>
          <h2 className="mt-4 text-2xl leading-tight font-black tracking-tight text-foreground sm:text-4xl">
            Fluxo rápido para agendar sem esforço
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Escolha unidade, espaço, data e horário em poucos cliques com feedback visual imediato.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <a href="#fluxo-decisao" className="group rounded-2xl bg-primary p-5 text-primary-foreground shadow-[0_20px_28px_-20px] shadow-primary transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <CalendarClock size={20} />
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold">Agendar Espaço</h3>
              <p className="mt-1 text-xs opacity-85">Reserve em menos de 30 segundos.</p>
            </a>
            <Link href="/minhas-reservas" className="group rounded-2xl border border-border bg-background p-5 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-primary">
                <Clock3 size={20} />
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-foreground">Minhas Reservas</h3>
              <p className="mt-1 text-xs text-muted-foreground">Gerencie, repita ou cancele horários.</p>
            </Link>
          </div>
        </section>

        <div id="fluxo-decisao" className="mb-14 scroll-mt-28">
          <section className="rounded-[2rem] border border-border/80 bg-card/80 p-5 sm:p-8">
            <HumanDecisionFlow units={units as any} />
          </section>
        </div>

        <section className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">Agenda Global</h3>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-muted-foreground">
              <CalendarDays size={13} />
              {allBookings.length} hoje
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_34px_-30px] shadow-primary/60 lg:col-span-2">
              <CalendarView bookings={allBookings as any} />
            </div>
            <div className="rounded-[2rem] border border-border bg-card p-5">
              <h4 className="mb-4 text-sm font-extrabold tracking-wide text-foreground">Próximas atividades</h4>
              <div className="space-y-3">
                {allBookings.slice(0, 4).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-6 text-center text-xs font-medium text-muted-foreground">
                    Nenhuma atividade agendada para hoje.
                  </div>
                ) : (
                  allBookings.slice(0, 4).map((booking) => (
                    <div key={booking.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wide text-primary">
                          {new Date(booking.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground">{booking.space.unit.name}</span>
                      </div>
                      <p className="truncate text-sm font-bold text-foreground">{booking.title}</p>
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

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: CalendarDays, title: 'Agendamento rápido', desc: 'Fluxo simples e objetivo.' },
            { icon: BarChart3, title: 'Visão em tempo real', desc: 'Status por horário e disponibilidade.' },
            { icon: Users, title: 'Apoio técnico', desc: 'Detalhes para equipe AV no mesmo fluxo.' }
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <feature.icon size={18} />
              </div>
              <p className="text-sm font-extrabold text-foreground">{feature.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mt-16 border-t border-border/70 bg-card/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Colégio Marista</span>
          <span>Sistema inteligente de organização de espaços</span>
        </div>
      </footer>
    </div>
  )
}
