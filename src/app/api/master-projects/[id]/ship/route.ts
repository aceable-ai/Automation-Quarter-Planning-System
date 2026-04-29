import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { getImageProvider } from '@/lib/image-provider';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface MasterProjectRow {
  id: string;
  name: string;
  shipped_at: string | null;
  celebration_image_url: string | null;
  ship_announcement_draft: string | null;
}

interface SubmitterRow {
  author: string;
}

function buildAnnouncement(args: { planTitle: string; submitterNames: string[]; problemSummary: string }): string {
  const credits = args.submitterNames.length > 0 ? args.submitterNames.join(', ') : 'the team';
  return [
    `🚀 SHIPPED: ${args.planTitle}`,
    '',
    `Months ago, ${credits} dropped a problem in the form: "${args.problemSummary}"`,
    '',
    "Today, it's live.",
    '',
    '[Add a 1-line description of what shipped]',
    '',
    `🎁 ${credits} — your celebration card is attached. Print it. Frame it. Tape it to your monitor. You earned it.`,
    '',
    'Thanks for naming the problem out loud. Got another one? → /master-plans/submit',
  ].join('\n');
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id: planId } = await ctx.params;

    const planRows = (await sql`
      SELECT id, name, shipped_at, celebration_image_url, ship_announcement_draft
      FROM master_projects
      WHERE id = ${planId}
    `) as MasterProjectRow[];
    if (planRows.length === 0) {
      return NextResponse.json({ error: 'Master plan not found' }, { status: 404 });
    }
    const plan = planRows[0]!;

    if (plan.shipped_at) {
      return NextResponse.json({ plan, alreadyShipped: true });
    }

    const submitterRows = (await sql`
      SELECT DISTINCT author
      FROM feedback_inbox
      WHERE project_id = ${planId} AND source = 'intake-form'
      ORDER BY author
    `) as SubmitterRow[];
    const submitterNames = submitterRows.map(r => r.author);

    const firstProblem = (await sql`
      SELECT title FROM feedback_inbox
      WHERE project_id = ${planId} AND source = 'intake-form'
      ORDER BY created_at ASC
      LIMIT 1
    `) as { title: string }[];
    const problemSummary = firstProblem[0]?.title ?? plan.name;

    const provider = getImageProvider();
    const imageUrl = await provider.generateCelebrationImage({
      masterPlanId: planId,
      planTitle: plan.name,
      submitterNames,
    });

    const announcement = buildAnnouncement({
      planTitle: plan.name,
      submitterNames,
      problemSummary,
    });

    const updated = (await sql`
      UPDATE master_projects
      SET shipped_at = NOW(),
          celebration_image_url = ${imageUrl},
          celebration_image_generated_at = NOW(),
          ship_announcement_draft = ${announcement},
          updated_at = NOW()
      WHERE id = ${planId}
      RETURNING id, name, shipped_at, celebration_image_url, ship_announcement_draft
    `) as MasterProjectRow[];

    return NextResponse.json({ plan: updated[0], alreadyShipped: false, submitterNames });
  } catch (err) {
    console.error('[ship POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
