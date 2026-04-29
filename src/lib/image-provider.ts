const STYLE_SUFFIX =
  'Retro 80s arcade poster style, neon colors, purple and teal palette, ' +
  'bold typography. The poster should feel like a trophy or collectible card, ' +
  'not a screenshot.';

export interface ImageProvider {
  generateCelebrationImage(args: {
    masterPlanId: string;
    planTitle: string;
    submitterNames: string[];
  }): Promise<string>;
}

class OpenAIImageProvider implements ImageProvider {
  async generateCelebrationImage(args: {
    masterPlanId: string;
    planTitle: string;
    submitterNames: string[];
  }): Promise<string> {
    const demoPlanId = process.env['DEMO_MASTER_PLAN_ID'];
    if (demoPlanId && args.masterPlanId === demoPlanId) {
      return '/demo_celebration.png';
    }

    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) {
      console.warn('[image-provider] OPENAI_API_KEY missing — returning placeholder');
      return '/demo_celebration.png';
    }

    const credits =
      args.submitterNames.length > 0
        ? `credited to ${args.submitterNames.join(', ')}`
        : 'credited to the team';
    const prompt = `A celebration poster for a shipped feature called "${args.planTitle}", ${credits}. ${STYLE_SUFFIX}`;

    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt,
          n: 1,
          size: '1024x1024',
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[image-provider] OpenAI error', res.status, err);
        return '/demo_celebration.png';
      }

      const json = (await res.json()) as { data: { b64_json?: string; url?: string }[] };
      const item = json.data[0];
      if (item?.b64_json) {
        return `data:image/png;base64,${item.b64_json}`;
      }
      if (item?.url) {
        return item.url;
      }
      console.error('[image-provider] OpenAI returned no image data', json);
      return '/demo_celebration.png';
    } catch (err) {
      console.error('[image-provider] fetch failed', err);
      return '/demo_celebration.png';
    }
  }
}

export function getImageProvider(): ImageProvider {
  return new OpenAIImageProvider();
}
