import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { name, slug } = await req.json()
    const unit = await prisma.unit.update({
      where: { id: params.id },
      data: { name, slug }
    })
    return NextResponse.json(unit)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar unidade' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await prisma.unit.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir unidade' }, { status: 500 })
  }
}
