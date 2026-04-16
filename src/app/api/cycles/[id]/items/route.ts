import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const rows = await sql`
      SELECT b.*, m.name AS project_name, m.color AS project_color
      FROM backlog_items b
      LEFT JOIN master_projects m ON m.id = b.project_id
      WHERE b.cycle_id = ${id}
      ORDER BY b.priority::numeric DESC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[cycle items GET]', err);
    return NextResponse.json([]);
  }
}
