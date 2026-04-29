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
      SELECT inventory_name, master_plan_id, updated_at
      FROM inventory_links
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[inventory-links GET]', err);
    return NextResponse.json([]);
  }
}

interface UpsertBody {
  inventoryName: string;
  masterPlanId: string | null;
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const body = (await req.json()) as UpsertBody;
    const { inventoryName, masterPlanId } = body;

    if (!inventoryName) {
      return NextResponse.json({ error: 'inventoryName required' }, { status: 400 });
    }

    if (masterPlanId === null) {
      await sql`DELETE FROM inventory_links WHERE inventory_name = ${inventoryName}`;
      return NextResponse.json({ inventoryName, masterPlanId: null });
    }

    const rows = await sql`
      INSERT INTO inventory_links (inventory_name, master_plan_id, updated_at)
      VALUES (${inventoryName}, ${masterPlanId}, NOW())
      ON CONFLICT (inventory_name)
      DO UPDATE SET master_plan_id = EXCLUDED.master_plan_id, updated_at = NOW()
      RETURNING inventory_name, master_plan_id, updated_at
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[inventory-links POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

interface BulkBody {
  names: string[];
  masterPlanId: string | null;
}

export async function PUT(req: Request) {
  try {
    const sql = getClient();
    const body = (await req.json()) as BulkBody;
    const { names, masterPlanId } = body;

    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ error: 'names array required' }, { status: 400 });
    }

    if (masterPlanId === null) {
      await sql`DELETE FROM inventory_links WHERE inventory_name = ANY(${names})`;
      return NextResponse.json({ updated: names.length });
    }

    for (const name of names) {
      await sql`
        INSERT INTO inventory_links (inventory_name, master_plan_id, updated_at)
        VALUES (${name}, ${masterPlanId}, NOW())
        ON CONFLICT (inventory_name)
        DO UPDATE SET master_plan_id = EXCLUDED.master_plan_id, updated_at = NOW()
      `;
    }
    return NextResponse.json({ updated: names.length });
  } catch (err) {
    console.error('[inventory-links PUT bulk]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
