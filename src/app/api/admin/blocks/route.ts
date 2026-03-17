import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const blocks = await prisma.blockedSlot.findMany({
    include: {
      space: {
        include: {
          unit: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  return NextResponse.json(blocks)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { spaceId, date, startTime, endTime, reason } = await req.json()

  const block = await prisma.blockedSlot.create({
    data: {
      spaceId,
      date: new Date(date),
      startTime,
      endTime,
      reason
    }
  })

  return NextResponse.json(block)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 })

  await prisma.blockedSlot.delete({
    where: { id }
  })

  return NextResponse.json({ message: 'Deleted' })
}
