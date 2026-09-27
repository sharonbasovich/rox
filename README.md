# Rox Labs: research-to-record prototype

A local prototype of improvements to [Rox](https://www.rox.com), built after a full walkthrough of the product
(Home, Chat, Agents, Accounts, People, Sequences, Meetings, Opportunities, Apps, and every Settings tab)
with a made-up test workspace ("Acme Test Corp") and real research runs on the OpenAI acc**Thesis:** Rox agents already do strong, cited research. Two things would make it safer to act on: keep what
the agents say in sync with the record, and show how strong each citation is. The list below only includes
behavior observed directly in Rox that was not caused by the test setup.

| # | Finding (observed in Rox) | Prototype | Route |
|---|---------------------------|-----------|-------|
| 1 | The Rox-enriched `Revenue` field on OpenAI reads `2000000`, while the Account Plan agent wrote "$40B revenue run rate". Nothing flagged the conflict. | Record Truth-Check | `/account` |
| 2 | The new CRO was cited only to derrick-app.com (a sales-tool blog), then became the brief's primary outreach target. Citation chips don't show source strength. | Evidence Ledger | `/ledger` |
| 3 | The enriched `Industries` field renders as a raw JSON string. | Record Truth-Check | `/account` |
| 4 | "New sequence" creates `Sequence - <date>` before any step is added or saved. | Brief only | - |

 fit.

## Architecture

- `shared/`: pure, tested logic (claim scoring, confidence propagation, record reconciliation). Data in `shared/data.ts` is replayed from the recorded Rox session.
- `server/`: Express API. The `verify_claims` AI job runs as a **Devin session with a JSON
  structured-output schema** (`server/jobs.ts`). Without `DEVIN_API_KEY`, it falls back to deterministic,
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
