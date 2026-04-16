import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

// GET: List all feedback items, optionally filtered
export async function GET(req: Request) {
  try {
    const sql = getClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let rows;
    if (status) {
      rows = await sql`
        SELECT * FROM feedback_inbox
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM feedback_inbox
        ORDER BY created_at DESC
      `;
    }
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[feedback-inbox GET]', err);
    return NextResponse.json([]);
  }
}

// POST: Ingest feedback from any external tool
// This endpoint can be called by other tools to submit feedback directly to AQPS
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
  try {
    const sql = getClient();
    const body = (await req.json()) as FeedbackBody;
    const { source, sourceId, projectId, category, author, title, body: feedbackBody } = body;

    if (!source || !title) {
      return NextResponse.json({ error: 'source and title are required' }, { status: 400 });
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
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[feedback-inbox POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
