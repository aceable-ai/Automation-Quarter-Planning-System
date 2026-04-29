# Reward & Recognition feature — demo setup

## What was built

- `/master-plans/submit` success state now shows raffle entry confirmation
- `/cycles/[id]` page now has a Drawing Panel with "Run drawing" button + winner reveal + audio player
- `/master-plans/[id]` now has a Credits + Ship card with "Mark as Shipped" button + ship modal
- API routes: `/api/cycles/current`, `/api/cycles/[id]/draw-winner`, `/api/cycles/[id]/drawing-entries`, `/api/master-projects/[id]/ship`, `/api/master-projects/[id]/credits`
- New `song_drawings` table; new ship-related columns on `master_projects`
- Provider modules: `src/lib/music-provider.ts` (mock), `src/lib/image-provider.ts` (OpenAI with precache fallback)

## Setup steps before demo (~10 min)

### 1. Generate the demo song manually
- Go to suno.com, create a song using this prompt template (already coded in `music-provider.ts`):

  > Style: upbeat indie pop, 60 seconds, vocals, anthem feel.
  > Lyrics theme: A workplace problem submitted by Peggy Black at Aceable.
  > [paste your demo problem title + body here]
  > Make it tongue-in-cheek but earnest. Treat the submitter like a hero for naming the problem out loud.

- Download as MP3
- Drop the file at `public/demo_song.mp3`

### 2. Pre-cache the celebration image
Pick the master plan you'll demo "Mark as Shipped" on. Note its `id`.

Run this once to generate the precache image:
```bash
curl -X POST 'https://api.openai.com/v1/images/generations' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-image-1",
    "prompt": "A celebration poster for a shipped feature called \"Demo Plan Title\", credited to Peggy Black. Retro 80s arcade poster style, neon colors, purple and teal palette, bold typography. The poster should feel like a trophy or collectible card, not a screenshot.",
    "n": 1,
    "size": "1024x1024"
  }' | jq -r '.data[0].b64_json' | base64 -d > public/demo_celebration.png
```

### 3. Add env vars to `.env.development.local`
```
OPENAI_API_KEY=sk-...
DEMO_MASTER_PLAN_ID=<the id from step 2>
```

### 4. Seed the demo data via UI
Open the running app at http://localhost:3003 and:

a. **Create a Q2C2 cycle** at `/cycles` (or via the API):
   - name: "Q2C2"
   - start_date: 2026-04-28
   - end_date: 2026-06-08
   - status: "active"

b. **Create a demo master plan** at `/master-plans` (note its id; matches `DEMO_MASTER_PLAN_ID`)

c. **Submit 3-5 problems** at `/master-plans/submit`:
   - At least one with your name (so you can win the demo drawing)
   - At least one tied to the demo master plan (so credits show up)
   - Mix authors so the drawing pool has variety

## Demo flow

1. **Open `/master-plans/submit`** — talk through the form
2. **Submit a problem as yourself** — hit submit
3. **Success page**: "🎟️ You're entry #N in the Q2C2 drawing!" — discuss the raffle hook
4. **Cut to admin view** — `/cycles/<q2c2-id>` — show the Drawing Panel
5. **Click "Run drawing"** — winner reveals after a brief animation, song plays
6. **Cut to** `/master-plans/<demo-plan-id>` — show Credits section
7. **Click "🚀 Mark as Shipped"** — ship modal opens, image generates (precached, instant) or live OpenAI call (10-20s)
8. **Edit the announcement, copy, "Open Slack"** — live ad for the next round of problem submissions

## Known limitations (Phase 2 candidates)

- No real Suno integration — mock returns the same MP3 for any winner. Phase 2: pick a real provider (sunoapi.org, AIMLAPI, etc.)
- Background tasks use synchronous request handling — fine for demo, not for production load
- No admin auth gating on Mark as Shipped — anyone logged in can ship a plan
- Celebration images stored as base64 data URLs in DB if generated live — production should upload to S3/R2
- No retroactive song generation for old submissions
- No Slack auto-post — manual copy/paste for now
