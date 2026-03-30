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
    const rows = await sql`SELECT descriptions FROM dashboard_overrides WHERE id = 1 LIMIT 1`;
    const descriptions = (rows[0]?.['descriptions'] as Record<string, string> | null) ?? {};
    return NextResponse.json({ descriptions });
  } catch (err) {
    console.error('[descriptions GET]', err);
    return NextResponse.json({ descriptions: {} });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const { descriptions } = (await req.json()) as { descriptions: Record<string, string> };
    const val = JSON.stringify(descriptions);
    await sql`
      INSERT INTO dashboard_overrides (id, descriptions)
      VALUES (1, ${val}::jsonb)
      ON CONFLICT (id) DO UPDATE SET descriptions = EXCLUDED.descriptions
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[descriptions POST]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
