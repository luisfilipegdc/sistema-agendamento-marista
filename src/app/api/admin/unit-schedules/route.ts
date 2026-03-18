import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session || role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const unitId = searchParams.get('unitId')

  const slots = await prisma.unitScheduleSlot.findMany({
    where: unitId ? { unitId } : undefined,
    include: {
      unit: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { unit: { name: 'asc' } },
      { sortOrder: 'asc' },
      { startTime: 'asc' },
    ],
  })

  return NextResponse.json(slots)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session || role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { unitId, label, period, startTime, endTime, sortOrder, isReservable } = body

  if (!unitId || !startTime || !endTime) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  const created = await prisma.unitScheduleSlot.create({
    data: {
      unitId,
      label: label || null,
      period: period || null,
      startTime,
      endTime,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isReservable: typeof isReservable === 'boolean' ? isReservable : true,
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

  return NextResponse.json(created)
}
