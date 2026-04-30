const BASE_URL = 'https://platform.higgsfield.ai';

function authHeader(): string {
  const key = process.env['HIGGSFIELD_API_KEY'] ?? '';
  const secret = process.env['HIGGSFIELD_API_SECRET'] ?? '';
  return `Key ${key}:${secret}`;
}

const ASPECT_RATIOS: Record<string, string> = {
  '1080x1080': '1:1',
  '1080x1920': '9:16',
  '1080x1350': '4:5',
  '1200x628': '16:9',
};

interface HiggsfieldJobResponse {
  request_id: string;
  status_url?: string;
  cancel_url?: string;
}

interface HiggsfieldStatusResponse {
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'nsfw';
  images?: ({ url?: string } | string)[];
}

export async function submitImageJob(
  prompt: string,
  imageSize = '1080x1080',
  model = 'higgsfield-ai/soul/standard',
): Promise<{ requestId: string }> {
  const key = process.env['HIGGSFIELD_API_KEY'];
  const secret = process.env['HIGGSFIELD_API_SECRET'];
  if (!key || !secret) {
    throw new Error('HIGGSFIELD_API_KEY and HIGGSFIELD_API_SECRET not configured');
  }
  const aspectRatio = ASPECT_RATIOS[imageSize] ?? '1:1';
  const res = await fetch(`${BASE_URL}/${model}`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspect_ratio: aspectRatio, resolution: '1080p' }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Higgsfield API ${res.status}: ${body}`);
  }
  const data = (await res.json()) as HiggsfieldJobResponse;
  return { requestId: data.request_id };
}

export async function checkJobStatus(requestId: string): Promise<{
  status: HiggsfieldStatusResponse['status'];
  images: string[];
}> {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/status`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error(`Higgsfield status check failed: ${res.status}`);
  const data = (await res.json()) as HiggsfieldStatusResponse;
  const images = (data.images ?? []).map(img => (typeof img === 'string' ? img : (img.url ?? '')));
  return { status: data.status, images: images.filter(u => u.length > 0) };
}

export async function generateImage(
  prompt: string,
  imageSize = '1080x1080',
  maxWaitMs = 120_000,
): Promise<string> {
  const job = await submitImageJob(prompt, imageSize);
  const start = Date.now();
  const pollInterval = 3000;
  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, pollInterval));
    const result = await checkJobStatus(job.requestId);
    if (result.status === 'completed' && result.images.length > 0) {
      return result.images[0]!;
    }
    if (result.status === 'failed') throw new Error('Higgsfield image generation failed');
    if (result.status === 'nsfw') throw new Error('Higgsfield flagged the prompt as NSFW');
  }
  throw new Error(`Higgsfield generation timed out after ${maxWaitMs / 1000}s (${job.requestId})`);
}
