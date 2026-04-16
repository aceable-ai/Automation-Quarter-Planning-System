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
      SELECT id, name, description, repo_url, stack, status, launched_at, users, color, phases, created_at, updated_at
      FROM master_projects
      ORDER BY name ASC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[master-projects GET]', err);
    return NextResponse.json([]);
  }
}

interface MasterProjectBody {
  id: string;
  name: string;
  description?: string;
  repoUrl?: string | null;
  stack?: string | null;
  status?: string;
  launchedAt?: string | null;
  users?: string | null;
  color?: string;
  phases?: { name: string; description: string; status: string }[];
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const body = (await req.json()) as MasterProjectBody;
    const { id, name, description, repoUrl, stack, status, launchedAt, users, color, phases } = body;
    const phasesJson = JSON.stringify(phases ?? []);
    const rows = await sql`
      INSERT INTO master_projects (id, name, description, repo_url, stack, status, launched_at, users, color, phases)
      VALUES (${id}, ${name}, ${description ?? ''}, ${repoUrl ?? null}, ${stack ?? null}, ${status ?? 'active'}, ${launchedAt ?? null}, ${users ?? null}, ${color ?? '#6366f1'}, ${phasesJson}::jsonb)
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[master-projects POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
