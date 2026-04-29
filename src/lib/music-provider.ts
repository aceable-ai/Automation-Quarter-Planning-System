export interface MusicProvider {
  generateSong(args: { prompt: string; submissionId: string }): Promise<string>;
}

class MockMusicProvider implements MusicProvider {
  async generateSong(_args: { prompt: string; submissionId: string }): Promise<string> {
    await new Promise(r => setTimeout(r, 1500));
    return '/demo_song.mp3';
  }
}

export function getMusicProvider(): MusicProvider {
  return new MockMusicProvider();
}

export function buildSongPrompt(args: {
  submitterName: string;
  problemTitle: string;
  problemBody: string | null;
  frequency: string | null;
}): string {
  return [
    'Style: upbeat indie pop, 60 seconds, vocals, anthem feel',
    `Lyrics theme: A workplace problem submitted by ${args.submitterName} at Aceable.`,
    `The problem they raised: ${args.problemTitle}`,
    args.problemBody ? `Detail: ${args.problemBody.slice(0, 200)}` : null,
    args.frequency ? `Frequency of pain: ${args.frequency}` : null,
    'Make it tongue-in-cheek but earnest. Treat the submitter like a hero for naming the problem out loud.',
  ].filter(Boolean).join('\n');
}
