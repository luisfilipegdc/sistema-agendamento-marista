import cron from 'node-cron'
import { prisma } from './prisma'
import { sendEmail } from './mail'
import { format, addHours, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function initCron() {
  // Executa a cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
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
            lt: addMinutes(in24Hours, 5) // Janela de 5 min
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
            lt: addMinutes(in30Minutes, 5)
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
    } catch (error) {
      console.error('[CRON ERROR]', error)
    }
  })
}
