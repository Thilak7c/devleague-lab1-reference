# Challenge Day Runbook — Aug 22, 09:30–16:30

**Submission deadline: 16:30 sharp. No late submissions, even 1 minute.**
**Target: submit by 16:00–16:15, not 16:30.**

## 09:30–10:00 — Kickoff & setup
- Confirm brief hasn't changed from what we prepped for
- Create the real submission repo (public, fresh — separate from the reference repo)
- All three clone it locally
- Quick standup: confirm scopes from README, flag unclear items before typing starts

## 10:00–12:00 — Core build (parallel)
- **Student A:** upload UI + all 4 states, wired against the locked data contract (can build against fixture JSON before backend is live)
- **Student B:** anomaly detection + PII masking, unit-testable standalone
- **Thilak:** pipeline skeleton + extraction routing (CSV/XLSX/text-PDF)

Commit as each piece works — not one big dump. All three should have visible commits by noon.

## 12:00–12:30 — Checkpoint 1: first integration
Wire frontend to a real (even partial) backend response. Confirm the contract holds end to end. Mismatches surface here, not at 3pm.

## 12:30–13:00 — Lunch buffer
Keep it short. No float later in the day.

## 13:00–14:30 — Second pass + vision fallback
- **Thilak:** wire scanned-PDF vision fallback if time allows; otherwise confirm graceful failure path works
- **Student B:** PDPA UI copy, masking badge, AI_DISCLOSURE.md
- **Student A:** visual polish, error states, empty state

## 14:30–15:00 — Checkpoint 2: full end-to-end test
Run all sample-data files through the real deployed-or-local flow. Last chance to catch stuck-loading-state or CORS-type bugs before deploy.

## 15:00–15:30 — Deploy
Backend to Cloud Run, frontend to Vercel, wire `NEXT_PUBLIC_API_URL`. Test the live links, not just localhost.

## 15:30–16:00 — Submission prep
Fill in Devpost Project Description (skeleton already drafted), record pitch video (≤3 min), final README check, confirm repo is public.

## 16:00–16:15 — Submit
Target window. Leaves 15 minutes of slack for upload hiccups.

## 16:15–16:30 — Buffer
Free margin if on target. Emergency fix time if not.

---

**Hard cutoff: no new features after 15:00.** Everything past that point is deploy, polish, and submission only.
