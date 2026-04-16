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
    const rows = await sql`SELECT * FROM cycles WHERE id = ${id} LIMIT 1`;
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[cycles GET id]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;

    const bName = 'name' in body ? body['name'] as string : null;
    const bStartDate = 'startDate' in body ? body['startDate'] as string : null;
    const bEndDate = 'endDate' in body ? body['endDate'] as string : null;
    const bGoal = 'goal' in body ? body['goal'] as string | null : undefined;
    const bBudget = 'budgetWeeks' in body ? body['budgetWeeks'] as string : null;
    const bStatus = 'status' in body ? body['status'] as string : null;
    const bRetroShipped = 'retroShipped' in body ? body['retroShipped'] as string | null : undefined;
    const bRetroMissed = 'retroMissed' in body ? body['retroMissed'] as string | null : undefined;
    const bRetroLearnings = 'retroLearnings' in body ? body['retroLearnings'] as string | null : undefined;

    const rows = await sql`
      UPDATE cycles SET
        name = COALESCE(${bName}, name),
        start_date = COALESCE(${bStartDate}::date, start_date),
        end_date = COALESCE(${bEndDate}::date, end_date),
        goal = CASE WHEN ${'goal' in body} THEN ${bGoal ?? null} ELSE goal END,
        budget_weeks = COALESCE(${bBudget}, budget_weeks),
        status = COALESCE(${bStatus}, status),
        retro_shipped = CASE WHEN ${'retroShipped' in body} THEN ${bRetroShipped ?? null} ELSE retro_shipped END,
        retro_missed = CASE WHEN ${'retroMissed' in body} THEN ${bRetroMissed ?? null} ELSE retro_missed END,
        retro_learnings = CASE WHEN ${'retroLearnings' in body} THEN ${bRetroLearnings ?? null} ELSE retro_learnings END
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[cycles PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
