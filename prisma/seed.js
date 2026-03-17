const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  // Criar Usuário Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@marista.edu.br' },
    update: {},
    create: {
      name: 'Administrador Marista',
      email: 'admin@marista.edu.br',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Criar Unidades
  const maristao = await prisma.unit.upsert({
    where: { name: 'Maristão' },
    update: { slug: 'maristao' },
    create: { name: 'Maristão', slug: 'maristao' },
  })

  const maristinha = await prisma.unit.upsert({
    where: { name: 'Maristinha' },
    update: { slug: 'maristinha' },
    create: { name: 'Maristinha', slug: 'maristinha' },
  })

  const pioXII = await prisma.unit.upsert({
    where: { name: 'Pio XII' },
    update: { slug: 'pio-xii' },
    create: { name: 'Pio XII', slug: 'pio-xii' },
  })

  // Espaços Maristão
  const spacesMaristao = [
    { name: 'Anfiteatro 1', slug: 'maristao-anfiteatro-1' },
    { name: 'Anfiteatro 2', slug: 'maristao-anfiteatro-2' },
    { name: 'Teatro', slug: 'maristao-teatro' },
    { name: 'Estúdio', slug: 'maristao-estudio' },
  ]

  for (const space of spacesMaristao) {
    await prisma.space.upsert({
      where: { slug: space.slug },
      update: {},
      create: { ...space, unitId: maristao.id },
    })
  }

  // Espaços Maristinha
  const spacesMaristinha = [
    { name: 'Auditório', slug: 'maristinha-auditorio' },
    { name: 'Estúdio', slug: 'maristinha-estudio' },
  ]

  for (const space of spacesMaristinha) {
    await prisma.space.upsert({
      where: { slug: space.slug },
      update: {},
      create: { ...space, unitId: maristinha.id },
    })
  }

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
