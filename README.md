[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

# The Tower

A building of AI-run companies. Every floor is one business, run by one person and a team of AI agents. The agents do the daily work (research, outreach, building, reports) and bring finished jobs, plus the decisions that need a human, back to the owner.

Built for the Pollinations quest [Build your own tower of AI-run companies](https://github.com/pollinations/pollinations/issues/17999), as a small, self-contained take on [Towers](https://thetowers.ai/).

**Live app:** https://dextheking1.github.io/towers/

## What you can do

- **Ride the tower.** Drag to turn the building, use the lift buttons or click a floor. Lit windows, one company per floor, lobby at the bottom, a vacant office on floor 9.
- **Browse the directory.** All seven companies, their owners and what they do, plus any pending rental applications.
- **Step into an office.** Each company page shows the agent team by role (Research, Outreach, Builder, Reports) and the day's work log: what the agents finished today, and the one decision waiting for the owner. Logs are written by a Pollinations text model and cached per company per day on your device, so repeat visits do not re-spend.
- **Give the team a job.** Type a job (or tap an example) and the team brings back the finished work, or the questions it needs a human decision on. That is the Towers pattern: agents finish, humans decide.
- **Apply to rent floor 9.** A short application form. Demo only: it is stored in your browser (localStorage), shown in the directory as pending, and sent nowhere.

## Bring your own Pollen

The agents run on Pollinations and spend the **visitor's own Pollen**, never the building's. Two routes, following [BRING_YOUR_OWN_POLLEN.md](https://github.com/pollinations/pollinations/blob/main/BRING_YOUR_OWN_POLLEN.md):

1. **Paste your own API key** (Connect your Pollen, option 2). Get one at [enter.pollinations.ai/keys](https://enter.pollinations.ai/keys). The key is stored only in your browser's localStorage and is sent only to `gen.pollinations.ai`. It is checked against `GET /account/key` before it is saved.
2. **Sign in with Pollinations (BYOP OAuth)**. The app implements the documented authorization-code flow with PKCE, including the fragment-flow return. It activates when an App Key (`pk_...`) registered for this page's URL is set as `POLLINATIONS_APP_KEY` in `app.js`. The repo ships without one, so the button explains this and route 1 works out of the box.

Model calls use `POST https://gen.pollinations.ai/v1/chat/completions` with the visitor's key. Default model: `openai/gpt-5.4-nano`.

**Demo mode.** With no key connected, nothing can be charged, so the building answers with a local demo generator instead. Demo output is always labelled as demo, in the log card, in job replies and in the header. If a live call fails, the app falls back to demo output and says why.

## Run it locally

It is a static site, no build step:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## How it maps to Towers

| Towers | The Tower |
| --- | --- |
| A 3D building of companies | A turnable tower, floors 1 to 9 |
| Every floor is one business | Seven seeded companies, one per floor |
| One person plus their AI agents | An owner persona and four agents per company |
| Agents do research, outreach, building, reports | The four agent roles on every team |
| Agents bring finished jobs and decisions to the owner | The daily work log and the "give the team a job" box |
| Visitors browse a directory | The directory view |
| Apply to rent the next office | The floor 9 application form |
| Agents run on Pollinations, users pay with their own Pollen | Bring-your-own-Pollen key flow above |

## Tech

Plain HTML, CSS and JavaScript. No framework, no build, no backend, no tracking. State (key, daily logs, applications) lives in localStorage on the visitor's device only.

## License

MIT, see [LICENSE](LICENSE).
