import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const userRole = (session.user as any).role
    const userId = (session.user as any).id
    const userUnitId = (session.user as any).unitId

    // Buscar o agendamento para verificar permissões
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { space: true }
    })

    if (!booking) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 })
    }

    // Regras de Permissão:
    // 1. ADMIN: Pode tudo
    // 2. AV: Pode editar/apagar agendamentos da sua unidade
    // 3. PROFESSOR/COLLABORATOR: Pode apenas o seu próprio

    const isOwner = booking.userId === userId
    const isAdmin = userRole === 'ADMIN'
    const isAVFromSameUnit = userRole === 'AV' && booking.space.unitId === userUnitId

    if (!isAdmin && !isAVFromSameUnit && !isOwner) {
      return NextResponse.json({ message: 'Você não tem permissão para excluir este agendamento' }, { status: 403 })
    }

    await prisma.booking.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Agendamento excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error)
    return NextResponse.json({ message: 'Erro interno ao excluir' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const userRole = (session.user as any).role
    const userId = (session.user as any).id
    const userUnitId = (session.user as any).unitId

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { space: true }
    })

    if (!booking) {
      return NextResponse.json({ message: 'Agendamento não encontrado' }, { status: 404 })
    }

    const isOwner = booking.userId === userId
    const isAdmin = userRole === 'ADMIN'
    const isAVFromSameUnit = userRole === 'AV' && booking.space.unitId === userUnitId

    if (!isAdmin && !isAVFromSameUnit && !isOwner) {
      return NextResponse.json({ message: 'Sem permissão para editar' }, { status: 403 })
    }

    const data = await req.json()
    
    // Atualizar agendamento
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        title: data.title,
        start: data.start ? new Date(data.start) : undefined,
        end: data.end ? new Date(data.end) : undefined,
        status: data.status,
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao atualizar' }, { status: 500 })
  }
}
