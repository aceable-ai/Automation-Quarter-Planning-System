import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { dashboardOverrides } from '@/db/schema';

const ROW_ID = 1;

export async function GET() {
  const rows = await db
    .select()
    .from(dashboardOverrides)
    .where(eq(dashboardOverrides.id, ROW_ID))
    .limit(1);

  const row = rows[0] ?? { names: {}, quarters: {}, colors: {}, impacts: {} };
  return NextResponse.json(row);
}

export async function POST(req: Request) {
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
}
