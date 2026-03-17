import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get('spaceId')
  const dateStr = searchParams.get('date')

  if (!spaceId || !dateStr) {
    return NextResponse.json({ message: 'Missing parameters' }, { status: 400 })
  }

  const date = new Date(dateStr)
  
  // Slots padrões de 45 minutos (Marista)
  const defaultSlots = [
    { start: '07:15', end: '08:00' },
    { start: '08:00', end: '08:45' },
    { start: '08:45', end: '09:30' },
    { start: '10:00', end: '10:45' },
    { start: '10:45', end: '11:30' },
    { start: '11:30', end: '12:15' },
    { start: '13:30', end: '14:15' },
    { start: '14:15', end: '15:00' },
    { start: '15:00', end: '15:45' },
    { start: '16:00', end: '16:45' },
    { start: '16:45', end: '17:30' },
  ]

  try {
    // 1. Buscar reservas do dia
    const bookings = await prisma.booking.findMany({
      where: {
        spaceId,
        status: 'CONFIRMED',
        start: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    })

    // 2. Buscar bloqueios administrativos do dia
    const blocks = await prisma.blockedSlot.findMany({
      where: {
        spaceId,
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    })

    // 3. Processar disponibilidade para cada slot
    const slotsWithStatus = defaultSlots.map(slot => {
      const slotStart = new Date(`${dateStr}T${slot.start}`)
      const slotEnd = new Date(`${dateStr}T${slot.end}`)

      // Verificar Bloqueio Admin (Prioridade Máxima)
      const isBlocked = blocks.some(b => {
        const bStart = b.startTime
        const bEnd = b.endTime
        return (slot.start < bEnd && bStart < slot.end)
      })

      if (isBlocked) return { ...slot, status: 'blocked' }

      // Verificar Reserva
      const isBooked = bookings.some(b => {
        const bStart = b.start
        const bEnd = b.end
        return (slotStart < bEnd && bStart < slotEnd)
      })

      if (isBooked) return { ...slot, status: 'booked' }

      return { ...slot, status: 'available' }
    })

    return NextResponse.json(slotsWithStatus)
  } catch (error) {
    console.error('Availability Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
