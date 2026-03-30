import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { dashboardOverrides } from '@/db/schema';

const ROW_ID = 1;

function getDb() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return drizzle(neon(url));
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(dashboardOverrides)
      .where(eq(dashboardOverrides.id, ROW_ID))
      .limit(1);

    const row = rows[0] ?? { names: {}, quarters: {}, colors: {}, impacts: {} };
    return NextResponse.json(row);
  } catch (err) {
    console.error('[overrides GET]', err);
    return NextResponse.json({ names: {}, quarters: {}, colors: {}, impacts: {} });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = (await req.json()) as {
      names?: Record<string, string>;
      quarters?: Record<string, string>;
      colors?: Record<string, string>;
      impacts?: Record<string, string>;
    };

    await db
      .insert(dashboardOverrides)
      .values({ id: ROW_ID, ...body })
      .onConflictDoUpdate({
        target: dashboardOverrides.id,
        set: body,
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[overrides POST]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
