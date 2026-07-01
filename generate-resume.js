/* generate-resume.js — tailors Bhaavan's resume to a specific job using Claude,
 * fills resume-template.html, and writes resumes/resume_<jobId>.html.
 *
 * Env:
 *   ANTHROPIC_API_KEY  — Anthropic API key
 *   JOB_ID             — id of the job in jobs.json to tailor for
 *
 * Personal details (name, phone, email, education) are fixed in the template.
 * Claude only rewrites: SUMMARY, experience/project bullets (emphasis + ordering),
 * and the SKILLS block — never inventing new facts. All metrics stay intact.
 */

const fs = require("fs");

const MODEL = "claude-haiku-4-5-20251001";
const API_KEY = process.env.ANTHROPIC_API_KEY;
const JOB_ID = process.env.JOB_ID;

function loadJob(id) {
  const data = JSON.parse(fs.readFileSync("jobs.json", "utf8"));
  const jobs = data.jobs || data;
  const job = jobs.find(j => j.id === id);
  if (!job) throw new Error(`Job ${id} not found in jobs.json`);
  return job;
}

async function callClaude(job, base) {
  const prompt = `You are tailoring a resume for this candidate to a specific job.
Return ONLY a JSON object with these string keys (HTML <li> items where noted):
  "summary"    : 2-sentence professional summary tuned to the job (plain text).
  "exp_iu"     : 3 <li> bullets for the IU Research Fellow role, reordered/emphasized for this job.
  "exp_ysb"    : 3 <li> bullets for the Youth Service Bureau Data Intern role.
  "proj_ecom"  : 3 <li> bullets for the E-commerce Customer 360 project.
  "proj_yolo"  : 3 <li> bullets for the Trash Classification YOLO project.
  "skills"     : HTML <p> lines grouping the most relevant skills FIRST for this job.
  "match_pct"  : integer 0-100, how well the candidate matches the job.

RULES: Use ONLY facts from the candidate profile below. Keep every metric exactly. Do not invent tools or experience. Reorder and re-emphasize to fit the job.

=== CANDIDATE PROFILE ===
${base}

=== JOB ===
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${(job.description || "").slice(0, 4000)}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const text = json.content.map(c => c.text).join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in Claude response");
  return JSON.parse(match[0]);
}

function fill(template, t) {
  return template
    .replace("{{SUMMARY}}", t.summary || "")
    .replace("{{EXP_IU}}", t.exp_iu || "")
    .replace("{{EXP_YSB}}", t.exp_ysb || "")
    .replace("{{PROJ_ECOM}}", t.proj_ecom || "")
    .replace("{{PROJ_YOLO}}", t.proj_yolo || "")
    .replace("{{SKILLS}}", t.skills || "");
}

async function main() {
  if (!API_KEY) { console.error("Missing ANTHROPIC_API_KEY"); process.exit(1); }
  if (!JOB_ID)  { console.error("Missing JOB_ID"); process.exit(1); }

  const job = loadJob(JOB_ID);
  const base = fs.readFileSync("resume-base.txt", "utf8");
  const template = fs.readFileSync("resume-template.html", "utf8");

  const tailored = await callClaude(job, base);
  const html = fill(template, tailored);

  fs.mkdirSync("resumes", { recursive: true });
  const out = `resumes/resume_${JOB_ID}.html`;
  fs.writeFileSync(out, html);
  console.log(`Wrote ${out} — match ${tailored.match_pct}%`);
}

main().catch(e => { console.error(e); process.exit(1); });
