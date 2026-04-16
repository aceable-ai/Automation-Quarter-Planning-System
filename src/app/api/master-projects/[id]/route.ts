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
      SELECT id, name, description, repo_url, stack, status, launched_at, users, color, phases, created_at, updated_at
      FROM master_projects
      WHERE id = ${id}
      LIMIT 1
    `;
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[master-projects GET id]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;

    const bName = 'name' in body ? body['name'] as string : null;
    const bDesc = 'description' in body ? body['description'] as string : null;
    const bRepoUrl = 'repoUrl' in body ? body['repoUrl'] as string | null : undefined;
    const bStack = 'stack' in body ? body['stack'] as string | null : undefined;
    const bStatus = 'status' in body ? body['status'] as string : null;
    const bLaunchedAt = 'launchedAt' in body ? body['launchedAt'] as string | null : undefined;
    const bUsers = 'users' in body ? body['users'] as string | null : undefined;
    const bColor = 'color' in body ? body['color'] as string : null;
    const bPhases = 'phases' in body ? JSON.stringify(body['phases']) : null;

    const rows = await sql`
      UPDATE master_projects SET
        name = COALESCE(${bName}, name),
        description = COALESCE(${bDesc}, description),
        repo_url = CASE WHEN ${'repoUrl' in body} THEN ${bRepoUrl ?? null} ELSE repo_url END,
        stack = CASE WHEN ${'stack' in body} THEN ${bStack ?? null} ELSE stack END,
        status = COALESCE(${bStatus}, status),
        launched_at = CASE WHEN ${'launchedAt' in body} THEN ${bLaunchedAt ?? null}::date ELSE launched_at END,
        users = CASE WHEN ${'users' in body} THEN ${bUsers ?? null} ELSE users END,
        color = COALESCE(${bColor}, color),
        phases = CASE WHEN ${bPhases !== null} THEN ${bPhases}::jsonb ELSE phases END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[master-projects PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    await sql`DELETE FROM master_projects WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[master-projects DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
