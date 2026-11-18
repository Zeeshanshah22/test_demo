# Digital Empire Academy

A mobile-friendly web app that turns the **Digital Empire Business Plan** and **Digital Empire Financial Model** into a course, an assessment centre and a business tracker for SEBT (iSkills) learners.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/ (open with any static host)
npm run preview    # serve the production build locally
```

The build is fully static (hash routing, relative paths), so `dist/` can go on GitHub Pages, Netlify, Vercel or any web server.

## Features

| Area | What it does |
|---|---|
| **Dashboard** | Empire score (0–1000), XP & level, streak, next best actions, peer radar, upcoming milestones, Y1 revenue and cash vs plan |
| **Course** | 17 business-plan chapters + 26 SEBT skills ranked and tiered exactly as in the plan (scores, start phase, learning-time %), 58 lessons with action tasks, notes and completion tracking, filters and search |
| **Quizzes & Tests** | 131 questions: multiple choice, true/false, dropdown fill-in-the-blank, select-all and calculations. Placement test, daily challenge, weak-area drill, custom quizzes (topic, difficulty, type, timer), results history and topic mastery charts |
| **AI question generator** | With a Claude API key: fresh questions on any topic, tailored to your niche, city and level, optionally researched on the web first |
| **Assignments** | 10 real deliverables (offer sheet, cold email, n8n workflow, GBP audit, agent prompt, hiring plan, budget review, Upwork proposal, schema, SaaS one-pager). Upload a file or paste text → rubric score, mistakes ordered by points lost, fixes, writing suggestions, plan alignment, red flags, model answer, score trend. Optional Claude review with an improved version |
| **File Analyzer** | Any file: PDF, DOCX, TXT/MD, CSV/XLSX, HTML, JSON, images. Built-in SEO/AEO audit for web pages, financial-sheet comparison with the Y1 model, document plan-alignment review, JSON-LD validation; Claude adds deep feedback and image analysis |
| **Financials** | Overview, revenue by engine, costs & expenses, team & salaries (PKR↔A$, loading, hiring guardrail), gross & net profit with a P&L, 5-year plan and three scenarios, monthly actuals logging (60 months) with CSV export |
| **Milestones** | 34 milestones from the execution plan, timed from your start date, on-track status, auto-ticks from your logged numbers, scenario trigger warnings |
| **Workflow** | Kanban board with drag-and-drop and plan templates (outreach, onboarding ladder, delivery, weekly rhythm, hiring, asset launch), daily outreach tracker with funnel vs benchmarks |
| **KPI Scorecard** | Weekly MRR growth, gross margin, churn, CAC, LTV:CAC, recurring share, utilisation, on-time delivery and NPS vs plan targets |
| **Calculators** | 16 tools: runway, break-even, Profit First, GST threshold, pricing & ROI, funnel predictor, LTV:CAC, retainer MRR projector, salary converter, hiring guardrail, exit valuation, wealth predictor, flip valuation, SaaS MRR, skill scorer, tool ROI |
| **Performance** | Strengths vs lagging areas, percentile by area vs a simulated on-plan peer cohort, Tier-1 mastery, XP trend, recommendations |
| **AI Coach** | Chat about the plan and your progress. Answers come from the course content offline, or from Claude (with optional web search) when you add a key |
| **Plan Library** | Reference tables: flywheel, pricing, channels, tools, capital, Profit First, guardrails, risks, exit options |
| **Settings** | Profile, scenario, Claude key and model, light/dark/system theme, editable brand colours, JSON backup/restore, reset |

## Data & privacy

- All progress is stored in the browser (`localStorage`). Use **Settings → Export backup** to move between devices.
- Uploaded files are parsed in the browser; nothing is sent to a server unless you turn on a Claude review.
- The Claude API key is optional, stored only in your browser and sent only to `api.anthropic.com`. Use a key with a spending limit.
- The peer comparison uses a simulated cohort based on the plan's expected pace (there is no shared leaderboard without a backend).

## Theme

The default palette is a SEBT NEXT-style navy / electric blue / orange. Exact brand hex codes can be pasted in **Settings → Appearance**, or changed in `src/index.css` (`--brand`, `--accent`, `--navy`).

## Project structure

```
src/
  data/        plan.js (all model numbers), curriculum.js, questions.js, assignments.js, milestones.js
  lib/         scoring.js, grader.js, fileAnalyzer.js, ai.js
  components/  Layout, Onboarding, ui, charts, Feedback
  pages/       one file per section
```

Projections are planning scenarios from the business plan, not forecasts. Legal, tax and visa notes are general information. Get professional advice.
