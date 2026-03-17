import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import UserMenu from './UserMenu'
import { CalendarClock, House, LayoutDashboard, NotebookTabs } from 'lucide-react'

export default async function Header() {
  const session = await getServerSession(authOptions)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-[0.98]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <CalendarClock size={18} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm leading-none font-bold tracking-tight text-foreground sm:text-base">Agenda Inteligente</h1>
            <span className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground">Marista Brasil</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl border border-border bg-card p-1 md:flex">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <House size={14} />
            Início
          </Link>
          <Link href="/minhas-reservas" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <NotebookTabs size={14} />
            Reservas
          </Link>
          {(session?.user as any)?.role === 'ADMIN' && (
            <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
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
              <Link href="/login" className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                Entrar
              </Link>
              <Link href="/register" className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
