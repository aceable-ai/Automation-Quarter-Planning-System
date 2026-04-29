import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface CycleRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export async function GET() {
  try {
    const sql = getClient();
    const rows = (await sql`
      SELECT id, name, start_date, end_date, status
      FROM cycles
      WHERE CURRENT_DATE BETWEEN start_date AND end_date
      ORDER BY start_date DESC
      LIMIT 1
    `) as CycleRow[];
    return NextResponse.json({ cycle: rows[0] ?? null });
  } catch (err) {
    console.error('[cycles/current]', err);
    return NextResponse.json({ cycle: null });
  }
}
