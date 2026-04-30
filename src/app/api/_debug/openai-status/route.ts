import { NextResponse } from 'next/server';

interface ApiErrorBody {
  error?: { message?: string; type?: string; code?: string };
}

interface DiagResult {
  key_set: boolean;
  key_length: number;
  key_prefix: string | null;
  next_step?: string;
  models_status?: number;
  models_error?: ApiErrorBody['error'] | null;
  models_fetch_threw?: string;
  has_gpt_image_1?: boolean;
  has_dall_e_3?: boolean;
  image_gen_status?: number;
  image_gen_error?: ApiErrorBody['error'] | null;
  image_gen_returned_n?: number;
  image_fetch_threw?: string;
}

export async function GET() {
  const key = process.env['OPENAI_API_KEY'];
  const result: DiagResult = {
    key_set: !!key,
    key_length: key ? key.length : 0,
    key_prefix: key ? key.slice(0, 7) : null,
  };

  if (!key) {
    result.next_step = 'Set OPENAI_API_KEY in Railway Variables for the AQPS service';
    return NextResponse.json(result);
  }

  try {
    const modelsRes = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    result.models_status = modelsRes.status;
    if (!modelsRes.ok) {
      const body = (await modelsRes.json()) as ApiErrorBody;
      result.models_error = body.error ?? null;
      result.next_step = 'Auth failed at /v1/models. Check key validity + billing on the OpenAI account.';
      return NextResponse.json(result);
    }
    const json = (await modelsRes.json()) as { data: { id: string }[] };
    const ids = json.data.map(m => m.id);
    result.has_gpt_image_1 = ids.includes('gpt-image-1');
    result.has_dall_e_3 = ids.includes('dall-e-3');
  } catch (err) {
    result.models_fetch_threw = String(err);
    return NextResponse.json(result);
  }

  try {
    const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: 'Test pattern: a simple purple circle on a white background.',
        n: 1,
        size: '1024x1024',
      }),
    });
    result.image_gen_status = imgRes.status;
    if (!imgRes.ok) {
      const body = (await imgRes.json()) as ApiErrorBody;
      result.image_gen_error = body.error ?? null;
      const msg = body.error?.message ?? '';
      result.next_step = msg.includes('verified')
        ? 'Org needs verification on platform.openai.com → settings → general → verify org. Or swap to dall-e-3 in code.'
        : body.error?.code === 'unsupported_country_region_terms_of_service'
          ? 'Region not supported — try a different OpenAI account'
          : `Image gen failed: ${msg || 'unknown'}`;
      return NextResponse.json(result);
    }
    const json = (await imgRes.json()) as { data: unknown[] };
    result.image_gen_returned_n = json.data.length;
    result.next_step = 'All systems go. gpt-image-1 works for this org.';
  } catch (err) {
    result.image_fetch_threw = String(err);
  }

  return NextResponse.json(result);
}
