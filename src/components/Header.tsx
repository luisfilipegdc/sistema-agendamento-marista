import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import UserMenu from './UserMenu'
import { CalendarClock, House, LayoutDashboard, NotebookTabs } from 'lucide-react'

export default async function Header() {
  const session = await getServerSession(authOptions)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-[0.98]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_28px_-16px] shadow-primary/80 transition-all group-hover:-translate-y-0.5">
            <CalendarClock size={20} className="group-hover:animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base leading-none font-black tracking-tight text-foreground sm:text-lg">Agenda Inteligente</h1>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Marista Brasil</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-2xl border border-border/80 bg-card/70 p-1.5 md:flex">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold tracking-wide text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <House size={14} />
            Início
          </Link>
          <Link href="/minhas-reservas" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold tracking-wide text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <NotebookTabs size={14} />
            Reservas
          </Link>
          {(session?.user as any)?.role === 'ADMIN' && (
            <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold tracking-wide text-primary transition-colors hover:bg-primary/10">
              <LayoutDashboard size={14} />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <UserMenu user={session.user as any} />
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="rounded-xl px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Entrar
              </Link>
              <Link 
                href="/register" 
                className="rounded-xl bg-primary px-4 py-2 text-[11px] font-bold tracking-wide text-primary-foreground shadow-[0_16px_24px_-14px] shadow-primary transition-all hover:brightness-110 active:scale-95"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
