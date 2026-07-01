# Profile Memory — Bhaavan Myneni

_Last updated: 2026-07-01. This file is the single source of truth for Bhaavan's profile.
Update it whenever anything changes (new role, new skill, new preference)._

## Contact
- **Name:** Bhaavan Myneni
- **Location:** Bloomington, IN, USA
- **Phone:** +1 (930) 333-1573
- **Email:** bmyneni@iu.edu (university) · 20501a05c6@pvpsit.ac.in (undergrad)
- **LinkedIn:** (add URL)
- **GitHub:** https://github.com/Bhaavan-Myneni
- **Portfolio:** (to be built) — MC3 live demo: https://mc3-monroecounty2025.netlify.app

## Education
- **MS, Data Science** — Indiana University Bloomington, Aug 2024 – May 2026 (GPA 3.71/4)
- **B.Tech, Computer Science & Engineering** — Prasad V. Potluri Siddhartha Institute of Technology (PVPSIT), Vijayawada, Jun 2020 – May 2024 (GPA 3.45/4)

## Work Experience
1. **Research Fellow — Faculty Assistance in Data Science (FADS 26)**, Indiana University Bloomington (Jan 2026 – May 2026)
   - Project: Global Muse-Gen / Pix2Pix Floorplan Generator — cross-cultural AI generating museum-style architectural floorplans from colored room-block overlays. (Verified from team hand-off doc, Apr 2026.)
   - Data pipeline: `pdf_to_png` (300 DPI) → Tesseract OCR for room names/sq-ft → wall detection & room segmentation (Hough lines, watershed) → colored room-overlay PNGs; 8× augmentation (rotations/flips). Dataset: 98 museum floorplan pairs (96 valid).
   - Model: **Pix2Pix conditional GAN** — 7-level UNet generator (ngf=32, InstanceNorm, 5-channel input = RGB+mask+centroid) + PatchGAN discriminator (ndf=32, spectral norm, 8-channel input); **Hinge loss + L1 (lambda=100)**; 128×128px; trained 299 epochs on CPU (~7.5h).
   - Root-cause debugging of coordinate scaling; watershed debug overlays validated room boundaries; selected production checkpoint (netG_epoch_299). Stack: PyTorch, OpenCV, Tesseract, NumPy.
2. **Data Intern**, Youth Service Bureau of Monroe County & BTCC (Aug 2025 – Dec 2025)
   - MC3 = Monroe County Childhood Conditions Summit 2025 Data Hub. Repo: github.com/Bhaavan-Myneni/MC3 · Live: mc3-monroecounty2025.netlify.app
   - Built a Python/Pandas ETL pipeline integrating ACS (B25070, S1903), Kids Count, STATSIN, Clinical Care, and CDC WONDER/NCHS mortality data into validated Monroe County indicators; automated inventory across 1,100+ files.
   - Verified 5 indicators (child poverty, graduation rate, unemployment, child population, SNAP) with metric-validation reports that flag inconsistent dashboard claims; PostgreSQL schema + reporting views (optional/Docker).
   - Built a public Chart.js dashboard (housing burden, SNAP food access, suicide-mortality mental-health signal) supporting 6 policy recommendations; deployed static site on Netlify.
   - **Resume-claim note (from repo's Phase 8 audit):** "30% ETL time reduction" is the safe/documented figure (benchmark actually measured 99.9%); "40% accessibility improvement" maps to a 100% rubric improvement. Use the 30%/40% wording — it's the conservative, defensible version. Tableau .twb workbooks exist as evidence.

## Projects (GitHub: github.com/Bhaavan-Myneni)

- **UrbanFlow AI** — NYC ride-hail demand forecasting, dynamic pricing & revenue simulation. Repo: Urbanflow-ai
  - Processed 239M+ FHVHV + 36M yellow-taxi trips (2024) into a PostgreSQL warehouse (2.2M hourly demand aggregates); joined weather (Open-Meteo), events, holidays, 265 taxi zones.
  - XGBoost next-hour demand model: **Test R² = 0.95, MAE ≈ 15 trips/zone-hour**; SHAP explainability.
  - Dynamic pricing engine + revenue simulation: **$144.1M revenue lift (13.64%)** vs static pricing.
  - Served via Streamlit dashboard + FastAPI (`/predict-demand`, `/recommend-price`). Stack: Python, pandas, duckdb, SQLAlchemy, scikit-learn, XGBoost, SHAP, PostgreSQL.

- **Urban Traffic Safety Engine** — computer-vision traffic risk & congestion-cost platform. Repo: urban-traffic-safety-engine
  - YOLOv8 on 29 traffic videos / 26 cameras → **26,699 detections**; flagged **81 near-miss events**; estimated **$20,770 delay cost**.
  - A/B simulation of a protected bike-lane scenario reduced near-misses 81 → 62; RandomForest congestion forecast (RMSE 5.51).
  - PostgreSQL + Apache Airflow DAG, Folium hotspot map (Bloomington, IN), Streamlit dashboard (8 tabs). Deployed on Render. Stack: Python, YOLOv8/Ultralytics, OpenCV, pandas, SQLAlchemy, Airflow, scikit-learn, Plotly.

- **Customer 360 · Churn & Repeat-Buyer Platform** — Olist Brazilian e-commerce. Repo: customer360-churn-repeat-analytics
  - Ingested 1.55M rows into PostgreSQL via COPY; built Customer 360 SQL views at person grain (96,096 customers); leakage-safe feature engineering.
  - XGBoost models: churn **ROC-AUC 0.869**, repeat-buyer **ROC-AUC 0.840** (~20× PR-AUC lift over baseline); diagnosed & fixed a data-leakage bug (dropped cumulative-sum features).
  - SHAP insights, FastAPI prediction API, Streamlit dashboard, fully Dockerized (Docker Compose). Live on Render. Stack: PostgreSQL, SQL, pandas, scikit-learn, XGBoost, SHAP, FastAPI, Docker.

- **E-commerce Sales & Customer 360 (ELT/warehouse version)** (Jan–Aug 2025): End-to-end ELT, 500MB+ into BigQuery; PySpark on 300k+ records; Star Schema (10x faster queries); Airflow + Docker (2h → 15min). _(Earlier warehouse-focused build; the Olist churn platform above is the ML-focused evolution.)_

- **IPL Data-Viz Dashboard** — Repo: ipl-dataviz-dashboard. Streamlit + Jupyter dashboard analyzing IPL match data and team brand value over time. Stack: Python, pandas, Streamlit, Jupyter.

- **Trash Classification & Recycling Assistant using YOLO Variants** (Jan–Mar 2024) — **B.Tech capstone project** at PVPSIT (2023–24), team of 4, guide Dr. G. Lalitha Kumari. 96.24% accuracy comparing YOLOv5/v7; 67.5% mAP@0.5 on 1,370-instance set; custom 4,027-image dataset; real-time detection + SVM. Full project report (85pp) + **published paper with IIETA**. Roll no. 20501A05C6.

## Publications
- "Trash Classification and Recyclability Assistant using YOLO Variants" — published with IIETA.

## Skills
- **Languages/DS:** Python, Pandas, PySpark, scikit-learn, SQL, Java, C++, data mining, regression, statistics
- **Data Engineering:** Airflow, dbt, Kafka, ETL/ELT, Spark/PySpark/SparkSQL, Hadoop
- **Databases/Warehousing:** PostgreSQL, MySQL, MongoDB, Snowflake, BigQuery, Redshift
- **Cloud:** AWS (S3, Glue, Redshift, EMR), GCP (BigQuery, Dataflow), Azure Data Factory
- **ML/AI:** TensorFlow, PyTorch, YOLO, CNNs, model deployment, Flask, FastAPI
- **Visualization:** Tableau, Power BI, Matplotlib, Seaborn
- **Certifications:** NPTEL — Programming/Data Structures in Python, Programming in Java

## Job Search Preferences (drives the tracker filters)
- **Target roles:** Data Scientist, Data Engineer, ML Engineer, Data Analyst (incl. Applied Scientist, Analytics Engineer)
- **Seniority:** Entry-level to mid (New Grad / Junior / Associate). EXCLUDE Director / VP / Head / Principal / Staff / Sr Manager.
- **Location:** United States — anywhere + Remote (US). Open to relocation.
- **Work auth:** International student (F-1 / OPT). **Needs visa sponsorship** — prioritize sponsor-friendly / cap-exempt / OPT-friendly employers; deprioritize "US citizens only" / "no sponsorship" / clearance-required roles.
- **Job type:** Full-time (also open to internships that convert).
- **Availability:** Graduating May 2026.

## Profile Keywords (used for match scoring)
python, sql, pyspark, spark, pandas, scikit-learn, machine learning, deep learning, tensorflow, pytorch,
etl, elt, airflow, dbt, kafka, data pipeline, data warehouse, bigquery, snowflake, redshift, postgresql, mysql,
mongodb, aws, gcp, azure, docker, tableau, power bi, statistics, regression, computer vision, yolo, nlp,
data engineering, data science, analytics, model deployment, fastapi, flask

## Files
- Resume (current): `~/Downloads/20260529Resume_bhaavan_myneni__5__ec08c730-84cc-462d-b315-1b5e318a919e.pdf`
- Job Search Tracker repo: `~/Downloads/job_search_tool/`
- Source docs reviewed: `final report with paper.pdf` (B.Tech YOLO capstone + IIETA paper, 85pp), `handoff_v2 (Final).pdf` (Pix2Pix floorplan model hand-off, verified IU project specs)

## Roadmap (agreed with Bhaavan)
1. [DONE] Build personal Job Search Tracker — live at bhaavan-myneni.github.io/job-search-tracker (repo: Bhaavan-Myneni/job-search-tracker).
2. [ ] Add LinkedIn URL to this file (GitHub added: github.com/Bhaavan-Myneni).
3. [ ] Add RAPIDAPI_KEY + ANTHROPIC_API_KEY secrets to enable live daily fetch + resume gen.
4. [ ] Build personal portfolio site (can showcase UrbanFlow AI, Traffic Safety Engine, Customer 360, MC3).
5. [ ] Iterate on resume tailoring per role type (DS vs DE vs ML vs Analyst).
