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
      SELECT names, quarters, colors, impacts
      FROM dashboard_overrides
      WHERE id = 1
      LIMIT 1
    `;
    const row = rows[0] ?? { names: {}, quarters: {}, colors: {}, impacts: {} };
    return NextResponse.json(row);
  } catch (err) {
    console.error('[overrides GET]', err);
    return NextResponse.json({ names: {}, quarters: {}, colors: {}, impacts: {} });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const { names, quarters, colors, impacts } = (await req.json()) as {
      names: Record<string, string>;
      quarters: Record<string, string>;
      colors: Record<string, string>;
      impacts: Record<string, string>;
    };

    const n = JSON.stringify(names);
    const q = JSON.stringify(quarters);
    const c = JSON.stringify(colors);
    const i = JSON.stringify(impacts);

    await sql`
      INSERT INTO dashboard_overrides (id, names, quarters, colors, impacts)
      VALUES (1, ${n}::jsonb, ${q}::jsonb, ${c}::jsonb, ${i}::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        names    = EXCLUDED.names,
        quarters = EXCLUDED.quarters,
        colors   = EXCLUDED.colors,
        impacts  = EXCLUDED.impacts
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[overrides POST]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
