import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    include: {
      unit: { select: { name: true } },
      _count: { select: { bookings: true } }
    },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(users)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { userId, role, unitId, password, name } = body

  const updateData: any = {}
  if (role) updateData.role = role
  if (unitId) updateData.unitId = unitId
  if (name) updateData.name = name
  if (password) {
    updateData.password = await bcrypt.hash(password, 10)
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 })
  }

  try {
    // Verificar se não está tentando excluir a si mesmo
    if (userId === (session.user as any).id) {
      return NextResponse.json({ error: 'Você não pode excluir a sua própria conta' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
  }
}
