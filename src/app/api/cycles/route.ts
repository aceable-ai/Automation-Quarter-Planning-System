import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export async function GET() {
  try {
    const sql = getClient();
    const rows = await sql`
      SELECT * FROM cycles
      ORDER BY start_date DESC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[cycles GET]', err);
    return NextResponse.json([]);
  }
}

interface CycleBody {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string | null;
  budgetWeeks?: string;
  status?: string;
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const body = (await req.json()) as CycleBody;
    const { id, name, startDate, endDate, goal, budgetWeeks, status } = body;

    const rows = await sql`
      INSERT INTO cycles (id, name, start_date, end_date, goal, budget_weeks, status)
      VALUES (${id}, ${name}, ${startDate}, ${endDate}, ${goal ?? null}, ${budgetWeeks ?? '4.5'}, ${status ?? 'planning'})
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[cycles POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
