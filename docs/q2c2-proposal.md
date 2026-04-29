# Q2C2 Proposal — Marketing Automation

**Cycle:** Q2 2026 Cycle 2
**Dates:** 2026-04-28 → 2026-06-08 (6 calendar weeks)
**Effort budget:** 4.5 person-weeks
**Trio:** Peggy + Peter + Taylor (with Rob coordination)
**Status:** Draft for approval

---

## Summary

Q2C1 closed 2026-04-27 with the Design Intelligence System (DIS) MVP shipped: importer pipeline working in prod, asset library with 586 renders + Figma + Drive ingestion, AI Creative Agency end-to-end, and vision-based performance matching. Q2C2 evolves DIS from "central asset library" into "self-service asset creation," and pairs it with two upstream/downstream investments — bulk campaign standup (AceIQ Campaign Builder) and a unified performance view (AceIQ analysis tool / Snowflake) — that together unblock the Course Launch and Marketing Scaling bottlenecks identified by the trio.

**Trio commit:** 5 effort-weeks against a 4.5-week budget. Tight fit, accepted, no slack for surprises.
**Rob commit:** 1 effort-week of discovery/scoping (split across two items).

---

## Bottlenecks addressed

### Course Launch

| Bottleneck | Solve | Status |
|---|---|---|
| Launch asset production | DIS self-service asset creation window | 🧪 MVP |
| Ad campaign standup | AceIQ Campaign Builder bulk + Platform API | 💪 Q2 WIP |
| Cross-channel launch coordination | GTM task manager (Rob, deprioed Q2C1) | 🤔 Discovery |

### Marketing Scaling

| Bottleneck | Solve | Status |
|---|---|---|
| Evergreen asset creation | DIS self-service asset creation window (same build) | 💪 Q2 WIP |
| Performance-informed optimization | AceIQ analysis tool / Snowflake unified view | 🤔 Discovery |

**Already addressed (no Q2C2 work needed):**
- *GTM new market research* → shipped Q1 2026 via the GTM market research agent inside the one-pager generator.
- *Competitive and market visibility* → BI is building the Competitive Intelligence System (Q2 WIP, BI-owned). Tracked here as a dependency, not in trio scope.

---

## Q2C2 Scope (committed)

### 1. DIS — self-service asset creation window
**Owner:** Peggy
**Effort:** 2.5 weeks
**Bottlenecks addressed:** Launch asset production + Evergreen asset creation
**Solve:** Extend DIS so PMMs and channel managers can self-serve asset creation against on-brand image inventory, without a designer hand-off for early exploration.
**Builds on:** Q2C1-shipped DIS asset library (586 renders, Figma + Drive import, vision-matching, AI Creative Agency).
**Success metric:** Self-service assets created per month, and reduction in designer-blocked items in PMM queues.
**Explicitly out of scope:** Meta upload Gate 3 (deferred — needs `META_WRITE_TOKEN`), Clerk auth wiring (parked).

### 2. AceIQ Campaign Builder — bulk creation + Platform API integration
**Owner:** Peter
**Effort:** 2 weeks
**Bottleneck addressed:** Ad campaign standup
**Solve:** Extend the existing Campaign Builder (currently 2 hrs/mo, Google + bulk paid-ad starter scope) to support bulk campaign creation across all brands/verticals, with direct Platform API integration so campaigns push live without intermediate manual steps.
**Success metric:** Campaigns stood up per cycle via bulk vs manual; time-per-campaign delta.
**Explicitly out of scope:** Net-new ad-platform integrations beyond current scope; analytics/reporting layer (handled by Meta Ad Insights / TikTok Ad Insights sub-tools).

### 3. AceIQ analysis tool / Snowflake unified view
**Owner:** Peggy
**Effort:** 0.5 weeks (discovery only)
**Bottleneck addressed:** Performance-informed optimization
**Solve (this cycle):** Discovery deliverable — define the data surface needed, identify Snowflake access path, scope the cross-channel unified-view spec. Build deferred to Q2C3 pending discovery output.
**Success metric:** Approved spec doc + Snowflake access decision.
**Explicitly out of scope:** Any build work — this is a scoping pass.

### 4. GTM task manager — cross-channel launch coordination *(Rob)*
**Owner:** Rob
**Effort:** 0.5 weeks (discovery only) — Rob's effort, not trio's
**Bottleneck addressed:** Cross-channel launch coordination
**Solve (this cycle):** Discovery deliverable — define the trigger surface, identify what signals DIS + Campaign Builder need to emit so GTM Automation App can coordinate cross-channel status. Spec sets up Q2C3 build.
**Why now:** Deprioed Q2C1 to focus DIS shipping. With DIS + Campaign Builder maturing this cycle, the coordination layer becomes the next logical bottleneck.
**Explicitly out of scope:** Any automation/trigger build — this is a scoping pass.

---

## Dependencies (tracked, not committed by this trio)

- **Competitor Intelligence System** — BI-owned, Q2 WIP. Solves the "Competitive and market visibility" bottleneck. Trio role: stay aware of timeline and integration points (especially with AceIQ analysis tool in #3).
- **Snowflake access decision** — gates AceIQ analysis tool (#3). Owner TBD via the discovery in #3.
- **GTM Automation App task model** — owned by Rob. GTM task manager (#4) extends this; Rob's discovery will identify whether the existing tasks concept covers cross-channel coordination or needs extension.

---

## Cycle math

| | Weeks |
|---|---|
| Trio budget | 4.5 |
| DIS self-service (Peggy) | 2.5 |
| Campaign Builder bulk (Peter) | 2.0 |
| AceIQ analysis discovery (Peggy) | 0.5 |
| **Trio commit** | **5.0** |
| **Slack** | **−0.5 (tight)** |
| Rob effort (separate budget) | 1.0 (split: GTM task manager 0.5 + AceIQ analysis support 0.5) |

**Risk:** Zero-slack cycle. If DIS or Campaign Builder runs hot, AceIQ discovery slips to Q2C3. Acceptable trade.

---

## Out of scope (explicitly)

- Meta upload Gate 3 (deferred — needs `META_WRITE_TOKEN`)
- Clerk auth wiring on DIS (parked from Q2C1)
- Iterable Email Creator continued investment (folding into DIS as a future feature)
- Topic Suggester (folding into Content Master tool)
- Competitor Intel build (BI-owned)
- Any AceIQ analysis tool *build* this cycle (discovery only)
- Any GTM task manager *build* this cycle (discovery only)

---

## Approval

**Approver:** Peter
**Approval date:** _pending_
**Once approved:** Cycle row + 5 backlog items will be created in AQPS and inventory entries linked to the relevant master plans (DIS, Campaign Builder).
