import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface DiagramData { nodes: unknown[]; edges: unknown[] }
interface PatchBody { name?: string; diagramData?: DiagramData }

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const rows = await sql`SELECT * FROM standalone_diagrams WHERE id = ${id}::uuid LIMIT 1`;
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[standalone-diagrams GET id]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const body = (await req.json()) as PatchBody;

    const bName = body.name ?? null;
    const bDiagram = 'diagramData' in body ? JSON.stringify(body.diagramData) : null;

    const rows = await sql`
      UPDATE standalone_diagrams SET
        name = COALESCE(${bName}, name),
        diagram_data = CASE WHEN ${bDiagram !== null} THEN ${bDiagram}::jsonb ELSE diagram_data END,
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[standalone-diagrams PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    await sql`DELETE FROM standalone_diagrams WHERE id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[standalone-diagrams DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
