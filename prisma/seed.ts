import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('admin123', 10)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@saanify.com' },
    update: {},
    create: {
      email: 'superadmin@saanify.com',
      name: 'Super Admin',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  })

  // Create Demo Client Admin
  const clientPassword = await bcrypt.hash('client123', 10)
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 15) // 15 days trial

  const clientAdmin = await prisma.user.upsert({
    where: { email: 'client@saanify.com' },
    update: {},
    create: {
      email: 'client@saanify.com',
      name: 'Client Admin',
      phone: '+91 98765 43210',
      password: clientPassword,
      role: 'CLIENT',
      isActive: true
    }
  })

  // Create Demo Society Accounts
  const societies = [
    {
      id: 'green-valley-society',
      name: 'Green Valley Society',
      adminEmail: 'client@saanify.com',
      adminPhone: '+91 98765 43210',
      status: 'ACTIVE' as const,
      subscriptionPlan: 'PRO' as const,
      subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      address: '123 Green Valley Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      totalMembers: 150,
      createdBy: superAdmin.id
    },
    {
      id: 'sunset-apartments',
      name: 'Sunset Apartments',
      adminEmail: 'sunset@example.com',
      adminPhone: '+91 98765 54321',
      status: 'TRIAL' as const,
      subscriptionPlan: 'TRIAL' as const,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      address: '456 Sunset Boulevard',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      totalMembers: 80,
      createdBy: superAdmin.id
    },
    {
      id: 'royal-residency',
      name: 'Royal Residency',
      adminEmail: 'royal@example.com',
      adminPhone: '+91 98765 65432',
      status: 'EXPIRED' as const,
      subscriptionPlan: 'BASIC' as const,
      subscriptionEndsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      address: '789 Royal Street',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      totalMembers: 200,
      createdBy: superAdmin.id
    },
    {
      id: 'blue-sky-heights',
      name: 'Blue Sky Heights',
      adminEmail: 'bluesky@example.com',
      adminPhone: '+91 98765 76543',
      status: 'LOCKED' as const,
      subscriptionPlan: 'ENTERPRISE' as const,
      subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      address: '321 Sky Tower',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      totalMembers: 120,
      createdBy: superAdmin.id
    }
  ]

  for (const society of societies) {
    const { id, ...societyData } = society
    await prisma.societyAccount.upsert({
      where: { id },
      update: societyData,
      create: society
    })
  }

  // Link client admin to Green Valley Society
  const greenValleySociety = await prisma.societyAccount.findUnique({
    where: { id: 'green-valley-society' }
  })

  if (greenValleySociety) {
    await prisma.user.update({
      where: { id: clientAdmin.id },
      data: { societyAccountId: greenValleySociety.id }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Demo Credentials:')
  console.log('🔑 Super Admin: superadmin@saanify.com / admin123')
  console.log('🔑 Client Admin: client@saanify.com / client123')
  console.log('\n🏢 Demo Societies:')
  console.log('📊 Green Valley Society - Active (PRO)')
  console.log('📊 Sunset Apartments - Trial (7 days left)')
  console.log('📊 Royal Residency - Expired (BASIC)')
  console.log('📊 Blue Sky Heights - Locked (ENTERPRISE)')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })