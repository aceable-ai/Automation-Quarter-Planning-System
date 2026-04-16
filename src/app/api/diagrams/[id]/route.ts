import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface DiagramData {
  nodes: unknown[];
  edges: unknown[];
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const rows = await sql`
      SELECT diagram_data FROM master_projects WHERE id = ${id} LIMIT 1
    `;
    const data = (rows[0]?.['diagram_data'] as DiagramData | null) ?? { nodes: [], edges: [] };
    return NextResponse.json(data);
  } catch (err) {
    console.error('[diagrams GET]', err);
    return NextResponse.json({ nodes: [], edges: [] });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const body = (await req.json()) as DiagramData;
    const json = JSON.stringify(body);
    await sql`
      UPDATE master_projects SET diagram_data = ${json}::jsonb, updated_at = NOW()
      WHERE id = ${id}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[diagrams POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
