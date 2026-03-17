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

    const { 
      title, 
      class: className,
      purpose,
      start, 
      end, 
      spaceId, 
      type,
      repeatUntil,
      daysOfWeek,
      airConditioning,
      microphones,
      wirelessMic,
      projection,
      schoolComputer,
      externalComputer,
      audioSupport,
      techNotes
    } = await req.json()

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

    // 2. Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
    }

    // 3. Lógica de Recorrência
    const bookingsToCreate = []
    const recurrenceId = type === 'FIXED' ? Math.random().toString(36).substring(7) : null

    if (type === 'FIXED' && repeatUntil && daysOfWeek) {
      const limitDate = new Date(repeatUntil)
      limitDate.setHours(23, 59, 59, 999)
      
      let currentStart = new Date(startTime)
      let currentEnd = new Date(endTime)

      while (currentStart <= limitDate) {
        if (daysOfWeek.includes(currentStart.getDay())) {
          bookingsToCreate.push({
            title,
            class: className,
            purpose,
            start: new Date(currentStart),
            end: new Date(currentEnd),
            spaceId,
            userId: user.id,
            type,
            recurrenceId,
            repeatUntil: limitDate,
            airConditioning,
            microphones,
            wirelessMic,
            projection,
            schoolComputer,
            externalComputer,
            audioSupport,
            techNotes
          })
        }
        currentStart.setDate(currentStart.getDate() + 1)
        currentEnd.setDate(currentEnd.getDate() + 1)
      }
    } else {
      bookingsToCreate.push({
        title,
        class: className,
        purpose,
        start: startTime,
        end: endTime,
        spaceId,
        userId: user.id,
        type,
        airConditioning,
        microphones,
        wirelessMic,
        projection,
        schoolComputer,
        externalComputer,
        audioSupport,
        techNotes
      })
    }

    // 4. Verificar conflitos para todas as reservas geradas
    for (const b of bookingsToCreate) {
      const conflict = await prisma.booking.findFirst({
        where: {
          spaceId,
          status: 'CONFIRMED',
          OR: [
            {
              start: { lt: b.end },
              end: { gt: b.start },
            }
          ]
        }
      })

      if (conflict) {
        const conflictDate = b.start.toLocaleDateString('pt-BR')
        return NextResponse.json(
          { message: `Conflito de horário detectado em ${conflictDate}! Já existe uma reserva para este período.` },
          { status: 400 }
        )
      }
    }

    // 5. Criar as reservas
    const createdBookings = await prisma.$transaction(
      bookingsToCreate.map(data => 
        prisma.booking.create({
          data,
          include: {
            space: {
              include: {
                unit: true
              }
            }
          }
        })
      )
    )

    const booking = createdBookings[0]

    // 6. Enviar e-mail de confirmação para o professor
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
