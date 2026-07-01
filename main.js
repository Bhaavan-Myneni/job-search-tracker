/* Job Search Tracker — dashboard logic (Bhaavan Myneni)
 * Loads jobs.json, renders a filterable table, tracks application status in localStorage.
 * No framework, no build step. */

// ---- Config ----
const GH_USER = "Bhaavan-Myneni";
const GH_REPO = "job-search-tracker";
const FETCH_WORKFLOW = "fetch-jobs.yml";
const STORAGE_KEY = "bm_job_status";

// ---- State ----
let ALL_JOBS = [];
let statusMap = loadStatus();

// ---- Boot ----
document.addEventListener("DOMContentLoaded", init);

function init() {
  // "Fetch New Jobs" points at the GitHub Actions run page
  const fetchBtn = document.getElementById("fetchBtn");
  fetchBtn.href = `https://github.com/${GH_USER}/${GH_REPO}/actions/workflows/${FETCH_WORKFLOW}`;

  document.getElementById("refreshBtn").addEventListener("click", () => loadJobs(true));
  ["searchInput","roleFilter","statusFilter","sourceFilter","matchFilter","sponsorFilter","sortBy"]
    .forEach(id => document.getElementById(id).addEventListener("input", render));

  loadJobs();
}

// ---- Data ----
async function loadJobs(bust) {
  try {
    const url = "jobs.json" + (bust ? `?t=${Date.now()}` : "");
    const res = await fetch(url, { cache: bust ? "no-store" : "default" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    ALL_JOBS = Array.isArray(data) ? data : (data.jobs || []);
    const updated = (data.updated_at) ? new Date(data.updated_at) : null;
    document.getElementById("lastUpdated").textContent =
      updated ? `Updated ${updated.toLocaleDateString()} ${updated.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}` : "";
  } catch (e) {
    ALL_JOBS = [];
    document.getElementById("lastUpdated").textContent = "No data yet";
  }
  populateSources();
  render();
}

// Populate the Source filter with every source present in the data
function populateSources() {
  const sel = document.getElementById("sourceFilter");
  const current = sel.value;
  const sources = [...new Set(ALL_JOBS.map(j => j.source).filter(Boolean))].sort();
  sel.innerHTML = '<option value="">All Sources</option>' +
    sources.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
  if ([...sel.options].some(o => o.value === current)) sel.value = current;
}

// ---- Render ----
function render() {
  const q = val("searchInput").toLowerCase();
  const role = val("roleFilter");
  const status = val("statusFilter");
  const source = val("sourceFilter");
  const match = val("matchFilter");
  const sponsor = val("sponsorFilter");
  const sort = val("sortBy");

  let jobs = ALL_JOBS.filter(j => {
    const st = statusMap[j.id] || "Not Applied";
    if (q && !(`${j.title} ${j.company}`.toLowerCase().includes(q))) return false;
    if (role && j.role_category !== role) return false;
    if (status && st !== status) return false;
    if (source && j.source !== source) return false;
    if (match) {
      const s = j.match_score || 0;
      if (match === "high" && s < 7) return false;
      if (match === "medium" && (s < 4 || s > 6)) return false;
      if (match === "low" && (s < 1 || s > 3)) return false;
    }
    if (sponsor === "friendly" && j.sponsorship !== "friendly") return false;
    if (sponsor === "hide" && j.sponsorship === "no") return false;
    return true;
  });

  jobs.sort((a,b) => sort === "newest"
    ? new Date(b.posted_at||0) - new Date(a.posted_at||0)
    : (b.match_score||0) - (a.match_score||0));

  const body = document.getElementById("jobsBody");
  body.innerHTML = jobs.map(rowHTML).join("");
  body.querySelectorAll(".status-select").forEach(sel =>
    sel.addEventListener("change", e => setStatus(e.target.dataset.id, e.target.value)));

  document.getElementById("emptyState").classList.toggle("hidden", jobs.length > 0);
  updateStats();
}

function rowHTML(j) {
  const st = statusMap[j.id] || "Not Applied";
  const s = j.match_score || 0;
  const tier = s >= 7 ? "high" : s >= 4 ? "medium" : "low";
  const stars = "★".repeat(Math.max(1, Math.min(3, Math.ceil(s/3)))) ;
  const sponsorPill = {
    friendly: `<span class="pill friendly">Sponsor-friendly</span>`,
    no: `<span class="pill no">No sponsorship</span>`,
  }[j.sponsorship] || `<span class="pill unknown">Unknown</span>`;
  const posted = j.posted_at ? new Date(j.posted_at).toLocaleDateString() : "—";
  const statuses = ["Not Applied","Applied","In Interview","Rejected"];

  return `<tr>
    <td class="job-role">${esc(j.title)}</td>
    <td class="company">${esc(j.company)}</td>
    <td>${esc(j.location||"—")}</td>
    <td>${posted}</td>
    <td class="match ${tier}">${stars}<span class="score">(${s})</span></td>
    <td>${sponsorPill}</td>
    <td><a class="joblink" href="${esc(j.url)}" target="_blank" rel="noopener">View &#8599;</a></td>
    <td>
      <select class="status-select" data-id="${esc(j.id)}" data-status="${st}">
        ${statuses.map(x => `<option ${x===st?"selected":""}>${x}</option>`).join("")}
      </select>
    </td>
  </tr>`;
}

function updateStats() {
  const weekAgo = Date.now() - 7*864e5;
  const total = ALL_JOBS.length;
  const thisWeek = ALL_JOBS.filter(j => new Date(j.posted_at||0).getTime() >= weekAgo).length;
  const sponsor = ALL_JOBS.filter(j => j.sponsorship === "friendly").length;
  const counts = { Applied:0, "In Interview":0, Rejected:0 };
  ALL_JOBS.forEach(j => { const s = statusMap[j.id]; if (counts[s]!==undefined) counts[s]++; });
  set("statTotal", total);
  set("statToday", thisWeek);
  set("statSponsor", sponsor);
  set("statApplied", counts.Applied);
  set("statInterview", counts["In Interview"]);
  set("statRejected", counts.Rejected);
}

// ---- Status persistence ----
function setStatus(id, status) {
  statusMap[id] = status;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap)); } catch (e) {}
  render();
}
function loadStatus() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
}

// ---- Helpers ----
function val(id){ return document.getElementById(id).value.trim(); }
function set(id,v){ document.getElementById(id).textContent = v; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
