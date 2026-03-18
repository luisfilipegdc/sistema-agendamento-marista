import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { startOfDay, endOfDay } from 'date-fns'

const fallbackSlots = [
  { start: '07:15', end: '08:00', isReservable: true },
  { start: '08:00', end: '08:45', isReservable: true },
  { start: '08:45', end: '09:30', isReservable: true },
  { start: '10:00', end: '10:45', isReservable: true },
  { start: '10:45', end: '11:30', isReservable: true },
  { start: '11:30', end: '12:15', isReservable: true },
  { start: '13:30', end: '14:15', isReservable: true },
  { start: '14:15', end: '15:00', isReservable: true },
  { start: '15:00', end: '15:45', isReservable: true },
  { start: '16:00', end: '16:45', isReservable: true },
  { start: '16:45', end: '17:30', isReservable: true },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get('spaceId')
  const dateStr = searchParams.get('date')

  if (!spaceId || !dateStr) {
    return NextResponse.json({ message: 'Missing parameters' }, { status: 400 })
  }

  const date = new Date(dateStr)

  try {
    const [space, bookings, blocks] = await Promise.all([
      prisma.space.findUnique({
        where: { id: spaceId },
        include: {
          unit: {
            include: {
              scheduleSlots: {
                orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
              },
            },
          },
        },
      }),
      prisma.booking.findMany({
        where: {
          spaceId,
          status: 'CONFIRMED',
          start: {
            gte: startOfDay(date),
            lte: endOfDay(date),
          },
        },
      }),
      prisma.blockedSlot.findMany({
        where: {
          spaceId,
          date: {
            gte: startOfDay(date),
            lte: endOfDay(date),
          },
        },
      }),
    ])

    const configuredSlots = (space?.unit.scheduleSlots || []).map((slot) => ({
      start: slot.startTime,
      end: slot.endTime,
      isReservable: slot.isReservable,
    }))

    const unitSlots = configuredSlots.length > 0 ? configuredSlots : fallbackSlots

    const slotsWithStatus = unitSlots.map(slot => {
      const slotStart = new Date(`${dateStr}T${slot.start}:00`)
      const slotEnd = new Date(`${dateStr}T${slot.end}:00`)

      const isBooked = bookings.some(b => {
        const bStart = b.start
        const bEnd = b.end
        return (slotStart < bEnd && bStart < slotEnd)
      })

      if (isBooked) return { ...slot, status: 'booked' }

      const isBlocked = blocks.some(b => {
        const bStart = b.startTime
        const bEnd = b.endTime
        return (slot.start < bEnd && bStart < slot.end)
      })

      if (!slot.isReservable || isBlocked) return { ...slot, status: 'blocked' }

      return { ...slot, status: 'available' }
    })

    return NextResponse.json(slotsWithStatus)
  } catch (error) {
    console.error('Availability Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
