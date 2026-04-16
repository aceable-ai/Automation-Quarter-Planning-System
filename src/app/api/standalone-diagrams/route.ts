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
      SELECT * FROM standalone_diagrams ORDER BY updated_at DESC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[standalone-diagrams GET]', err);
    return NextResponse.json([]);
  }
}

interface CreateBody { name: string; color?: string }

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const body = (await req.json()) as CreateBody;
    const rows = await sql`
      INSERT INTO standalone_diagrams (name, color)
      VALUES (${body.name}, ${body.color ?? '#6366f1'})
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[standalone-diagrams POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
