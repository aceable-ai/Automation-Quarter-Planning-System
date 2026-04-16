import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface TaskBody {
  backlogItemId: string;
  title: string;
  status?: string;
  assignee?: string;
  sortOrder?: number;
}

export async function GET(req: Request) {
  try {
    const sql = getClient();
    const { searchParams } = new URL(req.url);
    const backlogItemId = searchParams.get('backlogItemId');

    let rows;
    if (backlogItemId) {
      rows = await sql`
        SELECT * FROM epic_tasks
        WHERE backlog_item_id = ${backlogItemId}
        ORDER BY sort_order ASC, created_at ASC
      `;
    } else {
      rows = await sql`
        SELECT * FROM epic_tasks
        ORDER BY sort_order ASC, created_at ASC
      `;
    }
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[tasks GET]', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const body = (await req.json()) as TaskBody;
    const { backlogItemId, title, status, assignee, sortOrder } = body;

    const rows = await sql`
      INSERT INTO epic_tasks (backlog_item_id, title, status, assignee, sort_order)
      VALUES (${backlogItemId}, ${title}, ${status ?? 'todo'}, ${assignee ?? null}, ${sortOrder ?? 0})
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[tasks POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
