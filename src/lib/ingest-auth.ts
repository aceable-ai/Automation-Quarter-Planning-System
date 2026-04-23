import { NextResponse } from 'next/server';

// Authorizes write requests to the feedback-inbox API.
// - Same-origin browser calls (from the AQPS UI itself) are allowed without a secret.
// - Cross-origin calls (other internal services) must send x-aqps-ingest-secret matching env.
export function requireIngestSecret(req: Request): NextResponse | null {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return null;
    } catch {
      // fall through to secret check
    }
  }

  // Server-to-server calls typically have no Origin header. Require the secret.
  const expected = process.env['AQPS_INGEST_SECRET'];
  if (!expected) {
    return NextResponse.json(
      { error: 'AQPS_INGEST_SECRET not configured on server' },
      { status: 500 },
    );
  }
  const provided = req.headers.get('x-aqps-ingest-secret');
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
