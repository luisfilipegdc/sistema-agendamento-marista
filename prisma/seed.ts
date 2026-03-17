import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  // Criar Unidade Padrão
  const unit = await prisma.unit.upsert({
    where: { name: 'Marista Brasil - Sede' },
    update: {},
    create: {
      name: 'Marista Brasil - Sede',
      slug: 'marista-sede',
    },
  })

  // Criar Usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@maristabrasil.org' },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email: 'admin@maristabrasil.org',
      name: 'Administrador Marista',
      password: hashedPassword,
      role: 'ADMIN',
      unitId: unit.id
    },
  })

  console.log('Seed concluído com sucesso!')
  console.log('Admin Email: admin@maristabrasil.org')
  console.log('Admin Senha: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
