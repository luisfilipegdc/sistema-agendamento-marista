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
    <header className="bg-[#003399] border-b border-[#002266] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#003399] font-bold group-hover:scale-105 transition-all shadow-sm">
            M
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white leading-tight">Agendamento</h1>
            <span className="text-[10px] font-bold text-[#FFCC00] uppercase tracking-[0.2em]">Marista Brasil</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <UserMenu user={session.user as any} />
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-bold text-white hover:text-[#FFCC00] transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 bg-[#FFCC00] text-[#003399] text-sm font-bold rounded-md hover:bg-[#e6b800] transition-colors shadow-sm"
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
