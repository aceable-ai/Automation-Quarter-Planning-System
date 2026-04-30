import { NextResponse } from 'next/server';

interface ModelsErrorBody {
  error?: { message?: string; type?: string; code?: string };
}

interface ImageErrorBody {
  error?: { message?: string; type?: string; code?: string };
}

export async function GET() {
  const key = process.env['OPENAI_API_KEY'];
  const result: Record<string, unknown> = {
    key_set: !!key,
    key_length: key ? key.length : 0,
    key_prefix: key ? key.slice(0, 7) : null,
  };

  if (!key) {
    result.next_step = 'Set OPENAI_API_KEY in Railway Variables for the AQPS service';
    return NextResponse.json(result);
  }

  // Step 1: hit /v1/models — cheap auth check
  try {
    const modelsRes = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    result.models_status = modelsRes.status;
    if (!modelsRes.ok) {
      const body = (await modelsRes.json()) as ModelsErrorBody;
      result.models_error = body.error ?? null;
      result.next_step = `Auth failed at /v1/models. Check key validity + billing on the OpenAI account.`;
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

  // Step 2: tiny image-gen test with gpt-image-1
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
      const body = (await imgRes.json()) as ImageErrorBody;
      result.image_gen_error = body.error ?? null;
      result.next_step =
        body.error?.code === 'unsupported_country_region_terms_of_service'
          ? 'Region not supported — try a different OpenAI account'
          : body.error?.message?.includes('verified')
            ? 'Org needs verification on platform.openai.com → settings → general → verify org. Or swap to dall-e-3 in code.'
            : `Image gen failed: ${body.error?.message ?? 'unknown'}`;
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
