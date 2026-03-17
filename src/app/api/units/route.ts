import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
    return NextResponse.json(units)
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar unidades' }, { status: 500 })
  }
}
