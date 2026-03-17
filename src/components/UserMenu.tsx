'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { User, LogOut, ChevronDown, LayoutDashboard, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 pr-2 text-white">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[#FFCC00] border border-white/20">
            <User size={18} />
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-sm font-bold text-white">{user.name}</span>
            <span className="text-[10px] text-[#FFCC00] font-bold uppercase tracking-wider">{user.role}</span>
          </div>
          <ChevronDown size={14} className={`text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.1)] border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-5 py-4 border-b border-gray-50 mb-2">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.15em] mb-1">Identificado como</p>
            <p className="text-sm font-bold text-[#003399] truncate">{user.email}</p>
          </div>

          <div className="px-2 space-y-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-[#003399] rounded-xl transition-all"
            >
              <LayoutDashboard size={18} />
              Início / Unidades
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all"
              >
                <ShieldCheck size={18} />
                Painel Admin
              </Link>
            )}

            <div className="h-px bg-gray-50 my-2 mx-3" />

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all text-left"
            >
              <LogOut size={18} />
              Encerrar Sessão
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
