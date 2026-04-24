import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { requireIngestSecret } from '@/lib/ingest-auth';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

// GET: List feedback items, optionally filtered by status, source (exact), or sourcePrefix.
// Open read (UI-gated). External services can pass ?sourcePrefix=aceiq- to scope their view.
export async function GET(req: Request) {
  try {
    const sql = getClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const sourcePrefix = searchParams.get('sourcePrefix');

    const conditions: string[] = [];
    const values: unknown[] = [];
    if (status) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }
    if (source) {
      values.push(source);
      conditions.push(`source = $${values.length}`);
    }
    if (sourcePrefix) {
      values.push(sourcePrefix + '%');
      conditions.push(`source LIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM feedback_inbox ${whereClause} ORDER BY created_at DESC`;
    const rows = await sql.query(query, values);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[feedback-inbox GET]', err);
    return NextResponse.json([]);
  }
}

// POST: Ingest feedback from any external tool. Requires x-aqps-ingest-secret header.
interface FeedbackBody {
  source: string;
  sourceId?: string | null;
  projectId?: string | null;
  category?: string;
  author?: string;
  title: string;
  body?: string | null;
}

export async function POST(req: Request) {
  const authFail = requireIngestSecret(req);
  if (authFail) return authFail;

  try {
    const sql = getClient();
    const body = (await req.json()) as FeedbackBody;
    const { source, sourceId, projectId, category, author, title, body: feedbackBody } = body;

    if (!source || !title) {
      return NextResponse.json({ error: 'source and title are required' }, { status: 400 });
    }

    // Idempotent on (source, sourceId) — used by backfill scripts so re-runs don't duplicate.
    if (sourceId) {
      const existing = await sql`
        SELECT * FROM feedback_inbox
        WHERE source = ${source} AND source_id = ${sourceId}
        LIMIT 1
      `;
      if (existing[0]) return NextResponse.json(existing[0]);
    }

    const rows = await sql`
      INSERT INTO feedback_inbox (source, source_id, project_id, category, author, title, body)
      VALUES (
        ${source},
        ${sourceId ?? null},
        ${projectId ?? null},
        ${category ?? 'feature-request'},
        ${author ?? 'Anonymous'},
        ${title},
        ${feedbackBody ?? null}
      )
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('[feedback-inbox POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
