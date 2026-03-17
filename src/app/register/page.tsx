'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState('PROFESSOR')
  const [units, setUnits] = useState<{ id: string, name: string }[]>([])

  // Buscar unidades para vincular equipe AV
  useEffect(() => {
    fetch('/api/units').then(res => res.json()).then(data => setUnits(data))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')
    const role = formData.get('role')
    const unitId = formData.get('unitId')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, unitId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Erro ao criar conta')
      }

      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md rounded-[2rem] border-border/80 bg-card/80 shadow-[0_40px_60px_-45px] shadow-primary/70">
        <CardHeader>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            M
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Crie sua conta</CardTitle>
          <CardDescription>Acesse o sistema de agendamento com fluxo guiado.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <Label className="mb-2 block text-xs tracking-wide text-muted-foreground">Nome Completo</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <Input
                  name="name"
                  type="text"
                  required
                  className="h-12 rounded-xl border-border bg-background pl-10 font-medium"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-xs tracking-wide text-muted-foreground">E-mail Institucional</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <Input
                  name="email"
                  type="email"
                  required
                  className="h-12 rounded-xl border-border bg-background pl-10 font-medium"
                  placeholder="email@marista.edu.br"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-xs tracking-wide text-muted-foreground">Senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <Input
                  name="password"
                  type="password"
                  required
                  className="h-12 rounded-xl border-border bg-background pl-10 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-xs tracking-wide text-muted-foreground">Tipo de Usuário</Label>
              <Select value={role} onValueChange={(value) => setRole(value ?? 'PROFESSOR')}>
                <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROFESSOR">Professor</SelectItem>
                  <SelectItem value="COLLABORATOR">Colaborador</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={role} />
            </div>

            <div className="text-center">
              <Link href="/register/av" className="text-xs text-muted-foreground hover:text-primary">
                Faz parte da equipe de Áudio Visual? Clique aqui
              </Link>
            </div>

            <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-xl text-sm font-bold">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Criar Conta <ArrowRight size={16} /></>}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-3 text-center">
            <Link href="/login" className="text-sm font-bold text-primary hover:underline">
              Já tem uma conta? Entre aqui
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
