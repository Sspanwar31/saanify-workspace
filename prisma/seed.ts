import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create super admin user
  const superAdminEmail = 'superadmin@saanify.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })
    
    console.log('✅ Super admin created:', superAdmin.email)
  } else {
    console.log('✅ Super admin already exists:', existingAdmin.email)
  }

  // Create some sample customers for testing
  const sampleCustomers = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      company: 'Doe Enterprises',
      plan: 'PROFESSIONAL',
      status: 'active',
      revenue: 999
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      company: 'Smith Consulting',
      plan: 'STARTER',
      status: 'trial',
      revenue: 0
    },
    {
      email: 'mike.wilson@example.com',
      name: 'Mike Wilson',
      company: 'Wilson Tech',
      plan: 'ENTERPRISE',
      status: 'active',
      revenue: 2499
    },
    {
      email: 'sarah.jones@example.com',
      name: 'Sarah Jones',
      company: 'Jones Media',
      plan: 'PROFESSIONAL',
      status: 'expired',
      revenue: 599
    },
    {
      email: 'alex.brown@example.com',
      name: 'Alex Brown',
      company: 'Brown Studios',
      plan: 'STARTER',
      status: 'locked',
      revenue: 99
    }
  ]

  for (const customer of sampleCustomers) {
    const existingCustomer = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!existingCustomer) {
      const hashedPassword = await bcrypt.hash('password123', 12)
      
      await prisma.user.create({
        data: {
          email: customer.email,
          name: customer.name,
          password: hashedPassword,
          role: 'CLIENT',
          isActive: customer.status !== 'locked'
        }
      })
      
      console.log(`✅ Sample customer created: ${customer.email}`)
    }
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })