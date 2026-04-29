import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface CycleRow {
  id: string;
  start_date: string;
  end_date: string;
}

interface EntryRow {
  id: string;
  author: string;
  title: string;
  created_at: string;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id: cycleId } = await ctx.params;
    const cycleRows = (await sql`
      SELECT id, start_date, end_date FROM cycles WHERE id = ${cycleId}
    `) as CycleRow[];
    if (cycleRows.length === 0) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }
    const cycle = cycleRows[0]!;
    const entries = (await sql`
      SELECT id, author, title, created_at
      FROM feedback_inbox
      WHERE source = 'intake-form'
        AND created_at >= ${cycle.start_date}
        AND created_at <= ${cycle.end_date}::date + INTERVAL '1 day'
      ORDER BY created_at ASC
    `) as EntryRow[];
    return NextResponse.json({ count: entries.length, entries });
  } catch (err) {
    console.error('[drawing-entries]', err);
    return NextResponse.json({ count: 0, entries: [] });
  }
}
