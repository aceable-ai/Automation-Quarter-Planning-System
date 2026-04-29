import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface CreditRow {
  id: string;
  author: string;
  title: string;
  created_at: string;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id: planId } = await ctx.params;
    const rows = (await sql`
      SELECT id, author, title, created_at
      FROM feedback_inbox
      WHERE project_id = ${planId} AND source = 'intake-form'
      ORDER BY created_at ASC
    `) as CreditRow[];
    return NextResponse.json({ credits: rows });
  } catch (err) {
    console.error('[credits GET]', err);
    return NextResponse.json({ credits: [] });
  }
}
