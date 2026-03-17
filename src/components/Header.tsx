import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import UserMenu from './UserMenu'

export default async function Header() {
  const session = await getServerSession(authOptions)
  
  // Debug log para verificar o papel do usuário no servidor
  if (session) {
    console.log(`[AUTH DEBUG] Usuário: ${session.user?.email}, Role: ${(session.user as any)?.role}`)
  }

  return (
    <header className="bg-[#003399] border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group transition-transform active:scale-95">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#003399] font-black text-xl group-hover:rotate-6 transition-all shadow-xl shadow-blue-900/20">
            M
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white leading-none tracking-tight italic">Agendamento</h1>
            <span className="text-[10px] font-black text-[#FFCC00] uppercase tracking-[0.3em] mt-1">Marista Brasil</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[10px] font-black text-white/70 hover:text-white uppercase tracking-[0.2em] transition-colors">Início</Link>
          <Link href="/minhas-reservas" className="text-[10px] font-black text-white/70 hover:text-white uppercase tracking-[0.2em] transition-colors">Minhas Reservas</Link>
          {(session?.user as any)?.role === 'ADMIN' && (
            <Link href="/admin" className="text-[10px] font-black text-[#FFCC00] hover:text-white uppercase tracking-[0.2em] transition-colors">Painel Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-6">
          {session ? (
            <div className="flex items-center gap-4">
              <UserMenu user={session.user as any} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-xs font-black text-white/80 hover:text-[#FFCC00] uppercase tracking-widest transition-all px-4 py-2 rounded-xl hover:bg-white/5"
              >
                Entrar
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-3 bg-[#FFCC00] text-[#003399] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white hover:shadow-xl hover:shadow-yellow-500/10 transition-all active:scale-95 shadow-lg shadow-yellow-500/5"
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
