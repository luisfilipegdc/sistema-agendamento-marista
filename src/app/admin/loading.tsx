import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="animate-spin text-[#003399]" size={48} />
        </div>
        <p className="text-[#003399] font-black uppercase tracking-[0.2em] text-xs animate-pulse">
          Carregando Painel Administrativo...
        </p>
      </div>
    </div>
  )
}
