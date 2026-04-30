import { generateImage } from '@/lib/higgsfield';

const STYLE_SUFFIX =
  'Stylized celebration poster — bold typography, vibrant colors, ' +
  'feels like a collectible trophy card. Aceable brand palette ' +
  '(teal #12BDCD, pink #FF3072, navy #21333F). Eye-catching, frame-worthy.';

export interface ImageProvider {
  generateCelebrationImage(args: {
    masterPlanId: string;
    planTitle: string;
    submitterNames: string[];
  }): Promise<string>;
}

class HiggsfieldImageProvider implements ImageProvider {
  async generateCelebrationImage(args: {
    masterPlanId: string;
    planTitle: string;
    submitterNames: string[];
  }): Promise<string> {
    const demoPlanId = process.env['DEMO_MASTER_PLAN_ID'];
    if (demoPlanId && args.masterPlanId === demoPlanId) {
      return '/demo_celebration.png';
    }

    const credits =
      args.submitterNames.length > 0
        ? `credited to ${args.submitterNames.join(', ')}`
        : 'credited to the team';
    const prompt = `A celebration poster for a shipped feature called "${args.planTitle}", ${credits}. ${STYLE_SUFFIX}`;

    try {
      return await generateImage(prompt);
    } catch (err) {
      console.error('[image-provider] Higgsfield failed', err);
      return '/demo_celebration.png';
    }
  }
}

export function getImageProvider(): ImageProvider {
  return new HiggsfieldImageProvider();
}
