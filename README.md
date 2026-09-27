# Rox Labs: Trust Layer prototype

A local prototype of improvements to [Rox](https://www.rox.com), built after a full walkthrough of the product
(Home, Chat, Agents, Accounts, People, Sequences, Meetings, Opportunities, Apps, and every Settings tab)
with a made-up test workspace ("Acme Test Corp") and real research runs on the OpenAI account.

**Thesis:** Rox agents already do strong research. What's missing is a way to tell which claims are safe to act
on, and to keep what the agents say in sync with the record. Every prototype here comes from a specific
failure observed in the product.

| # | Prototype | Observed in Rox | Route |
|---|-----------|-----------------|-------|
| 1 | Record Truth-Check | Record `Revenue = 2000000` while the Account Plan agent wrote "$40B run rate". `Industries` renders raw JSON. | `/account` |
| 2 | Evidence Ledger | "New CRO" came from one blog (derrick-app.com) and then became the primary outreach target. | `/ledger` |
| 3 | Seller Context | Chat said "I can't tailor the pitch to a specific SKU": onboarding only captures a company name. | `/seller` |
| 4 | Agent Dry Run | Agent templates go live with no preview of target accounts, side effects or action budget. | `/dry-run` |
| 5 | Eval Console | Brief took 124s (first text ~12s), plan 94s; grounding/personalization are not scored per output. | `/evals` |
| 6 | Domain Guardrails | Workspace contains accounts with domains `127.0.0.1`, `169.254.169.254`, `a'b.example`. | `/accounts` |

Findings with no prototype (brief only): a unified "what unlocks what" plan/integration readiness view,
creating a sequence only on first save (not on "New sequence" click), and ranking People search results by ICP fit.

## Architecture

- `shared/`: pure, tested logic (claim scoring, confidence propagation, record reconciliation, domain
  validation, dry-run simulation, evals). Data in `shared/data.ts` is replayed from the recorded Rox session.
- `server/`: Express API. AI jobs (`verify_claims`, `seller_angles`) run as **Devin sessions with a JSON
  structured-output schema** (`server/jobs.ts`). Without `DEVIN_API_KEY`, jobs fall back to deterministic,
  recorded outputs, so the demo also works offline.
- `src/`: React + Vite UI styled after Rox.

## Run

```bash
npm install
cp .env.example .env   # optional: set DEVIN_API_KEY for live agent jobs
export $(grep -v '^#' .env | xargs)  # or export DEVIN_API_KEY=...
npm run dev            # web :5173, api :8787
```

Checks: `npm run typecheck && npm run lint && npm test && npm run build`.
