import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { name, unitId, capacity, description } = await req.json()

    // Gerar slug a partir do nome e unidade
    const unit = await prisma.unit.findUnique({ where: { id: unitId } })
    const baseSlug = `${unit?.slug || 'unidade'}-${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`
    
    const space = await prisma.space.create({
      data: {
        name,
        slug: baseSlug,
        unitId,
        capacity: parseInt(capacity) || 0,
        description,
      },
    })

    return NextResponse.json(space, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao criar espaço' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id, name, unitId, capacity, description } = await req.json()

    const space = await prisma.space.update({
      where: { id },
      data: {
        name,
        unitId,
        capacity: parseInt(capacity) || 0,
        description,
      },
    })

    return NextResponse.json(space)
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao editar espaço' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ message: 'ID não fornecido' }, { status: 400 })

    await prisma.space.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Espaço excluído com sucesso' })
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao excluir espaço' }, { status: 500 })
  }
}
