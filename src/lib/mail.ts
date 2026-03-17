import nodemailer from 'nodemailer'

// Configuração para teste (Mailtrap ou Ethereal recomendado para dev)
// Para produção, substitua pelas credenciais SMTP do Marista
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'ethereal.user@ethereal.email',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'ethereal_password',
  },
})

interface SendMailProps {
  to: string
  subject: string
  template: 'confirmation' | 'reminder' | 'av_notification'
  data: {
    userName: string
    spaceName: string
    unitName: string
    date: string
    startTime: string
    endTime: string
    bookingId?: string
  }
}

export async function sendEmail({ to, subject, template, data }: SendMailProps) {
  const { userName, spaceName, unitName, date, startTime, endTime } = data

  const templates = {
    confirmation: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #003399; padding: 30px; text-align: center;">
          <h1 style="color: #FFCC00; margin: 0; font-size: 24px;">Agendamento Confirmado</h1>
          <p style="color: white; margin-top: 5px;">Marista Brasil - Gestão de Espaços</p>
        </div>
        <div style="padding: 30px;">
          <p>Olá, <strong>${userName}</strong>,</p>
          <p>Sua reserva foi realizada com sucesso! Confira os detalhes:</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Espaço:</strong> ${spaceName}</p>
            <p style="margin: 5px 0;"><strong>Unidade:</strong> ${unitName}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${startTime} às ${endTime}</p>
          </div>
          <p>Para cancelar ou editar, acesse o painel do sistema.</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          Este é um e-mail automático, por favor não responda.
        </div>
      </div>
    `,
    reminder: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #FFCC00; padding: 30px; text-align: center;">
          <h1 style="color: #003399; margin: 0; font-size: 24px;">Lembrete de Reserva</h1>
          <p style="color: #003399; margin-top: 5px; font-weight: bold;">Sua aula começa em breve!</p>
        </div>
        <div style="padding: 30px;">
          <p>Olá, <strong>${userName}</strong>,</p>
          <p>Este é um lembrete automático de que você possui um agendamento hoje:</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Onde:</strong> ${spaceName} (${unitName})</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${startTime} às ${endTime}</p>
          </div>
          <p>Certifique-se de que tudo está pronto para sua atividade.</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          Marista Brasil - Excelência em Educação
        </div>
      </div>
    `,
    av_notification: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #003399; padding: 30px; text-align: center;">
          <h1 style="color: #FFCC00; margin: 0; font-size: 24px;">Novo Chamado AV</h1>
          <p style="color: white; margin-top: 5px;">Solicitação de Suporte - ${unitName}</p>
        </div>
        <div style="padding: 30px;">
          <p>Equipe de Áudio Visual,</p>
          <p>Um novo agendamento foi realizado e pode exigir sua atenção:</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Professor:</strong> ${userName}</p>
            <p style="margin: 5px 0;"><strong>Espaço:</strong> ${spaceName}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${date} | ${startTime} - ${endTime}</p>
          </div>
          <p>Verifique o status do espaço e prepare os equipamentos necessários.</p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail({
      from: '"Agendamento Marista" <noreply@maristabrasil.org>',
      to,
      subject,
      html: templates[template],
    })
    console.log(`E-mail enviado para ${to} - Template: ${template}`)
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
  }
}
