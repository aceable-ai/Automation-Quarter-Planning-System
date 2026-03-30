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
      SELECT db_planned FROM dashboard_overrides WHERE id = 1 LIMIT 1
    `;
    const dbPlanned = (rows[0]?.['db_planned'] as Record<string, string> | null) ?? {};
    return NextResponse.json({ dbPlanned });
  } catch (err) {
    console.error('[db-roadmap GET]', err);
    return NextResponse.json({ dbPlanned: {} });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const { dbPlanned } = (await req.json()) as { dbPlanned: Record<string, string> };
    const val = JSON.stringify(dbPlanned);

    await sql`
      INSERT INTO dashboard_overrides (id, db_planned)
      VALUES (1, ${val}::jsonb)
      ON CONFLICT (id) DO UPDATE SET db_planned = EXCLUDED.db_planned
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[db-roadmap POST]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
