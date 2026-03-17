import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { sendEmail } from '@/lib/mail'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { title, start, end, spaceId, type } = await req.json()

    const startTime = new Date(start)
    const endTime = new Date(end)
    const now = new Date()

    // 1. Validar Prazo de 24 horas (Admin e AV ignoram esta regra se necessário)
    const isSpecialUser = ['ADMIN', 'AV'].includes(session.user.role)
    const hoursDifference = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (!isSpecialUser && hoursDifference < 24) {
      return NextResponse.json(
        { message: 'Agendamentos devem ser feitos com no mínimo 24h de antecedência.' },
        { status: 400 }
      )
    }

    // 2. Validar Duração (Sugerir 45 min)
    // Se o usuário não definiu o fim, ou se queremos forçar 45 min:
    // const forcedEndTime = new Date(startTime.getTime() + 45 * 60 * 1000)

    // 3. Buscar o usuário pelo e-mail da sessão
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
    }

    // 4. Verificar conflitos de horário exatos
    const conflict = await prisma.booking.findFirst({
      where: {
        spaceId,
        status: 'CONFIRMED',
        OR: [
          {
            start: { lt: endTime },
            end: { gt: startTime },
          }
        ]
      }
    })

    if (conflict) {
      return NextResponse.json(
        { message: 'Conflito de horário! Já existe uma reserva para este período.' },
        { status: 400 }
      )
    }

    // 5. Criar o agendamento
    const booking = await prisma.booking.create({
      data: {
        title,
        start: startTime,
        end: endTime,
        spaceId,
        userId: user.id,
        type,
      },
      include: {
        space: {
          include: {
            unit: true
          }
        }
      }
    })

    // 4. Enviar e-mail de confirmação para o professor
    const formattedDate = format(startTime, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    const startStr = format(startTime, "HH:mm")
    const endStr = format(endTime, "HH:mm")

    await sendEmail({
      to: user.email,
      subject: `Reserva Confirmada: ${booking.space.name}`,
      template: 'confirmation',
      data: {
        userName: user.name || 'Professor',
        spaceName: booking.space.name,
        unitName: booking.space.unit.name,
        date: formattedDate,
        startTime: startStr,
        endTime: endStr
      }
    })

    // 5. Notificar equipe de Áudio Visual da Unidade
    const avResponsibles = await prisma.user.findMany({
      where: {
        role: 'AV',
        unitId: booking.space.unitId
      }
    })

    for (const av of avResponsibles) {
      await sendEmail({
        to: av.email,
        subject: `Novo Chamado AV: ${booking.space.unit.name} - ${booking.space.name}`,
        template: 'av_notification',
        data: {
          userName: user.name || 'Professor',
          spaceName: booking.space.name,
          unitName: booking.space.unit.name,
          date: formattedDate,
          startTime: startStr,
          endTime: endStr
        }
      })
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { message: 'Erro interno ao processar o agendamento' },
      { status: 500 }
    )
  }
}
