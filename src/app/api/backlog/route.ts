import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export async function GET(req: Request) {
  try {
    const sql = getClient();
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project');
    const status = searchParams.get('status');

    let rows;
    if (project && status) {
      rows = await sql`
        SELECT * FROM backlog_items
        WHERE project_id = ${project} AND status = ${status}
        ORDER BY priority::numeric DESC
      `;
    } else if (project) {
      rows = await sql`
        SELECT * FROM backlog_items
        WHERE project_id = ${project}
        ORDER BY priority::numeric DESC
      `;
    } else if (status) {
      rows = await sql`
        SELECT * FROM backlog_items
        WHERE status = ${status}
        ORDER BY priority::numeric DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM backlog_items
        ORDER BY priority::numeric DESC
      `;
    }

    return NextResponse.json(rows);
  } catch (err) {
    console.error('[backlog GET]', err);
    return NextResponse.json([]);
  }
}

function computeScores(bv: number, reach: number, urgency: number, effortWeeks: number) {
  const impact = Math.round(((bv + reach + urgency) / 3) * 10) / 10;
  const priority = Math.round((impact / effortWeeks) * 100) / 100;
  return { impact: String(impact), priority: String(priority) };
}

const EFFORT_MAP: Record<string, number> = { XS: 0.5, S: 1, M: 2, L: 4, XL: 6 };

interface BacklogBody {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  businessValue?: number;
  reach?: number;
  urgency?: number;
  effort?: string;
  status?: string;
  cycleId?: string | null;
  notes?: string | null;
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const body = (await req.json()) as BacklogBody;
    const { id, projectId, title, description, businessValue, reach, urgency, effort, status, cycleId, notes } = body;

    const bv = businessValue ?? 3;
    const r = reach ?? 3;
    const u = urgency ?? 3;
    const eff = effort ?? 'M';
    const ew = (EFFORT_MAP as Record<string, number | undefined>)[eff] ?? 2;
    const { impact, priority } = computeScores(bv, r, u, ew);

    const rows = await sql`
      INSERT INTO backlog_items (id, project_id, title, description, business_value, reach, urgency, impact, effort, effort_weeks, priority, status, cycle_id, notes)
      VALUES (${id}, ${projectId}, ${title}, ${description ?? null}, ${bv}, ${r}, ${u}, ${impact}, ${eff}, ${String(ew)}, ${priority}, ${status ?? 'backlog'}, ${cycleId ?? null}, ${notes ?? null})
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[backlog POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
