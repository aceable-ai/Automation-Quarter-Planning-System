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
      SELECT id, project_name, author, content, vetted, created_at
      FROM project_comments
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[comments GET]', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const sql = getClient();
    const { projectName, author, content } = (await req.json()) as {
      projectName: string; author: string; content: string;
    };
    const rows = await sql`
      INSERT INTO project_comments (project_name, author, content)
      VALUES (${projectName}, ${author}, ${content})
      RETURNING id, project_name, author, content, vetted, created_at
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[comments POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
