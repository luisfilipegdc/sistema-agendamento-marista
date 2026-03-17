import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'
import { format, addHours, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // Verificar se a requisição vem da Vercel Cron ou tem uma chave secreta
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  console.log('[CRON] Verificando lembretes de agendamento...')
  
  const now = new Date()
  const in24Hours = addHours(now, 24)
  const in30Minutes = addMinutes(now, 30)

  try {
    // 1. Lembretes de 24 horas
    const bookings24h = await prisma.booking.findMany({
      where: {
        start: {
          gte: in24Hours,
          lt: addMinutes(in24Hours, 10) // Janela maior para garantir
        },
        status: 'CONFIRMED'
      },
      include: { user: true, space: { include: { unit: true } } }
    })

    for (const booking of bookings24h) {
      await sendEmail({
        to: booking.user.email,
        subject: `Lembrete (24h): Reserva em ${booking.space.name}`,
        template: 'reminder',
        data: {
          userName: booking.user.name || 'Professor',
          spaceName: booking.space.name,
          unitName: booking.space.unit.name,
          date: format(booking.start, "dd 'de' MMMM", { locale: ptBR }),
          startTime: format(booking.start, "HH:mm"),
          endTime: format(booking.end, "HH:mm")
        }
      })
    }

    // 2. Lembretes de 30 minutos
    const bookings30m = await prisma.booking.findMany({
      where: {
        start: {
          gte: in30Minutes,
          lt: addMinutes(in30Minutes, 10)
        },
        status: 'CONFIRMED'
      },
      include: { user: true, space: { include: { unit: true } } }
    })

    for (const booking of bookings30m) {
      await sendEmail({
        to: booking.user.email,
        subject: `Lembrete Urgente (30min): Reserva em ${booking.space.name}`,
        template: 'reminder',
        data: {
          userName: booking.user.name || 'Professor',
          spaceName: booking.space.name,
          unitName: booking.space.unit.name,
          date: 'Hoje',
          startTime: format(booking.start, "HH:mm"),
          endTime: format(booking.end, "HH:mm")
        }
      })
    }

    return NextResponse.json({ success: true, processed: bookings24h.length + bookings30m.length })
  } catch (error) {
    console.error('[CRON ERROR]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
