import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface TaskPatch {
  title?: string;
  status?: string;
  assignee?: string | null;
  jiraKey?: string | null;
  sortOrder?: number;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const body = (await req.json()) as TaskPatch;

    const bTitle = body.title ?? null;
    const bStatus = body.status ?? null;
    const bAssignee = 'assignee' in body ? (body.assignee ?? null) : undefined;
    const bJiraKey = 'jiraKey' in body ? (body.jiraKey ?? null) : undefined;
    const bSortOrder = body.sortOrder ?? null;

    const rows = await sql`
      UPDATE epic_tasks SET
        title = COALESCE(${bTitle}, title),
        status = COALESCE(${bStatus}, status),
        assignee = CASE WHEN ${'assignee' in body} THEN ${bAssignee ?? null} ELSE assignee END,
        jira_key = CASE WHEN ${'jiraKey' in body} THEN ${bJiraKey ?? null} ELSE jira_key END,
        sort_order = COALESCE(${bSortOrder}, sort_order),
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[tasks PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    await sql`DELETE FROM epic_tasks WHERE id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[tasks DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
