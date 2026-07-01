# Job Search Tracker — Bhaavan Myneni

A personal job-search dashboard that automatically fetches **Data Scientist / Data Engineer / ML Engineer / Data Analyst** roles daily, scores them against my profile, flags **visa-sponsorship** signals, tracks application status, and generates tailored resumes — all in one page.

**Live dashboard:** `https://<your-github-username>.github.io/job_search_tool` (after you enable Pages)

Adapted from the architecture of [sajjavenkataavinash/Job_search_tool](https://github.com/sajjavenkataavinash/Job_search_tool), retuned for my profile and filters.

---

## What it does

- **Daily fetch** — GitHub Actions runs each morning (9 AM ET), pulls US + remote full-time DS/DE/ML/Analyst roles posted in the last week via the JSearch API (LinkedIn, Indeed, Glassdoor, ZipRecruiter).
- **Profile matching** — Each job is scored 0–10 against my keywords (Python, SQL, PySpark, Airflow, BigQuery, TensorFlow, etc.). Director/VP/Principal/Staff/Lead/Manager titles are auto-excluded.
- **Sponsorship awareness** — Jobs are flagged `Sponsor-friendly`, `No sponsorship`, or `Unknown` by scanning the description for visa/citizenship/clearance language. Filter to hide no-sponsorship postings.
- **Application tracking** — Per-job status (Not Applied → Applied → In Interview → Rejected), saved in your browser.
- **Filters & sort** — By role, status, source, match tier, sponsorship, plus best-match / newest sort and free-text search.
- **Tailored resumes** — Generate a role-specific resume on demand via Claude, filled into my HTML resume template.

## Setup (one time)

1. **Create a GitHub repo** named `job_search_tool` and push these files.
2. **Set your username** — in `main.js`, replace `REPLACE_WITH_GITHUB_USERNAME` with your GitHub username.
3. **Add repository secrets** — repo → Settings → Secrets and variables → Actions → New repository secret:
   | Secret | Where to get it |
   | --- | --- |
   | `RAPIDAPI_KEY` | Subscribe to **JSearch** (BASIC plan) at rapidapi.com |
   | `ANTHROPIC_API_KEY` | console.anthropic.com (only needed for resume generation) |
4. **Enable GitHub Pages** — repo → Settings → Pages → Source: *Deploy from a branch* → Branch: `main` → Folder: `/ (root)`.
5. Open the Pages URL. It loads `jobs.json` (already seeded with real jobs so it works immediately).

## How to use

1. Open the dashboard.
2. Click **Fetch New Jobs** to open the Actions page and trigger a fresh pull (or wait for the daily run).
3. Filter/sort, click **View** to open a listing.
4. Update **Application Status** per row (saved in your browser).
5. To tailor a resume: Actions → *Generate Resume* → Run workflow → enter a `job_id` from `jobs.json`. The resume lands in `resumes/resume_<id>.html`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` / `style.css` / `main.js` | Dashboard UI + logic |
| `fetch-jobs.js` | Fetches, scores, dedupes jobs → `jobs.json` |
| `generate-resume.js` | Tailors resume via Claude → `resumes/` |
| `resume-template.html` | Resume layout with `{{PLACEHOLDER}}` markers |
| `resume-base.txt` | My factual profile (source of truth for tailoring) |
| `jobs.json` | Job data store (auto-updated daily; seeded) |
| `.github/workflows/fetch-jobs.yml` | Daily + manual fetch |
| `.github/workflows/generate-resume.yml` | On-demand resume generation |
| `profile_memory.md` | My full profile & job-search preferences |

## Customizing the filters

Edit `fetch-jobs.js`:
- `QUERIES` — the role searches (and their category label).
- `KEYWORDS` — profile keywords for match scoring.
- `EXCLUDE_TITLE` — seniority terms to drop.
- `NO_SPONSOR` / `YES_SPONSOR` — sponsorship signal patterns.

## Notes

- JSearch BASIC is rate-limited (~200 requests/month). The daily run uses ~6 requests, well within limits.
- No API key is stored in the site — the dashboard only reads the committed `jobs.json`. Fetching/resume generation happen server-side in Actions.
