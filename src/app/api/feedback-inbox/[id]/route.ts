import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { requireIngestSecret } from '@/lib/ingest-auth';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

// PATCH: Update feedback status (approve/decline) or link to backlog item.
// Requires x-aqps-ingest-secret for external callers; AQPS UI also sends the secret server-side.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authFail = requireIngestSecret(req);
  if (authFail) return authFail;

  try {
    const sql = getClient();
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;

    const bStatus = 'status' in body ? body['status'] as string : null;
    const bBacklogItemId = 'backlogItemId' in body ? body['backlogItemId'] as string | null : undefined;
    const bProjectId = 'projectId' in body ? body['projectId'] as string | null : undefined;

    const rows = await sql`
      UPDATE feedback_inbox SET
        status = COALESCE(${bStatus}, status),
        backlog_item_id = CASE WHEN ${'backlogItemId' in body} THEN ${bBacklogItemId ?? null} ELSE backlog_item_id END,
        project_id = CASE WHEN ${'projectId' in body} THEN ${bProjectId ?? null} ELSE project_id END
      WHERE id = ${id}::uuid
      RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[feedback-inbox PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authFail = requireIngestSecret(req);
  if (authFail) return authFail;

  try {
    const sql = getClient();
    const { id } = await params;
    await sql`DELETE FROM feedback_inbox WHERE id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[feedback-inbox DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
