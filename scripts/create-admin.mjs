import { config } from 'dotenv'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

config({ path: '.env.local' })
config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close()
      resolve(ans.trim())
    }),
  )
}

async function run() {
  try {
    let email = process.env.ADMIN_EMAIL || process.argv[2]
    let password = process.env.ADMIN_PASSWORD || process.argv[3]
    let name = process.env.ADMIN_NAME || process.argv[4] || 'Admin'

    if (!email) {
      email = await askQuestion('Enter Admin Email: ')
    }

    if (!password) {
      password = await askQuestion('Enter Admin Password (min 10 chars): ')
    }

    if (!email || !email.includes('@')) {
      console.error('❌ Error: Valid email is required.')
      process.exit(1)
    }

    if (!password || password.length < 10) {
      console.error('❌ Error: Password must be at least 10 characters long.')
      process.exit(1)
    }

    const normalizedEmail = email.toLowerCase().trim()
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        password: hashedPassword,
        name: name,
        role: 'ADMIN',
      },
      create: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    console.log(`✅ Admin account created/updated successfully for: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log('   Password securely hashed with bcrypt (cost factor 12).')
  } catch (err) {
    const safeMsg = (err.message || '').replace(/postgresql:\/\/[^@]*@[^\s]*/g, '[REDACTED]')
    console.error('❌ Error creating admin user:', safeMsg)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

run()
