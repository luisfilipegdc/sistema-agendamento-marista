import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session || role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { label, period, startTime, endTime, sortOrder, isReservable } = body

  const updated = await prisma.unitScheduleSlot.update({
    where: { id },
    data: {
      label: label === undefined ? undefined : (label || null),
      period: period === undefined ? undefined : (period || null),
      startTime,
      endTime,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : undefined,
      isReservable: typeof isReservable === 'boolean' ? isReservable : undefined,
    },
    include: {
      unit: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session || role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await prisma.unitScheduleSlot.delete({
    where: { id },
  })

  return NextResponse.json({ message: 'Deleted' })
}
