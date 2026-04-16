import { NextResponse } from 'next/server';

interface PushBody {
  type: 'epic' | 'task';
  backlogItemId: string;
  taskId?: string;
  title: string;
  description?: string;
  projectKey?: string;
  parentJiraKey?: string;
}

// Jira Cloud REST API v3
const JIRA_BASE = 'https://aceable.atlassian.net';

function getAuth() {
  const email = process.env['JIRA_EMAIL'];
  const token = process.env['JIRA_API_TOKEN'];
  if (!email || !token) return null;
  return 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
}

async function createJiraIssue(
  auth: string,
  projectKey: string,
  issueType: string,
  summary: string,
  description: string | undefined,
  parentKey: string | undefined,
) {
  const fields: Record<string, unknown> = {
    project: { key: projectKey },
    issuetype: { name: issueType },
    summary,
  };

  if (description) {
    fields['description'] = {
      type: 'doc',
      version: 1,
      content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }],
    };
  }

  if (parentKey) {
    fields['parent'] = { key: parentKey };
  }

  const res = await fetch(`${JIRA_BASE}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Jira API ${res.status}: ${errText}`);
  }

  return (await res.json()) as { id: string; key: string; self: string };
}

export async function POST(req: Request) {
  try {
    const auth = getAuth();
    if (!auth) {
      return NextResponse.json(
        { error: 'Jira not configured. Set JIRA_EMAIL and JIRA_API_TOKEN environment variables.' },
        { status: 503 },
      );
    }

    const body = (await req.json()) as PushBody;
    const { type, backlogItemId, taskId, title, description, projectKey, parentJiraKey } = body;
    const project = projectKey ?? 'MAUT';

    if (type === 'epic') {
      // Create Epic in Jira
      const issue = await createJiraIssue(auth, project, 'Epic', title, description, undefined);

      // Update backlog item with Jira key
      const dbUrl = process.env['DATABASE_URL'];
      if (dbUrl) {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(dbUrl);
        await sql`UPDATE backlog_items SET jira_key = ${issue.key}, updated_at = NOW() WHERE id = ${backlogItemId}`;
      }

      return NextResponse.json({ ok: true, jiraKey: issue.key, jiraUrl: `${JIRA_BASE}/browse/${issue.key}` });
    }

    if (type as string === 'task') {
      if (!taskId) return NextResponse.json({ error: 'taskId required for task push' }, { status: 400 });

      // Create Task in Jira, optionally linked to parent epic
      const issue = await createJiraIssue(auth, project, 'Task', title, description, parentJiraKey);

      // Update task with Jira key
      const dbUrl = process.env['DATABASE_URL'];
      if (dbUrl) {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(dbUrl);
        await sql`UPDATE epic_tasks SET jira_key = ${issue.key}, updated_at = NOW() WHERE id = ${taskId}::uuid`;
      }

      return NextResponse.json({ ok: true, jiraKey: issue.key, jiraUrl: `${JIRA_BASE}/browse/${issue.key}` });
    }

    return NextResponse.json({ error: 'type must be epic or task' }, { status: 400 });
  } catch (err) {
    console.error('[jira push]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
