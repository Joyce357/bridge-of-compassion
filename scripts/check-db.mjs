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
