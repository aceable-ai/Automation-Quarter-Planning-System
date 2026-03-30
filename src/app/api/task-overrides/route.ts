import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

type TaskItem = { n: string; s: number; j?: string; f?: string };

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export async function GET() {
  try {
    const sql = getClient();
    const rows = await sql`SELECT task_overrides FROM dashboard_overrides WHERE id = 1 LIMIT 1`;
    const taskOverrides = (rows[0]?.['task_overrides'] as Record<string, TaskItem[]> | null) ?? {};
    return NextResponse.json({ taskOverrides });
  } catch (err) {
    console.error('[task-overrides GET]', err);
    return NextResponse.json({ taskOverrides: {} });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const { taskOverrides } = (await req.json()) as { taskOverrides: Record<string, TaskItem[]> };
    const val = JSON.stringify(taskOverrides);
    await sql`
      INSERT INTO dashboard_overrides (id, task_overrides)
      VALUES (1, ${val}::jsonb)
      ON CONFLICT (id) DO UPDATE SET task_overrides = EXCLUDED.task_overrides
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[task-overrides POST]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
