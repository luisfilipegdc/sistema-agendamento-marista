'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const registered = searchParams.get('registered')
    if (registered) {
      setSuccess('Conta criada com sucesso! Faça login para continuar.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error('E-mail ou senha inválidos')
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md rounded-[2rem] border-border/80 bg-card/80 shadow-[0_40px_60px_-45px] shadow-primary/70">
        <CardHeader className="space-y-3 pb-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            M
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Acesse sua conta</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Entre para continuar no fluxo de agendamento inteligente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle size={18} />
                {success}
              </div>
            )}
            
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

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

            <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-xl text-sm font-bold">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Entrar <ArrowRight size={16} /></>}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-3 text-center">
            <p className="mb-2 text-xs text-muted-foreground">Novo por aqui?</p>
            <Link href="/register" className="text-sm font-bold text-primary hover:underline">
              Criar conta de professor
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <LoginForm />
    </Suspense>
  )
}
