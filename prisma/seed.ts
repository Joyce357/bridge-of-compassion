// ─── Prisma Seed Script ───────────────────────────────────────────────────
// Reads ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD from environment variables.
// Hashes the password with bcrypt. Never stores or exposes plaintext credentials.
//
// Run: npx prisma db seed
// Requires .env.local with ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD set.

import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Starting database seed…\n')

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD must be set in your .env.local file.\n' +
      'These are only used for seeding — never stored as plaintext.',
    )
  }

  if (adminPassword.length < 10) {
    throw new Error('ADMIN_INITIAL_PASSWORD must be at least 10 characters.')
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where:  { email: adminEmail },
    update: {},
    create: {
      email:    adminEmail,
      password: hashedPassword,
      name:     'Admin',
      role:     'ADMIN',
    },
  })

  console.log(`✅ Admin account ready: ${admin.email}`)
  console.log('   (Password is bcrypt-hashed and stored securely)\n')

  // ── Development events ─────────────────────────────────────────────────────
  // All content is clearly labeled as development seed data.
  // Do not use as real organizational content without review.

  const devEvents = [
    {
      title:           '[DEV] Community Waterway Cleanup',
      description:     '[Development seed data] Join us for our seasonal waterway cleanup. Bring gloves and a spirit of community — we supply the rest. All ages and abilities welcome.',
      date:            new Date('2025-09-20'),
      startTime:       '9:00 AM',
      endTime:         '1:00 PM',
      location:        '[Location TBC]',
      registrationOpen: true,
      published:       true,
    },
    {
      title:           '[DEV] Volunteer Orientation Session',
      description:     '[Development seed data] New to Bridge of Compassion? Attend our orientation to learn about volunteer opportunities and how you can make an impact.',
      date:            new Date('2025-10-04'),
      startTime:       '10:00 AM',
      endTime:         '12:00 PM',
      location:        '[Location TBC]',
      registrationOpen: true,
      published:       true,
    },
    {
      title:           '[DEV] Annual Compassion Gala',
      description:     '[Development seed data] Our flagship annual fundraising gala. An evening of community, celebration, and support.',
      date:            new Date('2025-11-15'),
      startTime:       '6:00 PM',
      endTime:         '10:00 PM',
      location:        '[Venue TBC]',
      registrationOpen: true,
      published:       true,
    },
  ]

  let eventsCreated = 0
  for (const event of devEvents) {
    const exists = await prisma.event.findFirst({ where: { title: event.title } })
    if (!exists) {
      await prisma.event.create({ data: event })
      eventsCreated++
    }
  }
  console.log(`✅ Events: ${eventsCreated} created (${devEvents.length - eventsCreated} already existed)`)

  // ── Development news posts ─────────────────────────────────────────────────

  const devPosts = [
    {
      title:       '[DEV] How Community Volunteers Restored a Local Waterway',
      slug:        'dev-waterway-restoration-story',
      excerpt:     '[Development seed data] When a community waterway fell into neglect, a small group of volunteers came together with a big vision.',
      content:     '[Development seed content] This is placeholder content for development purposes. Replace with real content from the client before publishing.\n\nThe story of how this waterway was restored is one of community resilience and determination. Volunteers from across the neighbourhood came together to...',
      author:      '[Dev Author]',
      publishedAt: new Date('2025-08-01'),
      published:   true,
    },
    {
      title:       '[DEV] Youth Leadership Workshop Recap',
      slug:        'dev-youth-leadership-workshop',
      excerpt:     '[Development seed data] Our most recent youth leadership workshop brought together young leaders aged 14–24.',
      content:     '[Development seed content] This is placeholder content for development purposes. Replace with real content from the client before publishing.',
      author:      '[Dev Author]',
      publishedAt: new Date('2025-07-15'),
      published:   true,
    },
  ]

  let postsCreated = 0
  for (const post of devPosts) {
    const exists = await prisma.newsPost.findUnique({ where: { slug: post.slug } })
    if (!exists) {
      await prisma.newsPost.create({ data: post })
      postsCreated++
    }
  }
  console.log(`✅ News posts: ${postsCreated} created (${devPosts.length - postsCreated} already existed)`)

  console.log('\n🎉 Seed complete.')
  console.log('   Remember: All [DEV] content is placeholder data only.')
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
