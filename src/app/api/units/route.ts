import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { spaces: true } }
      }
    })
    return NextResponse.json(units)
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar unidades' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { name, slug } = await req.json()
    const unit = await prisma.unit.create({
      data: { name, slug }
    })
    return NextResponse.json(unit)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar unidade' }, { status: 500 })
  }
}
