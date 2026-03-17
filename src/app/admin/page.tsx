import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import AdminDashboardTabs from '@/components/AdminDashboardTabs'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  if (!isAdmin) {
    redirect('/')
  }

  // Fetch data in parallel for the dashboard
  const [units, spaces, users, totalBookings, recentUsers] = await Promise.all([
    prisma.unit.findMany({ 
      orderBy: { name: 'asc' } 
    }),
    prisma.space.findMany({ 
      include: { unit: true },
      orderBy: { unit: { name: 'asc' } }
    }),
    prisma.user.findMany({ 
      orderBy: { name: 'asc' } 
    }),
    prisma.booking.count(),
    prisma.user.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      take: 5 
    })
  ])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-4xl font-black text-[#003399] tracking-tight italic">Painel Administrativo</h1>
          <p className="text-gray-500 font-medium mt-1">Gestão centralizada de ativos e usuários Marista Brasil.</p>
        </div>

        <AdminDashboardTabs 
          units={units}
          spaces={spaces}
          users={users}
          totalBookings={totalBookings}
          recentUsers={recentUsers}
        />
      </main>
    </div>
  )
}
