import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users, Video, QrCode, Info, ShieldCheck, Settings, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Header from '@/components/Header'

import QRCodeDisplay from '@/components/QRCodeDisplay'
import BookingForm from '@/components/BookingForm'
import CalendarView from '@/components/CalendarView'
import CalendarExport from '@/components/CalendarExport'

export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  const space = await prisma.space.findUnique({
    where: { slug },
    include: {
      unit: true,
      bookings: {
        include: {
          user: {
            select: { name: true }
          },
          space: {
            select: { unitId: true }
          }
        },
        orderBy: { start: 'asc' }
      },
    },
  })

  if (!space) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <header className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={`/unidade/${space.unit.slug}`} className="group flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-secondary">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Voltar para {space.unit.name}</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Video size={16} />
            </div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{space.name}</h2>
          </div>

          <div className="flex items-center gap-4">
             <CalendarExport bookings={space.bookings as any} spaceName={space.name} />
             <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block" />
             <QRCodeDisplay slug={space.slug} spaceName={space.name} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Lado Esquerdo: Info e Formulário (4 colunas) */}
          <div className="order-2 space-y-6 lg:col-span-4 lg:order-1">
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700">
                <Info size={120} />
              </div>
              
              <div className="relative z-10">
                <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold tracking-tight text-foreground">
                  <ShieldCheck className="text-primary" size={20} />
                  Detalhes Técnicos
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-5 group/item">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Capacidade Máxima</p>
                      <p className="text-base font-semibold tracking-tight text-foreground">{space.capacity || 'Configuração variável'} pessoas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group/item">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                      <Clock size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Duração Sugerida</p>
                      <p className="text-base font-semibold tracking-tight text-foreground">Blocos de 45 min</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 group/item">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                      <Settings size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Recursos Disponíveis</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {space.name.toLowerCase().includes('estúdio') 
                          ? 'Infraestrutura profissional para gravação, croma key e iluminação.' 
                          : 'Ambiente climatizado com sistema de projeção e áudio integrado.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <BookingForm spaceId={space.id} spaceName={space.name} />
          </div>

          <div className="order-1 space-y-6 lg:col-span-8 lg:order-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-card p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">Agenda do Ambiente</h3>
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{space.unit.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Sincronizado
                </div>
              </div>
              <CalendarView bookings={space.bookings as any} />
            </div>

            <div className="relative flex items-center gap-5 overflow-hidden rounded-2xl border border-border bg-card p-5">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <Settings size={100} />
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Info size={24} />
              </div>
              <div className="relative z-10">
                <h4 className="mb-1 text-base font-semibold tracking-tight text-foreground">Dica de Agendamento</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Para eventos que necessitam de suporte técnico avançado, realize a reserva com pelo menos 48h de antecedência para garantir a disponibilidade da equipe de AV.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
