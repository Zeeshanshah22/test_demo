// Milestones from "Year-by-year execution plan" and "Your next 30 days".
// due = day number from the user's start date. auto = metric check against logged actuals.

const M = (id, phase, title, due, cat, auto) => ({ id, phase, title, due, cat, auto })

export const MILESTONES = [
  // Next 30 days
  M('d3-abn', 'First 30 days', 'Get ABN, business bank account, Wise and Stripe; book accountant', 3, 'Setup'),
  M('d3-sebt', 'First 30 days', 'Enrol/continue SEBT and block 2 hours a day', 3, 'Learning'),
  M('d7-niche', 'First 30 days', 'Pick one niche and one city; audit 30 local businesses', 7, 'Sales'),
  M('d12-techlead', 'First 30 days', 'Shortlist 5 Tech Lead candidates, run paid tests, hire one half-time', 12, 'Team'),
  M('d17-assets', 'First 30 days', 'Build agency site, 3 offers, price sheet, Loom template, Upwork profile, 3 Fiverr gigs', 17, 'Sales'),
  M('d24-outreach', 'First 30 days', 'Daily outreach running: 30 emails, 10 proposals, 5 Looms', 24, 'Sales', { metric: 'outreachDays', gte: 5 }),
  M('d30-founding', 'First 30 days', 'Close 1–2 founding clients and start delivery', 30, 'Revenue', { metric: 'clients', gte: 1 }),
  // Days 1-90
  M('q1-tier1', 'Days 1–90', 'Finish SEBT Tier 1 modules: AEO, Local SEO, AI Automation, Vibe Coding', 90, 'Learning', { metric: 'tier1Pct', gte: 100 }),
  M('q1-seo', 'Days 1–90', 'Hire SEO/AEO Specialist (Month 3)', 75, 'Team'),
  M('q1-case', 'Days 1–90', '2–3 discounted founding-client projects for case studies', 90, 'Revenue'),
  M('q1-day90', 'Days 1–90', 'Day-90 test: 2+ paying clients and A$2–3k monthly revenue', 90, 'Revenue', { metric: 'mrr', gte: 2000 }),
  M('q1-sops', 'Days 1–90', 'Documented SOPs and a full pipeline', 90, 'Operations'),
  // Days 91-180
  M('q2-ret2', 'Days 91–180', 'Reach 2 retainers', 180, 'Revenue', { metric: 'retainers', gte: 2 }),
  M('q2-auto1', 'Days 91–180', 'Deliver the first automation project', 180, 'Revenue', { metric: 'automationProjects', gte: 1 }),
  M('q2-web3', 'Days 91–180', 'Deliver 3 websites', 180, 'Revenue', { metric: 'webProjects', gte: 3 }),
  M('q2-asset1', 'Days 91–180', 'Launch owned asset #1 (local lead-gen site)', 120, 'Assets', { metric: 'assetsLive', gte: 1 }),
  M('q2-tlfull', 'Days 91–180', 'Tech Lead full-time (Month 4) + half-time BD/bidder', 120, 'Team'),
  M('q2-pty', 'Days 91–180', 'Register Pty Ltd once monthly revenue is consistently above A$5k', 180, 'Setup'),
  // Days 181-270
  M('q3-ret4', 'Days 181–270', 'Reach 4 retainers and 2 automation retainers', 270, 'Revenue', { metric: 'retainers', gte: 4 }),
  M('q3-sops', 'Days 181–270', 'Write SOPs for every repeated task', 270, 'Operations'),
  M('q3-products', 'Days 181–270', 'Release 2 digital products (n8n pack + AEO audit kit)', 270, 'Assets'),
  M('q3-tool', 'Days 181–270', 'Ship a free AI tool as a lead magnet', 270, 'Assets'),
  // Days 271-365
  M('q4-hires', 'Days 271–365', 'Hire web developer and half-time content writer (Month 9)', 275, 'Team'),
  M('q4-asset2', 'Days 271–365', 'Launch owned asset #2', 300, 'Assets', { metric: 'assetsLive', gte: 2 }),
  M('q4-ret5', 'Days 271–365', 'Reach 5 retainers and 3 automation retainers', 365, 'Revenue', { metric: 'retainers', gte: 5 }),
  M('q4-gst', 'Days 271–365', 'Register for GST before turnover passes A$75k', 365, 'Setup'),
  M('q4-saas', 'Days 271–365', 'Pick the micro-SaaS idea and pre-sell it to 10 users', 365, 'Assets'),
  M('q4-10k', 'Days 271–365', 'Monthly revenue ≈A$10k by Month 12', 365, 'Revenue', { metric: 'mrr', gte: 10000 }),
  // Years 2-5
  M('y2-8ret', 'Year 2', 'Average 8 retainers; 10 automation projects; 12 websites', 730, 'Revenue', { metric: 'retainers', gte: 8 }),
  M('y2-saas', 'Year 2', 'Launch micro-SaaS (20 paying users) and YouTube channel', 730, 'Assets'),
  M('y2-draw', 'Year 2', 'Start founder pay (A$3k/month); consider leaving job at A$25k MRR', 730, 'Founder'),
  M('y3-pods', 'Year 3', '14 retainers, 3 delivery pods, SaaS 80 users, first flip', 1095, 'Revenue', { metric: 'retainers', gte: 14 }),
  M('y4-gm', 'Year 4', 'Hire GM, 20 retainers, SaaS 160 users, expand via white-label', 1460, 'Team'),
  M('y5-exit', 'Year 5', '26 retainers, 250 SaaS users, sell 2 assets, exit-ready', 1825, 'Exit', { metric: 'retainers', gte: 26 }),
]

export const PHASE_ORDER = ['First 30 days', 'Days 1–90', 'Days 91–180', 'Days 181–270', 'Days 271–365', 'Year 2', 'Year 3', 'Year 4', 'Year 5']

export const WORKFLOW_TEMPLATES = [
  { id: 'wf-outreach', name: 'Daily outreach system', tasks: ['Build list: 1 niche × 1 city from Google Maps', 'Record 5 two-minute Loom audits', 'Send 30 personalised cold emails', 'Send 10 Upwork proposals', 'Run 3 after-hours missed-call tests', 'Follow up day 3 / 7 / 14 / 30 leads', 'Update pipeline + log outreach numbers'] },
  { id: 'wf-onboard', name: 'Client onboarding ladder', tasks: ['Paid audit (A$290) delivered', 'Proposal with 3-option price sheet', 'Contract (MSA) + direct-debit set-up', 'Kick-off call + access collected', 'Project delivered (site / automation)', 'Convert to monthly retainer', 'Upsell: ads / AI agent', 'Offer annual prepay (2 months free)'] },
  { id: 'wf-delivery', name: 'Monthly retainer delivery', tasks: ['GBP posts + photo uploads', 'Citations batch', 'Review requests + replies', 'Local page / content published', 'Schema + technical checks', 'AI-answer tracking run', 'Second-person QA checklist', 'Monthly report sent + call booked'] },
  { id: 'wf-weekly', name: 'Weekly operating rhythm', tasks: ['Mon: pipeline & KPI review (30 min)', 'Tue: sales calls (your morning)', 'Wed: sales calls + team production', 'Thu: sales calls + team production', 'Fri: client reports, team 1:1s, plan next week', 'Log weekly KPI scorecard'] },
  { id: 'wf-hire', name: 'Hiring a team member', tasks: ['Confirm guardrail: recurring revenue ≥ 2× salary for 3 months', 'Post on SEBT community, Rozee.pk, LinkedIn', 'Shortlist 5 candidates', 'Paid test task (PKR 5–10k)', 'Offer + contractor agreement (IP, NDA, non-solicit)', 'Onboard with SOPs + Loom library', '3-month probation review'] },
  { id: 'wf-asset', name: 'Launch an owned asset', tasks: ['Pick niche where AI answers still send clicks', 'Domain + hosting + theme', 'Publish 20 cornerstone pages', 'Build local/authority links (white-hat)', 'Add monetisation (leads / affiliate)', 'Track profit monthly (12+ months before flip)'] },
]
