import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const rows = await sql`
      UPDATE project_comments
      SET vetted = NOT vetted
      WHERE id = ${id}::uuid
      RETURNING id, project_name, author, content, vetted, created_at
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[comments PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    await sql`DELETE FROM project_comments WHERE id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[comments DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
