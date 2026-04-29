import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { buildSongPrompt, getMusicProvider } from '@/lib/music-provider';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface FeedbackRow {
  id: string;
  author: string;
  title: string;
  body: string | null;
}

interface CycleRow {
  id: string;
  start_date: string;
  end_date: string;
}

interface ExistingDrawingRow {
  id: string;
  cycle_id: string;
  winner_submission_id: string | null;
  winner_name: string;
  song_url: string | null;
  song_generated_at: string | null;
  drawn_at: string;
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id: cycleId } = await ctx.params;

    const existing = (await sql`
      SELECT id, cycle_id, winner_submission_id, winner_name, song_url, song_generated_at, drawn_at
      FROM song_drawings
      WHERE cycle_id = ${cycleId}
      ORDER BY drawn_at DESC
      LIMIT 1
    `) as ExistingDrawingRow[];
    if (existing.length > 0) {
      return NextResponse.json({ drawing: existing[0], alreadyDrawn: true });
    }

    const cycleRows = (await sql`
      SELECT id, start_date, end_date FROM cycles WHERE id = ${cycleId}
    `) as CycleRow[];
    if (cycleRows.length === 0) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }
    const cycle = cycleRows[0]!;

    const entries = (await sql`
      SELECT id, author, title, body
      FROM feedback_inbox
      WHERE source = 'intake-form'
        AND created_at >= ${cycle.start_date}
        AND created_at <= ${cycle.end_date}::date + INTERVAL '1 day'
    `) as FeedbackRow[];

    if (entries.length === 0) {
      return NextResponse.json({ error: 'No drawing entries for this cycle' }, { status: 400 });
    }

    const winner = entries[Math.floor(Math.random() * entries.length)]!;

    const provider = getMusicProvider();
    const prompt = buildSongPrompt({
      submitterName: winner.author,
      problemTitle: winner.title,
      problemBody: winner.body,
      frequency: null,
    });
    const songUrl = await provider.generateSong({ prompt, submissionId: winner.id });

    const drawingId = randomUUID();
    const inserted = (await sql`
      INSERT INTO song_drawings (id, cycle_id, winner_submission_id, winner_name, song_url, song_generated_at)
      VALUES (${drawingId}, ${cycleId}, ${winner.id}, ${winner.author}, ${songUrl}, NOW())
      RETURNING id, cycle_id, winner_submission_id, winner_name, song_url, song_generated_at, drawn_at
    `) as ExistingDrawingRow[];

    return NextResponse.json({
      drawing: inserted[0],
      alreadyDrawn: false,
      poolSize: entries.length,
    });
  } catch (err) {
    console.error('[draw-winner]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id: cycleId } = await ctx.params;
    const rows = (await sql`
      SELECT id, cycle_id, winner_submission_id, winner_name, song_url, song_generated_at, drawn_at
      FROM song_drawings
      WHERE cycle_id = ${cycleId}
      ORDER BY drawn_at DESC
      LIMIT 1
    `) as ExistingDrawingRow[];
    return NextResponse.json({ drawing: rows[0] ?? null });
  } catch (err) {
    console.error('[draw-winner GET]', err);
    return NextResponse.json({ drawing: null });
  }
}
