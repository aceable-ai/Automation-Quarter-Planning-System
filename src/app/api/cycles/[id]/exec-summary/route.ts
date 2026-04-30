import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

function getClient() {
  const url = process.env['DATABASE_URL'];
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

interface ItemRow {
  id: string;
  project_id: string;
  project_name: string | null;
  title: string;
  description: string | null;
  status: string;
  effort: string;
  effort_weeks: string;
  notes: string | null;
}

interface CycleRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  goal: string | null;
  budget_weeks: string;
  status: string;
}

const SYSTEM_PROMPT = `You write executive-friendly cycle summaries for marketing-team leadership.

Your audience: a CMO or VP of Marketing. They want to understand WHAT the team is shipping and WHY it matters, not the engineering details.

Format requirements:
- Start with a 2-3 sentence TL;DR paragraph at the top
- Group the work into THEMES within each PROJECT (2-4 themes per project max)
- Each theme has a name (3-6 words) and a 1-2 sentence description in plain English
- Under each theme, list the items as concise bullets
- Tone: confident, business-outcome oriented, not jargony
- Avoid: technical implementation details, code/repo references, internal IDs
- Use markdown headers and bullets

Goal of the summary: an exec should read it in 60 seconds and walk away knowing what's shipping and why it's worth their team's time.`;

function formatUserPrompt(cycle: CycleRow, items: ItemRow[]): string {
  const grouped: Record<string, ItemRow[]> = {};
  for (const item of items) {
    const key = item.project_name ?? item.project_id;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
  const projectBlocks = Object.entries(grouped)
    .map(([projectName, projectItems]) => {
      const lines = projectItems.map(i => {
        const noteSnippet = i.notes ? ` — note: ${i.notes.slice(0, 200)}` : '';
        const descSnippet = i.description ? ` — ${i.description.slice(0, 200)}` : '';
        return `  - [${i.status}] ${i.title} (${i.effort}, ${i.effort_weeks}w)${descSnippet}${noteSnippet}`;
      });
      return `### Project: ${projectName}\n${lines.join('\n')}`;
    })
    .join('\n\n');

  return [
    `Cycle: ${cycle.name}`,
    `Window: ${cycle.start_date} → ${cycle.end_date}`,
    `Budget: ${cycle.budget_weeks} effort-weeks`,
    cycle.goal ? `Cycle goal: ${cycle.goal}` : null,
    cycle.status ? `Status: ${cycle.status}` : null,
    '',
    'Committed items, grouped by project:',
    '',
    projectBlocks,
    '',
    'Now write the exec summary per the format requirements.',
  ].filter(Boolean).join('\n');
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const sql = getClient();
    const { id: cycleId } = await ctx.params;

    const cycleRows = (await sql`
      SELECT id, name, start_date, end_date, goal, budget_weeks, status
      FROM cycles WHERE id = ${cycleId}
    `) as CycleRow[];
    if (cycleRows.length === 0) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }
    const cycle = cycleRows[0]!;

    const items = (await sql`
      SELECT b.id, b.project_id, m.name AS project_name, b.title, b.description, b.status,
             b.effort, b.effort_weeks, b.notes
      FROM backlog_items b
      LEFT JOIN master_projects m ON m.id = b.project_id
      WHERE b.cycle_id = ${cycleId}
      ORDER BY m.name, b.priority::numeric DESC
    `) as ItemRow[];

    if (items.length === 0) {
      return NextResponse.json({ error: 'No committed items in this cycle yet' }, { status: 400 });
    }

    const userPrompt = formatUserPrompt(cycle, items);

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      temperature: 0.6,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    return NextResponse.json({ summary: text, item_count: items.length });
  } catch (err) {
    console.error('[exec-summary]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
