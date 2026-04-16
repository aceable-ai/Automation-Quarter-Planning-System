import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

const EFFORT_MAP: Record<string, number> = { XS: 0.5, S: 1, M: 2, L: 4, XL: 6 };

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    const body = await req.json() as Record<string, unknown>;

    // If scoring fields changed, recompute impact + priority
    const scoringFields = ['businessValue', 'reach', 'urgency', 'effort'];
    const needsRecompute = scoringFields.some(f => f in body);

    if (needsRecompute) {
      const current = await sql`SELECT * FROM backlog_items WHERE id = ${id} LIMIT 1`;
      if (!current[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const bv = (body['businessValue'] ?? current[0]['business_value']) as number;
      const reach = (body['reach'] ?? current[0]['reach']) as number;
      const urgency = (body['urgency'] ?? current[0]['urgency']) as number;
      const effort = (body['effort'] ?? current[0]['effort']) as string;
      const ew = (EFFORT_MAP as Record<string, number | undefined>)[effort] ?? 2;
      const impact = Math.round(((bv + reach + urgency) / 3) * 10) / 10;
      const priority = Math.round((impact / ew) * 100) / 100;

      body['impact'] = String(impact);
      body['priority'] = String(priority);
      body['effortWeeks'] = String(ew);
    }

    // Build individual field updates
    const bTitle = 'title' in body ? body['title'] as string : undefined;
    const bDesc = 'description' in body ? body['description'] as string : undefined;
    const bBv = 'businessValue' in body ? body['businessValue'] as number : undefined;
    const bReach = 'reach' in body ? body['reach'] as number : undefined;
    const bUrgency = 'urgency' in body ? body['urgency'] as number : undefined;
    const bImpact = 'impact' in body ? body['impact'] as string : undefined;
    const bEffort = 'effort' in body ? body['effort'] as string : undefined;
    const bEw = 'effortWeeks' in body ? body['effortWeeks'] as string : undefined;
    const bPriority = 'priority' in body ? body['priority'] as string : undefined;
    const bStatus = 'status' in body ? body['status'] as string : undefined;
    const bCycleId = 'cycleId' in body ? (body['cycleId'] as string | null) : undefined;
    const bNotes = 'notes' in body ? body['notes'] as string : undefined;

    const rows = await sql`
      UPDATE backlog_items SET
        title = COALESCE(${bTitle ?? null}, title),
        description = CASE WHEN ${bDesc !== undefined} THEN ${bDesc ?? null} ELSE description END,
        business_value = COALESCE(${bBv ?? null}, business_value),
        reach = COALESCE(${bReach ?? null}, reach),
        urgency = COALESCE(${bUrgency ?? null}, urgency),
        impact = COALESCE(${bImpact ?? null}, impact),
        effort = COALESCE(${bEffort ?? null}, effort),
        effort_weeks = COALESCE(${bEw ?? null}, effort_weeks),
        priority = COALESCE(${bPriority ?? null}, priority),
        status = COALESCE(${bStatus ?? null}, status),
        cycle_id = CASE WHEN ${'cycleId' in body} THEN ${bCycleId ?? null} ELSE cycle_id END,
        notes = CASE WHEN ${bNotes !== undefined} THEN ${bNotes ?? null} ELSE notes END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[backlog PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id } = await params;
    await sql`DELETE FROM backlog_items WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[backlog DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
