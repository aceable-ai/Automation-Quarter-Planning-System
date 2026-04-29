import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config({ path: '.env.development.local' });

const sql = neon(process.env.DATABASE_URL);

const subs = [
  { author: 'Marcela Reyes', title: 'Asset handoff between design and PMM is a black hole', body: 'Frequency: weekly. Designer drops files in random Drive folders, PMMs guess at the latest version.', projectId: 'aceable-ids' },
  { author: 'Ben Patel', title: 'Campaign approval emails get lost in the threads', body: 'Frequency: daily. Approval status never visible without asking the owner directly.', projectId: null },
  { author: 'Jordan Kim', title: 'No way to know which Iterable email is the latest version', body: 'Frequency: weekly. Multiple drafts sitting in Iterable with no canonical source.', projectId: 'aceable-ids' },
  { author: 'Sam Chen', title: 'Content team has no shared calendar of upcoming launches', body: 'Frequency: monthly. We find out about launches the day they go live.', projectId: 'gtm-system' },
  { author: 'Alex Rivera', title: 'Promo code performance reporting takes 3 hours every week', body: 'Frequency: weekly. Manual pull from Iterable + Shopify + spreadsheet reconciliation.', projectId: 'promo-hub' },
];

for (const s of subs) {
  await sql`
    INSERT INTO feedback_inbox (source, author, title, body, category, project_id, status, created_at)
    VALUES ('intake-form', ${s.author}, ${s.title}, ${s.body}, 'feature-request', ${s.projectId}, 'pending', NOW())
  `;
  console.log('seeded:', s.author);
}

const count = await sql`SELECT COUNT(*) as n FROM feedback_inbox WHERE source='intake-form'`;
console.log('total intake-form rows:', count[0].n);
