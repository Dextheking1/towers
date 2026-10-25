// Seed data for The Tower. Every company: one human owner, four agents.
// Roles follow the Towers pattern: research, outreach, builder, reports.
window.COMPANIES = [
  {
    id: "returns-radar",
    floor: 2,
    name: "Returns Radar",
    business: "Returns analysis for small ecommerce shops",
    owner: { name: "Hanna Lindqvist", note: "Ex-warehouse lead. Reads every report with morning coffee." },
    accent: "#38bdf8",
    pitch: "Shops send their returns data; the agents find which products, sizes and photos cause the bounces, and what to fix first.",
    team: [
      { role: "Research", name: "Scout", duty: "Pulls returns by SKU, reason code and week. Flags spikes." },
      { role: "Outreach", name: "Herald", duty: "Writes the Monday email to shop owners, plain language only." },
      { role: "Builder", name: "Forge", duty: "Maintains the upload page and the per-shop dashboards." },
      { role: "Reports", name: "Ledger", duty: "Turns the week into one ranked list of fixes per shop." }
    ],
    exampleJobs: [
      "Why did returns on the Trail Runner shoe jump last week?",
      "Draft the fix-it list for the shop with the worst size-guide returns."
    ],
    logPool: [
      "Scout: pulled returns for 14 shops; Trail Runner returns up 31% week on week, mostly size 43.",
      "Forge: shipped a size-guide widget test to 3 shops; early returns on fitted SKUs down 9%.",
      "Ledger: ranked fixes for all shops; photo angle change is the top item for 5 of them.",
      "Herald: sent the Monday summaries; 11 of 14 owners opened within the hour.",
      "Scout: traced the Trail Runner spike to a new supplier batch with narrower lasts.",
      "Forge: added a per-batch filter so supplier changes stop hiding inside totals.",
      "Ledger: drafted the quarterly returns benchmark, 22 shops anonymised."
    ],
    decisionPool: [
      "Decision needed: tell the Trail Runner supplier about the narrow batch now, or wait for one more week of data?",
      "Decision needed: two shops asked for refunds forecasting. Price it as an add-on or fold it into the plan?"
    ]
  },
  {
    id: "soundcheck-social",
    floor: 3,
    name: "Soundcheck Social",
    business: "Podcast episodes turned into a week of posts",
    owner: { name: "Diego Fuentes", note: "Records his own show on Thursdays. Approves clips between takes." },
    accent: "#f472b6",
    pitch: "One episode in, seven posts out. The agents cut, caption and schedule, the owner only picks the moments that matter.",
    team: [
      { role: "Research", name: "Scout", duty: "Finds the quotable moments and checks them against past posts." },
      { role: "Outreach", name: "Herald", duty: "Pitches podcasters and answers trial questions." },
      { role: "Builder", name: "Forge", duty: "Runs the clip pipeline: transcript, cuts, captions, exports." },
      { role: "Reports", name: "Ledger", duty: "Weekly reach report per show, best hook per platform." }
    ],
    exampleJobs: [
      "Turn episode 42 into this week's posts.",
      "Which hook worked best for the comedy show last month?"
    ],
    logPool: [
      "Forge: cut 7 clips from episode 42, captioned and exported in 3 formats.",
      "Scout: picked 5 candidate moments; the pricing rant scored highest on past data.",
      "Ledger: last week's clips hit 41k views; short hooks under 20 seconds won again.",
      "Herald: pitched 8 podcasters with sample clips from their own episodes; 2 replied.",
      "Forge: fixed caption timing drift on long episodes.",
      "Scout: checked reuse; none of today's clips repeat a moment used this month."
    ],
    decisionPool: [
      "Decision needed: a client wants posts in a second language. Add it as a paid tier?",
      "Decision needed: post the pricing-rant clip today or hold it for the launch week?"
    ]
  },
  {
    id: "patchnote-press",
    floor: 4,
    name: "Patchnote Press",
    business: "Changelogs and docs for dev tools",
    owner: { name: "Priya Nair", note: "Former support lead. Hates the phrase 'various bug fixes'." },
    accent: "#a78bfa",
    pitch: "Release notes people actually read. The agents read every merged PR, then write the changelog, the docs diff and the upgrade warning.",
    team: [
      { role: "Research", name: "Scout", duty: "Reads merged PRs and issues; groups them by user impact." },
      { role: "Outreach", name: "Herald", duty: "Asks maintainers the one question the notes cannot answer alone." },
      { role: "Builder", name: "Forge", duty: "Keeps the changelog sites building and the RSS feeds honest." },
      { role: "Reports", name: "Ledger", duty: "Monthly 'what changed' digest for each product's users." }
    ],
    exampleJobs: [
      "Write the changelog for v2.4 from this week's merged PRs.",
      "Which breaking change needs an upgrade guide?"
    ],
    logPool: [
      "Scout: read 38 merged PRs across 4 products; grouped into 6 user-facing changes.",
      "Herald: asked two maintainers about the config rename; both answered, notes updated.",
      "Forge: rebuilt 4 changelog sites; caught a broken anchor in the v2.3 notes.",
      "Ledger: sent the monthly digest; the deprecation warning got the most clicks.",
      "Scout: flagged a silent behaviour change in a patch release; escalated to the owner.",
      "Forge: added per-version permalinks so support can link exact notes."
    ],
    decisionPool: [
      "Decision needed: the silent behaviour change. Name it in the notes now or wait for the maintainer's reply?",
      "Decision needed: a client wants release notes twice a week. Same price or a rush tier?"
    ]
  },
  {
    id: "firstline-outreach",
    floor: 5,
    name: "Firstline Outreach",
    business: "B2B lead research and first-touch emails",
    owner: { name: "Jonas Weber", note: "Sells the meetings, closes them himself. Agents never send the second email." },
    accent: "#fbbf24",
    pitch: "The agents research the accounts and write the first touch. The owner approves every batch before anything leaves the building.",
    team: [
      { role: "Research", name: "Scout", duty: "Builds account lists and finds the buying signal for each." },
      { role: "Outreach", name: "Herald", duty: "Writes first-touch emails, one real observation per account." },
      { role: "Builder", name: "Forge", duty: "Keeps the CRM clean and the dedupe rules strict." },
      { role: "Reports", name: "Ledger", duty: "Reply-rate report per campaign, with the lines that worked." }
    ],
    exampleJobs: [
      "Build a list of 20 dental clinics in Ohio that changed owners this year.",
      "Write first touches for the five strongest accounts on the list."
    ],
    logPool: [
      "Scout: built a 60-account list; 17 show a hiring or expansion signal this quarter.",
      "Herald: drafted 20 first touches, each tied to one checked fact about the account.",
      "Forge: deduped the CRM against last quarter; removed 9 accounts already contacted.",
      "Ledger: campaign reply rate 11%; the 'new location' angle beat 'cost saving' 3 to 1.",
      "Scout: verified contact roles for the top 20; dropped 4 generic inboxes.",
      "Herald: rewrote the weakest 5 drafts after the owner's margin notes."
    ],
    decisionPool: [
      "Decision needed: 20 drafts are ready. Approve the batch, or only the 12 with hiring signals?",
      "Decision needed: an account replied asking for pricing. Take the call yourself or send the deck first?"
    ]
  },
  {
    id: "pitchpine-studio",
    floor: 6,
    name: "Pitchpine Studio",
    business: "Pitch decks and landing pages for startups",
    owner: { name: "Aiko Tanaka", note: "Designer. Reviews every deck herself, agents do the other 90 percent." },
    accent: "#34d399",
    pitch: "Founders send a messy doc; the agents return a deck, a landing page and the three hardest questions investors will ask.",
    team: [
      { role: "Research", name: "Scout", duty: "Market sizing, competitor decks, claim checking." },
      { role: "Outreach", name: "Herald", duty: "Follows up with founders and books the review calls." },
      { role: "Builder", name: "Forge", duty: "Builds the deck and landing page from the studio template." },
      { role: "Reports", name: "Ledger", duty: "Tracks which slides investors linger on, per deck." }
    ],
    exampleJobs: [
      "Turn this founder doc into a 10-slide deck outline.",
      "What are the three hardest questions for a seed-stage devtool?"
    ],
    logPool: [
      "Forge: built deck v1 for the logistics founder; 11 slides, template 4.",
      "Scout: sized the market three ways; flagged one claim the founder could not source.",
      "Ledger: last deck's slide 6 held attention longest; the team slide got skipped.",
      "Herald: booked 3 review calls; sent prep notes to each founder.",
      "Forge: shipped the landing page variant with the demo GIF above the fold.",
      "Scout: collected 5 competitor decks; two use the same (wrong) market number."
    ],
    decisionPool: [
      "Decision needed: the unsourced market claim. Cut it, or keep it with the founder's wording?",
      "Decision needed: offer a rush 48-hour tier? Two founders asked this week."
    ]
  },
  {
    id: "ledgerlight",
    floor: 7,
    name: "Ledgerlight",
    business: "Bookkeeping cleanup for freelancers",
    owner: { name: "Tomás Ribeiro", note: "Accountant. Signs off every month-end close personally." },
    accent: "#60a5fa",
    pitch: "Freelancers drop a year of chaos into a folder. The agents categorise, chase the missing receipts and hand back a clean ledger.",
    team: [
      { role: "Research", name: "Scout", duty: "Matches bank lines to invoices; lists what is missing." },
      { role: "Outreach", name: "Herald", duty: "Sends the receipt-chasing emails, polite and specific." },
      { role: "Builder", name: "Forge", duty: "Maintains the import rules per bank and per client." },
      { role: "Reports", name: "Ledger", duty: "Month-end close pack: totals, anomalies, sign-off sheet." }
    ],
    exampleJobs: [
      "Close March for the designer with the messy Wise account.",
      "Which clients still owe receipts for Q1?"
    ],
    logPool: [
      "Scout: matched 212 of 230 bank lines for the March close; 18 need receipts.",
      "Herald: sent 6 receipt requests with exact amounts and dates; 4 answered.",
      "Forge: added import rules for two new banks; duplicate rate dropped to zero.",
      "Ledger: closed February for 9 clients; sign-off packs sent to the owner.",
      "Scout: found a double-charged subscription running for 7 months for one client.",
      "Forge: built the anomaly view the owner asked for: anything over 500, highlighted."
    ],
    decisionPool: [
      "Decision needed: 18 lines still lack receipts. Close March without them or hold the pack?",
      "Decision needed: the double-charged client. Email them the finding today or in the close pack?"
    ]
  },
  {
    id: "northbeam-research",
    floor: 8,
    name: "Northbeam Research",
    business: "Market research for indie game studios",
    owner: { name: "Mara Voss", note: "Ex-games journalist. Reads every brief before it ships." },
    accent: "#f87171",
    pitch: "Studios ask 'is this game worth making?'. The agents read the market, the reviews and the wishlists, then write the brief.",
    team: [
      { role: "Research", name: "Scout", duty: "Tracks releases, tags, review themes and wishlist velocity." },
      { role: "Outreach", name: "Herald", duty: "Interviews players and keeps the panel warm." },
      { role: "Builder", name: "Forge", duty: "Builds the comparison dashboards studios actually open." },
      { role: "Reports", name: "Ledger", duty: "Writes the brief: verdict first, evidence after." }
    ],
    exampleJobs: [
      "Is a cozy farming sim with a horror twist a crowded niche?",
      "Brief me on deck-builder roguelikes released this year."
    ],
    logPool: [
      "Scout: tracked 46 releases this week; cozy horror is up, pure farming is flat.",
      "Ledger: finished the deck-builder brief; verdict: crowded, one open angle.",
      "Herald: ran 5 player interviews on demo length; notes merged into the brief.",
      "Forge: rebuilt the wishlist-velocity chart with the new tag taxonomy.",
      "Scout: mined 3,100 reviews; 'runs out of content at hour 20' is the top complaint.",
      "Ledger: drafted the one-page version for the studio that hates long documents."
    ],
    decisionPool: [
      "Decision needed: the cozy-horror brief says 'make it'. Send today or wait for the festival data?",
      "Decision needed: a studio wants exclusivity in its genre. Worth a retainer discussion?"
    ]
  }
];
