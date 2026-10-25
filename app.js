// The Tower: a building of AI-run companies.
// Agents run on Pollinations (gen.pollinations.ai) with the VISITOR's own key
// (bring your own Pollen). With no key the building runs in demo mode:
// the same prompts are answered by a local demo generator, clearly labelled,
// so nobody is charged and nobody is fooled.

const GEN_BASE = "https://gen.pollinations.ai";
const MODEL = "openai/gpt-5.4-nano";

// BYOP (Bring Your Own Pollen), per BRING_YOUR_OWN_POLLEN.md.
// To enable the one-click sign-in, register an App Key (pk_...) at
// enter.pollinations.ai/keys with this page's URL as a Redirect URI and set
// it here. Until then the button explains itself and paste-a-key works.
const POLLINATIONS_APP_KEY = "";

const LS_KEY = "towers.pollinationsKey";
const LS_LOG = "towers.dailylog.";
const LS_APPS = "towers.applications";
const LS_PKCE = "towers.pkce";

const $ = (sel, el) => (el || document).querySelector(sel);
const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

const state = {
  view: "tower",
  selectedFloor: 9,
  officeId: null,
  ry: -16,
  apiKey: localStorage.getItem(LS_KEY) || "",
};

// ---------- small utils ----------

function todayStr(d) {
  const t = d || new Date();
  return t.toISOString().slice(0, 10);
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function companyById(id) {
  return window.COMPANIES.find(c => c.id === id) || null;
}

function applications() {
  try { return JSON.parse(localStorage.getItem(LS_APPS) || "[]"); }
  catch { return []; }
}

// ---------- Pollinations calls ----------

async function chatCompletion(messages) {
  const res = await fetch(GEN_BASE + "/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + state.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json())?.error?.message || ""; } catch {}
    throw new Error("Pollinations returned " + res.status + (detail ? ": " + detail : ""));
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty reply from the model.");
  return text.trim();
}

async function validateKey(key) {
  const res = await fetch(GEN_BASE + "/account/key", {
    headers: { "Authorization": "Bearer " + key },
  });
  if (!res.ok) throw new Error("Key check failed (" + res.status + ")");
  return res.json();
}

// ---------- demo generator (no key, or fallback) ----------

function demoDailyLog(company) {
  const seed = hashStr(company.id + todayStr());
  const pool = company.logPool;
  // Seeded shuffle, then take 4: the picked lines are always distinct.
  // The old stride pick, (seed + i * 3) % pool.length, repeats whenever the
  // stride and the pool length share a factor (length 6, stride 3 gave
  // a, b, a, b, so two entries showed twice).
  const order = pool.map((_, i) => i);
  let s = seed || 1;
  const rand = () => {
    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
    return s / 0x80000000;
  };
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = order[i]; order[i] = order[j]; order[j] = t;
  }
  const lines = order.slice(0, 4).map(i => pool[i]);
  const decision = company.decisionPool[seed % company.decisionPool.length];
  return { lines, decision };
}

function dedupeLines(lines) {
  return [...new Set(lines || [])];
}

function demoJobReply(company, job) {
  const j = job.trim();
  const seed = hashStr(company.id + j);
  const pick = arr => arr[seed % arr.length];
  const needsDecision = /\?|should we|price|launch|approve|hire|spend/i.test(j) || seed % 3 === 0;
  const work = [
    "Done. " + pick(company.logPool),
    "Also finished: the prep work behind it is filed, so the result can be checked line by line.",
  ].join("\n");
  if (needsDecision) {
    return work + "\n\n" + pick(company.decisionPool) +
      " Answer that and the team picks it up from there.";
  }
  return work + "\n\nNothing here needs a human decision. The full output is in today's log.";
}

// ---------- daily log (live with key, cached per company per day) ----------

async function getDailyLog(company, force) {
  const cacheKey = LS_LOG + company.id + "." + todayStr();
  if (!force) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        parsed.lines = dedupeLines(parsed.lines);
        return parsed;
      } catch {}
    }
  }
  let result;
  if (state.apiKey) {
    try {
      const sys =
        "You are the agent team of " + company.name + ", a company that does: " + company.business + ". " +
        "Your team roles are Research, Outreach, Builder and Reports. Write today's work log for " + todayStr() + ". " +
        "Output exactly 4 short lines, each starting with the role name and a colon, describing concrete finished work (invent plausible specifics like counts and names). " +
        "Then one final line starting with 'Decision needed:' describing one choice only the human owner can make. Plain text only, no heading, no markdown.";
      const text = await chatCompletion([
        { role: "system", content: sys },
        { role: "user", content: "Write today's work log for " + company.name + "." },
      ]);
      const rawLines = text.split("\n").map(s => s.trim()).filter(Boolean);
      const decisionLine = rawLines.find(l => /^decision needed:/i.test(l));
      const lines = dedupeLines(rawLines.filter(l => l !== decisionLine)).slice(0, 5);
      result = {
        lines,
        decision: decisionLine ? decisionLine.replace(/^decision needed:\s*/i, "Decision needed: ") : "",
        live: true,
      };
    } catch (err) {
      result = { ...demoDailyLog(company), live: false, note: "Live call failed (" + err.message + "). Showing demo output instead; no Pollen was spent on this view." };
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    }
  } else {
    result = { ...demoDailyLog(company), live: false };
  }
  localStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}

// ---------- navigation ----------

function showView(name) {
  state.view = name;
  $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.nav === name));
  if (name === "directory") renderDirectory();
  window.scrollTo({ top: 0 });
}

$$(".nav-btn").forEach(b => b.addEventListener("click", () => showView(b.dataset.nav)));
document.addEventListener("click", e => {
  const t = e.target.closest("[data-nav]");
  if (t && t.tagName === "BUTTON" && !t.classList.contains("nav-btn")) showView(t.dataset.nav);
});

// ---------- tower ----------

const FLOOR_H = 64, FLOOR_GAP = 6, FLOOR_W = 340, FLOOR_D = 130;
const TOP_FLOOR = 9;

function floorData() {
  const rows = [];
  for (let f = TOP_FLOOR; f >= 1; f--) {
    const company = window.COMPANIES.find(c => c.floor === f);
    rows.push({ floor: f, company: company || null });
  }
  return rows;
}

function buildTower() {
  const b = $("#building");
  b.innerHTML = "";
  b.style.setProperty("--ry", state.ry + "deg");
  const rows = floorData();
  const total = rows.length;
  rows.forEach((row, idxFromTop) => {
    const i = total - 1 - idxFromTop; // 0 = lobby at bottom
    const wrap = document.createElement("div");
    wrap.className = "floor3d";
    wrap.style.bottom = (i * (FLOOR_H + FLOOR_GAP)) + "px";
    wrap.dataset.floor = row.floor;

    const front = document.createElement("div");
    front.className = "face front";
    const side = document.createElement("div");
    side.className = "face side";

    if (row.floor === 1) {
      front.innerHTML = '<div class="lobby-label">LOBBY · DIRECTORY INSIDE</div>';
      side.innerHTML = "";
    } else if (row.company) {
      const litSeed = hashStr(row.company.id);
      let wins = "";
      for (let w = 0; w < 14; w++) {
        const lit = (litSeed >> (w % 24)) & 1;
        wins += '<span class="win' + (lit ? " lit" : "") + '" style="--a:' + row.company.accent + '"></span>';
      }
      front.innerHTML =
        '<span class="floor-no">' + row.floor + "</span>" +
        '<span class="floor-name">' + esc(row.company.name) + "</span>" +
        '<span class="windows">' + wins + "</span>";
      side.innerHTML = '<span class="side-name">' + esc(row.company.name.split(" ")[0]) + "</span>";
    } else {
      front.innerHTML =
        '<span class="floor-no">' + row.floor + "</span>" +
        '<span class="floor-name vacant">VACANT · NEXT OFFICE</span>' +
        '<span class="windows dark">' + '<span class="win"></span>'.repeat(14) + "</span>";
      side.innerHTML = '<span class="side-name">···</span>';
    }
    const tapFloor = () => selectFloor(row.floor, true);
    front.addEventListener("click", tapFloor);
    side.addEventListener("click", tapFloor);
    side.style.cursor = "pointer";
    wrap.appendChild(front);
    wrap.appendChild(side);
    b.appendChild(wrap);
  });

  // roof sign
  const roof = document.createElement("div");
  roof.className = "roof-sign";
  roof.style.bottom = (total * (FLOOR_H + FLOOR_GAP) + 8) + "px";
  roof.textContent = "THE TOWER";
  b.appendChild(roof);

  // elevator buttons
  const el = $("#elevator");
  el.innerHTML = "";
  for (let f = TOP_FLOOR; f >= 1; f--) {
    const btn = document.createElement("button");
    btn.className = "lift-btn";
    btn.textContent = f;
    btn.dataset.floor = f;
    btn.addEventListener("click", () => selectFloor(f, true));
    el.appendChild(btn);
  }
  markSelected();
}

function markSelected() {
  $$(".floor3d").forEach(el => {
    el.classList.toggle("selected", Number(el.dataset.floor) === state.selectedFloor);
  });
  $$(".lift-btn").forEach(el => {
    el.classList.toggle("active", Number(el.dataset.floor) === state.selectedFloor);
  });
  // gentle lift: shift the building so the selected floor sits mid-scene.
  // Clamped: the full building plus its roof sign is about 720px tall from
  // its base, so a bigger upward shift would push the sign out of the scene.
  const idx = state.selectedFloor - 1; // 0 bottom
  const shift = Math.max(-26, Math.min(26, (idx - 4) * -9));
  $("#building-pos").style.transform = "translate(-50%, " + shift + "px)";
}

function selectFloor(f, render) {
  state.selectedFloor = f;
  markSelected();
  if (render) renderFloorPanel();
}

function renderFloorPanel() {
  const panel = $("#floor-panel");
  const f = state.selectedFloor;
  if (f === 1) {
    panel.innerHTML =
      '<div class="panel-card"><h3>Lobby</h3>' +
      "<p>The directory board lists every company in the building. One human per floor, agents doing the daily work around them.</p>" +
      '<button class="btn primary" data-goto-directory>Open the directory</button> ' +
      '<button class="btn" data-goto-rent>Rent floor 9</button></div>';
  } else {
    const company = window.COMPANIES.find(c => c.floor === f);
    if (company) {
      panel.innerHTML =
        '<div class="panel-card"><div class="panel-floor">Floor ' + f + "</div>" +
        "<h3>" + esc(company.name) + "</h3>" +
        '<p class="panel-biz">' + esc(company.business) + "</p>" +
        '<p class="panel-owner">Run by <strong>' + esc(company.owner.name) + "</strong> and " + company.team.length + " agents.</p>" +
        "<p>" + esc(company.pitch) + "</p>" +
        '<button class="btn primary" data-enter="' + company.id + '">Step into the office</button></div>';
    } else {
      const apps = applications();
      panel.innerHTML =
        '<div class="panel-card"><div class="panel-floor">Floor ' + f + "</div>" +
        "<h3>Vacant</h3><p>The next office. One company, one human, a team of agents. It could be yours.</p>" +
        (apps.length ? '<p class="small">' + apps.length + " application" + (apps.length > 1 ? "s" : "") + " pending review.</p>" : "") +
        '<button class="btn primary" data-goto-rent>Apply to rent it</button></div>';
    }
  }
  const d = $('[data-goto-directory]', panel);
  if (d) d.addEventListener("click", () => showView("directory"));
  const r = $('[data-goto-rent]', panel);
  if (r) r.addEventListener("click", () => showView("rent"));
  const en = $('[data-enter]', panel);
  if (en) en.addEventListener("click", () => openOffice(en.dataset.enter));
}

// drag to rotate, tap a floor to visit it.
// Pointer capture is taken only once a real drag is underway: capturing on
// pointerdown retargets the following click to the scene, which is why
// floor clicks used to do nothing. A press that never moves is a tap, and
// the floor it started on gets selected here as well as by the face's own
// click handler, so the tap lands either way.
(function initDrag() {
  const scene = $("#scene");
  let dragging = false, moved = false, startX = 0, startRy = 0, downFloor = null;
  scene.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) return;
    dragging = true; moved = false; startX = e.clientX; startRy = state.ry;
    const wrap = e.target.closest(".floor3d");
    downFloor = wrap ? Number(wrap.dataset.floor) : null;
  });
  scene.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved) {
      if (Math.abs(dx) <= 6) return;
      moved = true;
      try { scene.setPointerCapture(e.pointerId); } catch {}
    }
    state.ry = Math.max(-38, Math.min(38, startRy + dx * 0.25));
    $("#building").style.setProperty("--ry", state.ry + "deg");
  });
  ["pointerup", "pointercancel"].forEach(ev => scene.addEventListener(ev, e => {
    if (ev === "pointerup" && dragging && !moved && downFloor !== null) {
      selectFloor(downFloor, true);
    }
    dragging = false; moved = false; downFloor = null;
  }));
})();

// ---------- directory ----------

function renderDirectory() {
  const list = $("#directory-list");
  const rows = floorData().slice().reverse(); // floor 1 first
  list.innerHTML = rows.map(row => {
    if (row.floor === 1) {
      return '<div class="dir-row lobby"><span class="dir-floor">1</span><div><strong>Lobby</strong><span class="dir-biz">Directory, mailboxes, the good coffee machine.</span></div></div>';
    }
    if (!row.company) {
      return '<div class="dir-row vacant"><span class="dir-floor">' + row.floor + '</span><div><strong>Vacant office</strong><span class="dir-biz">Next company wanted. Applications open.</span></div><button class="btn small" data-goto-rent2>Apply</button></div>';
    }
    const c = row.company;
    return '<div class="dir-row"><span class="dir-floor" style="--a:' + c.accent + '">' + c.floor + "</span>" +
      "<div><strong>" + esc(c.name) + '</strong><span class="dir-biz">' + esc(c.business) + " · " + esc(c.owner.name) + "</span></div>" +
      '<button class="btn small" data-enter="' + c.id + '">Visit office</button></div>';
  }).join("");
  $$("[data-enter]", list).forEach(b => b.addEventListener("click", () => openOffice(b.dataset.enter)));
  const r2 = $("[data-goto-rent2]", list);
  if (r2) r2.addEventListener("click", () => showView("rent"));

  const apps = applications();
  const box = $("#directory-apps");
  if (apps.length) {
    box.innerHTML = '<h3 class="apps-title">Applications pending review</h3>' + apps.map(a =>
      '<div class="dir-row pending"><span class="dir-floor">9</span><div><strong>' + esc(a.company) +
      '</strong><span class="dir-biz">' + esc(a.business) + " · applied by " + esc(a.owner) +
      " · wants agents: " + esc((a.roles || []).join(", ") || "none picked") + "</span></div>" +
      '<span class="pending-tag">pending</span></div>'
    ).join("");
  } else {
    box.innerHTML = "";
  }
}

// ---------- office ----------

async function openOffice(id) {
  const company = companyById(id);
  if (!company) return;
  state.officeId = id;
  selectFloor(company.floor, false);
  showView("office");
  const box = $("#office-content");
  box.innerHTML =
    '<div class="office-head"><span class="office-floor" style="--a:' + company.accent + '">Floor ' + company.floor + "</span>" +
    "<h2>" + esc(company.name) + "</h2>" +
    '<p class="office-biz">' + esc(company.business) + "</p>" +
    '<p class="office-owner"><span class="avatar">' + esc(company.owner.name.split(" ").map(w => w[0]).join("")) + "</span> " +
    "<strong>" + esc(company.owner.name) + "</strong>, the one human. " + esc(company.owner.note) + "</p></div>" +
    '<div class="team-grid">' + company.team.map(a =>
      '<div class="agent-card"><div class="agent-role">' + esc(a.role) + '</div><div class="agent-name">' + esc(a.name) +
      '</div><p>' + esc(a.duty) + '</p><span class="agent-status"><i></i>working</span></div>'
    ).join("") + "</div>" +
    '<div class="log-card"><div class="log-head"><h3>What the agents did today</h3>' +
    '<button class="btn small ghost" id="log-refresh">Regenerate</button></div>' +
    '<div id="log-body"><p class="small">The team is writing today\'s log…</p></div></div>' +
    '<div class="job-card"><h3>Give the team a job</h3>' +
    '<p class="small">The agents bring back finished work, or the questions they need a human decision on. ' +
    (state.apiKey ? "Running on your Pollen." : "Demo mode: connect your Pollen key and the team runs live.") + "</p>" +
    '<div class="job-examples">' + company.exampleJobs.map(j => '<button class="chip" data-job="' + esc(j) + '">' + esc(j) + "</button>").join("") + "</div>" +
    '<textarea id="job-input" rows="3" placeholder="e.g. ' + esc(company.exampleJobs[0]) + '"></textarea>' +
    '<button class="btn primary" id="job-send">Send to the team</button>' +
    '<div id="job-out"></div></div>';

  $$("[data-job]", box).forEach(chip => chip.addEventListener("click", () => { $("#job-input").value = chip.dataset.job; }));
  $("#job-send").addEventListener("click", () => runJob(company));
  $("#log-refresh").addEventListener("click", () => loadLog(company, true));
  loadLog(company, false);
}

async function loadLog(company, force) {
  const body = $("#log-body");
  if (!body) return;
  body.innerHTML = '<p class="small">The team is writing today\'s log…</p>';
  const log = await getDailyLog(company, force);
  if (!$("#log-body")) return;
  $("#log-body").innerHTML =
    '<ul class="log-lines">' + log.lines.map(l => "<li>" + esc(l) + "</li>").join("") + "</ul>" +
    (log.decision ? '<div class="decision-box">' + esc(log.decision) + "</div>" : "") +
    '<p class="log-meta">' + (log.live
      ? "Written by the " + esc(company.name) + " agents on Pollinations (" + MODEL + "), paid with your Pollen. Cached for today on this device."
      : (log.note ? esc(log.note) : "Demo log. Connect your Pollen key and the agents write it live on Pollinations (" + MODEL + ").")) + "</p>";
}

async function runJob(company) {
  const input = $("#job-input");
  const out = $("#job-out");
  const job = input.value.trim();
  if (!job) { out.innerHTML = '<p class="small warn">Write a job first.</p>'; return; }
  const btn = $("#job-send");
  btn.disabled = true;
  out.innerHTML = '<p class="small">The team is on it…</p>';
  let reply, live = false, note = "";
  if (state.apiKey) {
    try {
      const sys =
        "You are the agent team lead of " + company.name + " (" + company.business + "). " +
        "Your team: Research, Outreach, Builder, Reports. The owner gives you a job. " +
        "Answer like the Towers pattern: deliver the finished work, concise and concrete (invent plausible specifics), " +
        "or, if a human decision is genuinely needed first, present the finished prep work and end with a line starting 'Decision needed:' followed by the specific question(s). " +
        "No preamble, no markdown tables. Keep it under 180 words.";
      reply = await chatCompletion([
        { role: "system", content: sys },
        { role: "user", content: job },
      ]);
      live = true;
    } catch (err) {
      reply = demoJobReply(company, job);
      note = "Live call failed (" + err.message + "). Demo reply instead; no Pollen spent.";
    }
  } else {
    reply = demoJobReply(company, job);
  }
  btn.disabled = false;
  out.innerHTML =
    '<div class="job-reply"><div class="job-reply-head">' + esc(company.name) + " team</div>" +
    reply.split("\n").filter(Boolean).map(p => "<p>" + esc(p) + "</p>").join("") +
    '<p class="log-meta">' + (live
      ? "Finished by the agents on Pollinations (" + MODEL + "), paid with your Pollen."
      : (note || "Demo reply. Connect your Pollen key for the live team.")) + "</p></div>";
}

$("#office-back").addEventListener("click", () => showView("tower"));

// ---------- rent form ----------

$("#rent-form").addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const app = {
    company: fd.get("company"),
    owner: fd.get("owner"),
    business: fd.get("business"),
    why: fd.get("why"),
    roles: fd.getAll("roles"),
    at: new Date().toISOString(),
  };
  const apps = applications();
  apps.push(app);
  localStorage.setItem(LS_APPS, JSON.stringify(apps));
  $("#rent-done").hidden = false;
  e.target.querySelectorAll("input,textarea").forEach(el => { el.value = ""; });
});

// ---------- wallet / BYOP ----------

function renderWallet() {
  const st = $("#wallet-status");
  if (state.apiKey) {
    st.textContent = "Connected · your Pollen";
    st.className = "wallet-status live";
    $("#wallet-btn").textContent = "Wallet";
  } else {
    st.textContent = "Demo mode";
    st.className = "wallet-status demo";
    $("#wallet-btn").textContent = "Connect your Pollen";
  }
}

function openWallet() { $("#wallet-modal").hidden = false; renderWalletModal(); }
function closeWallet() { $("#wallet-modal").hidden = true; }
$("#wallet-btn").addEventListener("click", openWallet);
$("#wallet-close").addEventListener("click", closeWallet);
$("#wallet-modal").addEventListener("click", e => { if (e.target.id === "wallet-modal") closeWallet(); });

function renderWalletModal() {
  const note = $("#byop-note");
  const btn = $("#byop-btn");
  if (!POLLINATIONS_APP_KEY) {
    note.textContent = "One-click sign-in needs an App Key registered for this page (enter.pollinations.ai/keys). The building ships without one, so use paste-a-key below, or register a key and set POLLINATIONS_APP_KEY in app.js.";
    btn.disabled = true;
    btn.classList.add("disabled");
    btn.setAttribute("aria-disabled", "true");
    btn.title = "Unavailable: no App Key is registered for this page yet";
  } else {
    note.textContent = "";
    btn.disabled = false;
    btn.classList.remove("disabled");
    btn.removeAttribute("aria-disabled");
    btn.removeAttribute("title");
  }
  $("#key-clear").hidden = !state.apiKey;
  $("#key-msg").textContent = state.apiKey ? "A key is connected on this device." : "";
}

// PKCE helpers (OAuth code flow from BRING_YOUR_OWN_POLLEN.md)
function b64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return b64url(buf);
}

$("#byop-btn").addEventListener("click", async () => {
  if (!POLLINATIONS_APP_KEY) return;
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = await sha256(verifier);
  const csrf = b64url(crypto.getRandomValues(new Uint8Array(16)));
  sessionStorage.setItem(LS_PKCE, JSON.stringify({ verifier, csrf }));
  const params = new URLSearchParams({
    response_type: "code",
    client_id: POLLINATIONS_APP_KEY,
    redirect_uri: location.origin + location.pathname,
    scope: "profile usage",
    models: "text",
    budget: "10",
    expiry: "7",
    state: csrf,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  location.href = "https://enter.pollinations.ai/authorize?" + params.toString();
});

async function handleAuthReturn() {
  // Legacy fragment flow: #api_key=sk_...
  if (location.hash.includes("api_key=")) {
    const frag = new URLSearchParams(location.hash.slice(1));
    const key = frag.get("api_key");
    if (key) {
      state.apiKey = key;
      localStorage.setItem(LS_KEY, key);
      history.replaceState(null, "", location.pathname + location.search);
      renderWallet();
      return;
    }
  }
  // OAuth code flow: ?code=...
  const q = new URLSearchParams(location.search);
  const code = q.get("code");
  if (code && POLLINATIONS_APP_KEY) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(LS_PKCE) || "null");
      if (saved && q.get("state") === saved.csrf) {
        const res = await fetch("https://enter.pollinations.ai/api/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: POLLINATIONS_APP_KEY,
            redirect_uri: location.origin + location.pathname,
            code_verifier: saved.verifier,
          }),
        });
        const data = await res.json();
        if (data.access_token) {
          state.apiKey = data.access_token;
          localStorage.setItem(LS_KEY, data.access_token);
        }
      }
    } catch {}
    sessionStorage.removeItem(LS_PKCE);
    history.replaceState(null, "", location.pathname);
    renderWallet();
  }
}

$("#key-save").addEventListener("click", async () => {
  const input = $("#key-input");
  const msg = $("#key-msg");
  const key = input.value.trim();
  if (!key) { msg.textContent = "Paste a key first."; return; }
  msg.textContent = "Checking the key…";
  try {
    await validateKey(key);
    state.apiKey = key;
    localStorage.setItem(LS_KEY, key);
    input.value = "";
    msg.textContent = "Connected. The agents now spend your Pollen, on your key only.";
    renderWallet();
    renderWalletModal();
  } catch (err) {
    msg.textContent = "That key did not check out (" + err.message + "). Nothing was saved.";
  }
});

$("#key-clear").addEventListener("click", () => {
  state.apiKey = "";
  localStorage.removeItem(LS_KEY);
  $("#key-msg").textContent = "Disconnected. The building is back in demo mode.";
  renderWallet();
  renderWalletModal();
});

// ---------- boot ----------

function applyHash() {
  const h = location.hash.replace(/^#\/?/, "");
  const m = h.match(/^office\/(.+)$/);
  if (m && companyById(m[1])) { openOffice(m[1]); return; }
  if (h === "directory") showView("directory");
  else if (h === "rent") showView("rent");
}

(async function boot() {
  await handleAuthReturn();
  buildTower();
  renderFloorPanel();
  renderWallet();
  applyHash();
})();
