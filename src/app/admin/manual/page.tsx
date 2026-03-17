import Header from '@/components/Header'
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Building2, 
  Mail, 
  Download, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default function AdminManual() {
  const sections = [
    {
      title: "Níveis de Acesso (RBAC)",
      icon: <ShieldCheck size={24} />,
      content: [
        { label: "Administrador", text: "Possui controle total. Pode criar unidades, gerenciar todos os espaços e cancelar qualquer agendamento do sistema." },
        { label: "Equipe Áudio Visual (AV)", text: "Responsável por uma unidade específica. Pode gerenciar agendamentos apenas nos espaços da sua unidade vinculada." },
        { label: "Professor/Colaborador", text: "Pode realizar reservas e gerenciar apenas os seus próprios agendamentos." }
      ]
    },
    {
      title: "Gestão de Ambientes",
      icon: <Building2 size={24} />,
      content: [
        { label: "Adicionar Espaço", text: "No painel Admin, clique em '+ Novo Espaço'. O sistema gerará automaticamente o QR Code para este novo ambiente." },
        { label: "Organização", text: "Os espaços são agrupados por Unidade Educacional para facilitar a gestão descentralizada." },
        { label: "Capacidade", text: "Defina a capacidade máxima para auxiliar os professores na escolha do ambiente adequado." }
      ]
    },
    {
      title: "Regras de Agendamento",
      icon: <Clock size={24} />,
      content: [
        { label: "Antecedência de 24h", text: "Professores devem agendar com no mínimo 24 horas de antecedência. Admins e AV podem ignorar esta regra para urgências." },
        { label: "Conflitos de Horário", text: "O sistema impede reservas sobrepostas no mesmo espaço, garantindo exclusividade de uso." },
        { label: "Aulas de 45 min", text: "O sistema sugere intervalos de 45 minutos, mas permite personalização conforme a necessidade pedagógica." }
      ]
    },
    {
      title: "Notificações Automáticas",
      icon: <Mail size={24} />,
      content: [
        { label: "Confirmação", text: "Enviada instantaneamente para o professor após a reserva ser concluída." },
        { label: "Lembrete 24h", text: "Disparado um dia antes da atividade para garantir o planejamento." },
        { label: "Alerta 30min", text: "Lembrete urgente enviado minutos antes do início para preparação final." }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <header className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-[#003399] hover:bg-white px-3 py-2 rounded-xl transition-all text-sm font-bold border border-transparent hover:border-gray-200">
            <ArrowLeft size={18} />
            Voltar ao Painel
          </Link>
          <h1 className="text-sm font-black text-[#003399] uppercase tracking-[0.2em]">Manual do Sistema</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#003399] tracking-tight mb-4 italic">Suporte ao Gestor</h2>
          <div className="h-1.5 w-24 bg-[#FFCC00] mx-auto rounded-full" />
          <p className="mt-6 text-gray-500 font-medium text-lg leading-relaxed">
            Guia completo de operação e boas práticas para administradores e equipe de apoio do sistema Marista Brasil.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,51,153,0.05)] transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-50 text-[#003399] rounded-2xl flex items-center justify-center shadow-sm">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-black text-[#003399] tracking-tight italic">{section.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {section.content.map((item, iIdx) => (
                  <div key={iIdx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#FFCC00] rounded-full" />
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</h4>
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed pl-3.5">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Support */}
        <div className="mt-16 bg-[#003399] p-10 rounded-[3rem] text-white text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Mail size={150} />
          </div>
          <h3 className="text-2xl font-black mb-4 relative z-10 tracking-tight italic">Ainda precisa de ajuda?</h3>
          <p className="text-blue-100 text-sm mb-8 font-medium leading-relaxed relative z-10 max-w-xl mx-auto">
            Se encontrar algum comportamento inesperado ou precisar de uma funcionalidade personalizada para sua unidade, entre em contato com o suporte técnico central.
          </p>
          <div className="flex justify-center gap-4 relative z-10">
            <a href="mailto:luis.gomes@maristabrasil.org" className="px-8 py-4 bg-[#FFCC00] text-[#003399] font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white transition-all shadow-lg active:scale-95">
              Enviar Chamado Técnico
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
