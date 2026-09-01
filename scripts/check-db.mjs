import { config } from 'dotenv';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

config({ path: '.env.local' });
config(); // fallback to .env if any

const hasDbUrl = Boolean(process.env.DATABASE_URL);
console.log(`DATABASE_URL: ${hasDbUrl ? 'PRESENT' : 'MISSING'}`);

if (!hasDbUrl) {
  console.error('DATABASE_URL is not defined.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    // 1. SELECT 1 test
    await pool.query('SELECT 1');
    console.log('POSTGRES SELECT 1: PASS');

    // 2. Program table query
    const programCount = await prisma.program.count();
    console.log('PROGRAM TABLE: PASS');
    console.log(`PROGRAM COUNT: ${programCount}`);

    // 3. Event table query
    const eventCount = await prisma.event.count();
    console.log('EVENT TABLE: PASS');
    console.log(`EVENT COUNT: ${eventCount}`);

    // 4. NewsPost table query
    const newsCount = await prisma.newsPost.count();
    console.log('NEWS TABLE: PASS');
    console.log(`NEWS COUNT: ${newsCount}`);

    // 5. GalleryItem table query
    const galleryCount = await prisma.galleryItem.count();
    console.log('GALLERY TABLE: PASS');
    console.log(`GALLERY COUNT: ${galleryCount}`);

    // 6. VolunteerApplication table query
    const volunteerCount = await prisma.volunteerApplication.count();
    console.log('VOLUNTEER TABLE: PASS');
    console.log(`VOLUNTEER COUNT: ${volunteerCount}`);

    // 7. ContactSubmission table query
    const contactCount = await prisma.contactSubmission.count();
    console.log('CONTACT TABLE: PASS');
    console.log(`CONTACT COUNT: ${contactCount}`);

    // 8. NewsletterSubscriber table query
    const subscriberCount = await prisma.newsletterSubscriber.count();
    console.log('NEWSLETTER TABLE: PASS');
    console.log(`NEWSLETTER COUNT: ${subscriberCount}`);


  } catch (err) {
    const safeMsg = (err.message || '').replace(/postgresql:\/\/[^@]*@[^\s]*/g, '[REDACTED]');
    console.error('DATABASE CHECK FAILED:', safeMsg);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

check();
