(function () {
  const { SHEET_CSV_URL, FALLBACK_CSV, SUBMIT_IDEA_URL, BOOK_OFFICE_HOURS_URL } = window.PITCHFEST_CONFIG;
  const $ = (id) => document.getElementById(id);
  [["btn-submit", SUBMIT_IDEA_URL], ["btn-partner", PARTNER_URL], ["btn-office-hours", BOOK_OFFICE_HOURS_URL]].forEach(([id, url]) => {
    if (url) { $(id).href = url; $(id).hidden = false; }
  });
  const state = { projects: [], theme: "All", query: "" };

  // RFC 4180 parser: handles quoted fields, escaped quotes, and embedded newlines.
  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", inQuotes = false;
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
        } else field += c;
      } else if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        rows.push(row); row = [];
      } else field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows.filter((r) => r.some((v) => v.trim() !== ""));
  }

  function toProjects(rows) {
    const [header, ...body] = rows;
    const keys = header.map((h) => h.trim());
    return body.map((r, i) => {
      const o = {};
      keys.forEach((k, j) => (o[k] = (r[j] || "").trim()));
      o.id = i;
      return o;
    }).filter((p) => p["Title"]);
  }

  async function load() {
    const sources = [SHEET_CSV_URL, FALLBACK_CSV].filter(Boolean);
    for (const url of sources) {
      try {
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) throw new Error(res.status);
        const projects = toProjects(parseCSV(await res.text()));
        if (projects.length) return projects;
      } catch (e) {
        console.warn("Could not load", url, e);
      }
    }
    return [];
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function excerpt(s, n = 180) {
    return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s;
  }

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function renderFilters() {
    const themes = ["All", ...new Set(state.projects.map((p) => p.Theme).filter(Boolean))];
    $("filters").innerHTML = themes.map((t) =>
      `<button type="button" class="chip" aria-pressed="${t === state.theme}" data-theme="${esc(t)}">${esc(t)}</button>`
    ).join("");
  }

  function visible() {
    const q = state.query.toLowerCase();
    return state.projects.filter((p) =>
      (state.theme === "All" || p.Theme === state.theme) &&
      (!q || Object.values(p).join(" ").toLowerCase().includes(q)));
  }

  function renderGrid() {
    const list = visible();
    $("count").textContent = `Showing ${list.length} of ${state.projects.length} projects`;
    $("status").hidden = list.length > 0;
    if (!list.length) $("status").textContent = "No projects match your search.";
    const groups = new Map();
    list.forEach((p) => {
      if (!groups.has(p.Theme)) groups.set(p.Theme, []);
      groups.get(p.Theme).push(p);
    });
    $("grid").innerHTML = [...groups].map(([theme, items]) => `
      <section class="theme-section" aria-labelledby="theme-${slug(theme)}">
        <h2 class="theme-heading" id="theme-${slug(theme)}">${esc(theme)}</h2>
        <div class="cards">${items.map((p) => `
          <article class="card">
            <h3>${esc(p.Title)}</h3>
            <p class="presenter">${esc(p["Presenter Name"])}${p["Presenter Title"] ? " · " + esc(p["Presenter Title"]) : ""}</p>
            <p>${esc(excerpt(p["Question"] || p["Background Info"]))}</p>
            <button type="button" class="link" data-id="${p.id}">Read the brief →</button>
          </article>`).join("")}
        </div>
      </section>`).join("");
  }

  function section(title, text) {
    return text ? `<h3>${title}</h3><p>${esc(text)}</p>` : "";
  }

  function openModal(id) {
    const p = state.projects.find((x) => x.id === id);
    if (!p) return;
    $("modal-body").innerHTML = `
      <span class="tag">${esc(p.Theme)}</span>
      <h2 id="modal-title">${esc(p.Title)}</h2>
      <p class="presenter">${esc(p["Presenter Name"])}${p["Presenter Title"] ? " · " + esc(p["Presenter Title"]) : ""}</p>
      ${section("Question", p["Question"])}
      ${section("Background", p["Background Info"])}
      ${section("Desired outcomes", p["Outcomes"])}
      ${section("Resources offered", p["Resources"])}
      ${section("Expertise sought", p["Expertise"])}`;
    const m = $("modal");
    if (!m.open) m.showModal();
    history.replaceState(null, "", "#project-" + id);
  }

  function closeModal() {
    if ($("modal").open) $("modal").close();
  }

  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) { state.theme = chip.dataset.theme; renderFilters(); renderGrid(); return; }
    const link = e.target.closest(".link");
    if (link) openModal(Number(link.dataset.id));
  });
  $("search").addEventListener("input", (e) => { state.query = e.target.value.trim(); renderGrid(); });
  $("modal-close").addEventListener("click", closeModal);
  $("modal").addEventListener("click", (e) => { if (e.target === $("modal")) closeModal(); });
  $("modal").addEventListener("close", () => history.replaceState(null, "", location.pathname + location.search));

  load().then((projects) => {
    state.projects = projects;
    if (!projects.length) { $("status").textContent = "Projects could not be loaded. Please try again later."; return; }
    renderFilters();
    renderGrid();
    const m = location.hash.match(/^#project-(\d+)$/);
    if (m) openModal(Number(m[1]));
  });
})();
