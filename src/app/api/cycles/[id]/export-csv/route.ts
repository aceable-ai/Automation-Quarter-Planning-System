import { neon } from '@neondatabase/serverless';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface Row {
  id: string;
  project_id: string;
  project_name: string | null;
  title: string;
  description: string | null;
  status: string;
  business_value: number;
  reach: number;
  urgency: number;
  impact: string;
  effort: string;
  effort_weeks: string;
  priority: string;
  jira_key: string | null;
  notes: string | null;
}

interface CycleRow {
  id: string;
  name: string;
}

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'number' ? String(v) : v;
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id: cycleId } = await ctx.params;

    const cycleRows = (await sql`SELECT id, name FROM cycles WHERE id = ${cycleId}`) as CycleRow[];
    if (cycleRows.length === 0) {
      return new Response('Cycle not found', { status: 404 });
    }
    const cycleName = cycleRows[0]!.name;

    const rows = (await sql`
      SELECT b.id, b.project_id, m.name AS project_name, b.title, b.description, b.status,
             b.business_value, b.reach, b.urgency, b.impact, b.effort, b.effort_weeks,
             b.priority, b.jira_key, b.notes
      FROM backlog_items b
      LEFT JOIN master_projects m ON m.id = b.project_id
      WHERE b.cycle_id = ${cycleId}
      ORDER BY b.priority::numeric DESC
    `) as Row[];

    const headers = [
      'ID', 'Project', 'Title', 'Description', 'Status',
      'BV', 'Reach', 'Urgency', 'Impact', 'Effort', 'Effort Weeks', 'Priority',
      'Jira', 'Notes',
    ];
    const csvLines = [
      headers.join(','),
      ...rows.map(r =>
        [
          r.id,
          r.project_name ?? r.project_id,
          r.title,
          r.description ?? '',
          r.status,
          r.business_value,
          r.reach,
          r.urgency,
          r.impact,
          r.effort,
          r.effort_weeks,
          r.priority,
          r.jira_key ?? '',
          r.notes ?? '',
        ].map(csvEscape).join(','),
      ),
    ];
    const csv = csvLines.join('\n');
    const safeName = cycleName.replace(/[^a-zA-Z0-9-]/g, '_');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="cycle-${safeName}-committed.csv"`,
      },
    });
  } catch (err) {
    console.error('[cycle export-csv]', err);
    return new Response(`Export failed: ${String(err)}`, { status: 500 });
  }
}
