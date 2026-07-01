/* fetch-jobs.js — pulls DS/DE/ML/Analyst jobs via JSearch API (RapidAPI),
 * scores them against Bhaavan's profile, flags visa sponsorship signals,
 * dedupes, and writes jobs.json. Runs in GitHub Actions (Node 20).
 *
 * Env: RAPIDAPI_KEY  (JSearch, subscribe to the BASIC plan on rapidapi.com)
 */

const fs = require("fs");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const OUT_FILE = "jobs.json";
const MAX_JOBS = 300;
const MAX_PAGES = 2;   // pages per query (more pages = broader coverage; uses more JSearch quota)

// Sources that JSearch cannot fetch (auth-gated) and that we add manually,
// e.g. Handshake. Jobs from these sources are PRESERVED across daily runs
// instead of being wiped by the fetch.
const MANUAL_SOURCES = ["Handshake"];

// ---- What we search for ----
const QUERIES = [
  { q: "Data Scientist",            role: "Data Scientist" },
  { q: "Data Engineer",             role: "Data Engineer" },
  { q: "Machine Learning Engineer", role: "ML Engineer" },
  { q: "Data Analyst",              role: "Data Analyst" },
  { q: "Analytics Engineer",        role: "Data Engineer" },
  { q: "Applied Scientist",         role: "ML Engineer" },
];

// ---- Profile keywords (match scoring) ----
const KEYWORDS = [
  "python","sql","pyspark","spark","pandas","scikit-learn","scikit learn","machine learning",
  "deep learning","tensorflow","pytorch","etl","elt","airflow","dbt","kafka","data pipeline",
  "data warehouse","bigquery","snowflake","redshift","postgresql","postgres","mysql","mongodb",
  "aws","gcp","azure","docker","tableau","power bi","statistics","regression","computer vision",
  "yolo","nlp","data engineering","data science","analytics","model deployment","fastapi","flask",
];

// ---- Seniority filter: exclude senior/leadership titles ----
const EXCLUDE_TITLE = /\b(director|vp|vice president|head of|principal|staff|distinguished|sr\.?\s*manager|senior manager|lead\b|architect|manager)\b/i;

// ---- Sponsorship signal detection ----
const NO_SPONSOR = /(no (visa )?sponsorship|not (able|be able) to sponsor|without sponsorship|us citizen(ship)? (required|only)|must be a us citizen|security clearance|secret clearance|active clearance|w2 only|no c2c|gc[- ]?ead only|citizens? or green card)/i;
const YES_SPONSOR = /(visa sponsorship (available|provided|offered)|will sponsor|sponsor(ship)? (available|for the right)|h-?1b|opt|cpt|f-?1|stem opt|cap[- ]exempt)/i;

async function jsearch(query, page = 1) {
  const url = `https://jsearch.p.rapidapi.com/search-v2?query=${encodeURIComponent(query + " jobs in USA")}&page=${page}&num_pages=1&country=us&date_posted=week`;
  const res = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  });
  if (!res.ok) {
    console.error(`JSearch ${query}: HTTP ${res.status}`);
    return [];
  }
  const json = await res.json();
  return json.data || [];
}

function scoreJob(text) {
  const t = text.toLowerCase();
  let hits = 0;
  for (const k of KEYWORDS) if (t.includes(k)) hits++;
  // 0–10 scale; ~2 keyword hits per point, capped
  return Math.max(0, Math.min(10, Math.round(hits * 0.9)));
}

function sponsorship(text) {
  if (NO_SPONSOR.test(text)) return "no";
  if (YES_SPONSOR.test(text)) return "friendly";
  return "unknown";
}

function normalize(job, roleCategory) {
  const desc = job.job_description || "";
  const title = job.job_title || "";
  const blob = `${title}\n${desc}`;
  const loc = [job.job_city, job.job_state].filter(Boolean).join(", ") ||
              (job.job_is_remote ? "Remote" : (job.job_country || ""));
  return {
    id: job.job_id,
    title,
    company: job.employer_name || "",
    location: job.job_is_remote ? `${loc || "US"} (Remote)` : loc,
    posted_at: job.job_posted_at_datetime_utc || null,
    url: job.job_apply_link || job.job_google_link || "",
    source: (job.job_publisher || "Indeed"),
    role_category: roleCategory,
    remote: !!job.job_is_remote,
    match_score: scoreJob(blob),
    sponsorship: sponsorship(blob),
  };
}

function loadPreservedJobs() {
  // Keep manually-added jobs (e.g. Handshake) across daily runs.
  try {
    const prev = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
    const list = prev.jobs || prev || [];
    return list.filter(j => MANUAL_SOURCES.includes(j.source));
  } catch (e) { return []; }
}

async function main() {
  if (!RAPIDAPI_KEY) { console.error("Missing RAPIDAPI_KEY"); process.exit(1); }

  const seen = new Set();
  let jobs = [];

  // Preserve manual-source jobs (Handshake, etc.) first
  const preserved = loadPreservedJobs();
  for (const j of preserved) { if (j.id) { seen.add(j.id); jobs.push(j); } }

  for (const { q, role } of QUERIES) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const raw = await jsearch(q, page);
      for (const r of raw) {
        if (!r.job_id || seen.has(r.job_id)) continue;
        if (EXCLUDE_TITLE.test(r.job_title || "")) continue;   // drop senior/leadership
        seen.add(r.job_id);
        jobs.push(normalize(r, role));
      }
    }
  }

  // Best match first, then newest
  jobs.sort((a,b) => (b.match_score - a.match_score) ||
                     (new Date(b.posted_at||0) - new Date(a.posted_at||0)));
  jobs = jobs.slice(0, MAX_JOBS);

  const payload = { updated_at: new Date().toISOString(), count: jobs.length, jobs };
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${jobs.length} jobs to ${OUT_FILE}`);
}

main().catch(e => { console.error(e); process.exit(1); });
