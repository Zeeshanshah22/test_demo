// All figures come from "Digital Empire Business Plan" and "Digital Empire Financial Model"
// (base case unless noted). Currency is A$ unless marked US$.

export const FX = { AUD_USD: 0.674, PKR_PER_AUD: 186.4, LOADING: 0.12, RAISE: 0.10 }
export const STARTING_CAPITAL = 20000

export const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']

export const FIVE_YEAR = {
  revenue: [54970, 274481, 680920, 1136795, 1733234],
  grossMargin: [13.1, 42.6, 56.1, 58.6, 62.8],
  founderDraw: [0, 36000, 72000, 110000, 150000],
  netProfit: [-16647, 18012, 149732, 290118, 533997],
  netMargin: [-30.3, 6.6, 22.0, 25.5, 30.8],
  teamFTE: [2.6, 10, 14, 21, 24],
  cashYearEnd: [3353, 21365, 171097, 461215, 995212],
  teamCost: [31064, 97952, 163584, 275911, 358924],
  toolsCost: [8653, 18600, 37300, 43500, 43500],
  recurringShare: [55, 62, 66, 69, 71],
}
// Derived (revenue x gross margin)
FIVE_YEAR.grossProfit = FIVE_YEAR.revenue.map((r, i) => Math.round(r * FIVE_YEAR.grossMargin[i] / 100))
FIVE_YEAR.totalCosts = FIVE_YEAR.revenue.map((r, i) => r - FIVE_YEAR.netProfit[i])

export const ENGINES = [
  { key: 'retainers', name: 'SEO / Local SEO / AEO retainers', short: 'Retainers', y1: 22255, y5: 648071, recurring: true },
  { key: 'automation', name: 'AI automation & agents', short: 'Automation', y1: 18991, y5: 487834, recurring: true },
  { key: 'web', name: 'Websites & vibe-coded apps', short: 'Web & apps', y1: 11869, y5: 114243, recurring: false },
  { key: 'assets', name: 'Owned digital assets', short: 'Owned assets', y1: 964, y5: 138872, recurring: true },
  { key: 'products', name: 'Digital products', short: 'Products', y1: 890, y5: 66766, recurring: false },
  { key: 'saas', name: 'Micro-SaaS', short: 'Micro-SaaS', y1: 0, y5: 173591, recurring: true },
  { key: 'flips', name: 'Asset flip proceeds', short: 'Flips', y1: 0, y5: 103858, recurring: false },
]

export const COST_LINES = [
  { key: 'payroll', name: 'Team payroll (incl. loading)', y1: 31064, fixed: true },
  { key: 'contractors', name: 'Outsourced contractors', y1: 6374 },
  { key: 'refunds', name: 'Refunds, bad debt & churn allowance', y1: 1593 },
  { key: 'marketplace', name: 'Marketplace fees (Upwork / Fiverr)', y1: 4462 },
  { key: 'assetBuilds', name: 'Asset builds & flip prep', y1: 5000 },
  { key: 'assetRunning', name: 'Owned-asset running costs', y1: 241 },
  { key: 'saasHosting', name: 'SaaS hosting & API', y1: 0 },
  { key: 'productFees', name: 'Digital product platform fees', y1: 89 },
  { key: 'payments', name: 'Payment processing & FX', y1: 1374 },
  { key: 'commissions', name: 'Sales commissions', y1: 2125 },
  { key: 'tools', name: 'Tools & software', y1: 8653, fixed: true },
  { key: 'marketing', name: 'Marketing & lead generation', y1: 2400, fixed: true },
  { key: 'compliance', name: 'Accounting, legal, insurance & compliance', y1: 3500, fixed: true },
  { key: 'training', name: 'Training, co-working & other', y1: 1500, fixed: true },
  { key: 'contingency', name: 'Contingency on overheads', y1: 909 },
  { key: 'draw', name: 'Founder draw', y1: 0 },
  { key: 'setup', name: 'Startup one-off setup costs', y1: 2333 },
]
// Direct (cost of delivery) lines used for gross profit
export const DIRECT_COSTS = ['payroll', 'contractors', 'refunds', 'marketplace', 'assetRunning', 'saasHosting', 'productFees', 'payments', 'commissions']

// Year-1 month-by-month plan (financial model sheet "Y1 Monthly")
export const Y1 = {
  months: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
  volume: {
    retainers: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
    automationProjects: [0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    automationRetainers: [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3],
    webProjects: [0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
    assetsLive: [0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2],
    assetsStarted: [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    productSalesUSD: [0, 0, 0, 0, 0, 0, 50, 50, 100, 100, 150, 150],
  },
  fte: {
    'Tech Lead': [0.5, 0.5, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    'SEO / AEO Specialist': [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    'WordPress / Web Developer': [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    'AI Content Writer': [0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5],
    'Business Developer': [0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  },
  totalFTE: [0.5, 0.5, 1.5, 2.5, 2.5, 2.5, 2.5, 2.5, 4, 4, 4, 4],
  revenue: {
    retainers: [0, 0, 742, 742, 1484, 1484, 2226, 2226, 2967, 2967, 3709, 3709],
    automation: [0, 0, 0, 0, 2967, 593, 3561, 593, 4154, 1187, 1187, 4748],
    web: [0, 1484, 0, 1484, 1484, 0, 1484, 1484, 0, 1484, 1484, 1484],
    assets: [0, 0, 0, 74, 74, 74, 74, 74, 148, 148, 148, 148],
    products: [0, 0, 0, 0, 0, 0, 74, 74, 148, 148, 223, 223],
    saas: Array(12).fill(0),
    flips: Array(12).fill(0),
  },
  totalRevenue: [0, 1484, 742, 2300, 6009, 2151, 7418, 4451, 7418, 5935, 6751, 10312],
  costs: {
    payroll: [751, 751, 1652, 2674, 2674, 2674, 2674, 2674, 3635, 3635, 3635, 3635],
    contractors: [0, 178, 89, 267, 712, 249, 872, 516, 855, 677, 766, 1193],
    refunds: [0, 45, 22, 67, 178, 62, 218, 129, 214, 169, 191, 298],
    marketplace: [0, 125, 62, 187, 499, 174, 611, 361, 598, 474, 536, 835],
    assetBuilds: [0, 0, 0, 2500, 0, 0, 0, 0, 2500, 0, 0, 0],
    assetRunning: [0, 0, 0, 19, 19, 19, 19, 19, 37, 37, 37, 37],
    saasHosting: Array(12).fill(0),
    productFees: [0, 0, 0, 0, 0, 0, 7, 7, 15, 15, 22, 22],
    payments: [0, 37, 19, 57, 150, 54, 185, 111, 185, 148, 169, 258],
    commissions: [0, 59, 30, 89, 237, 83, 291, 172, 285, 226, 255, 398],
    tools: Array(12).fill(721),
    marketing: Array(12).fill(200),
    compliance: Array(12).fill(292),
    training: Array(12).fill(125),
    contingency: [67, 70, 68, 71, 79, 71, 81, 75, 81, 78, 80, 87],
    draw: Array(12).fill(0),
    setup: [2333, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  totalCosts: [4489, 2602, 3280, 7269, 5885, 4724, 6296, 5403, 9743, 6796, 7029, 8101],
  netCash: [-4489, -1119, -2538, -4969, 124, -2573, 1122, -952, -2324, -861, -278, 2211],
  cash: [15511, 14393, 11854, 6885, 7009, 4436, 5558, 4606, 2282, 1420, 1142, 3353],
  lowestCash: 1142, lowestMonth: 'M11', firstPositive: 'M5',
}

export const SCENARIOS = {
  conservative: { label: 'Conservative', y1: 27831, y3: 334007, y5: 841196, total5: 1892963, gm5: 55.2, nm5: 18.0, np5: 168326, sde5: 292166, draws: 220800, cash5: 188326, multiple: 2.0, exit: 584333, wealth: 993459, million: 'Not yet',
    levers: { volume: 0.6, prices: 0.85, assets: 0.4, flips: 0.5, headcount: 0.7, overheads: 0.85, draw: 0.6 } },
  base: { label: 'Base', y1: 54970, y3: 680920, y5: 1733234, total5: 3880401, gm5: 62.8, nm5: 30.8, np5: 975212, sde5: 861996, draws: 368000, cash5: 995212, multiple: 2.5, exit: 2154990, wealth: 3518202, million: 'Yes',
    levers: { volume: 1, prices: 1, assets: 1, flips: 1, headcount: 1, overheads: 1, draw: 1 } },
  aggressive: { label: 'Aggressive', y1: 88855, y3: 1115411, y5: 2851136, total5: 6373402, gm5: 66.4, nm5: 36.5, np5: 2051331, sde5: 1598702, draws: 515200, cash5: 2071331, multiple: 3.0, exit: 4796105, wealth: 7382636, million: 'Yes',
    levers: { volume: 1.4, prices: 1.15, assets: 1.8, flips: 1.5, headcount: 1.3, overheads: 1.25, draw: 1.4 } },
}

export const TEAM = [
  { role: 'Tech Lead (AI automation, agents, vibe coding)', pkr: 250000, fte: [0.875, 1, 1, 2, 2], hire: 'M1 half-time, full-time from M4' },
  { role: 'SEO / AEO Specialist', pkr: 150000, fte: [0.83, 2, 3, 4, 5], hire: 'M3' },
  { role: 'Business Developer / Upwork bidder', pkr: 90000, fte: [0.375, 1, 1.5, 2, 2], hire: 'M4 half-time' },
  { role: 'WordPress / Web Developer', pkr: 120000, fte: [0.33, 1, 1.5, 2, 2], hire: 'M9' },
  { role: 'AI-assisted Content Writer', pkr: 80000, fte: [0.17, 1.5, 2, 3, 3], hire: 'M9 half-time' },
  { role: 'Outreach / Link-building', pkr: 80000, fte: [0, 1, 1, 2, 2], hire: 'Y2' },
  { role: 'Project / Account Manager', pkr: 180000, fte: [0, 0.5, 1, 1.5, 2], hire: 'Y2' },
  { role: 'YouTube / Video Producer', pkr: 90000, fte: [0, 0.5, 1, 1, 1], hire: 'Y2' },
  { role: 'SaaS / Product Developer', pkr: 220000, fte: [0, 0.5, 1, 1, 1.5], hire: 'Y2' },
  { role: 'Paid Ads Specialist', pkr: 140000, fte: [0, 0, 0.5, 1, 1], hire: 'Y3' },
  { role: 'Operations / Admin VA', pkr: 60000, fte: [0, 0.5, 1, 1, 1], hire: 'Y2' },
  { role: 'Operations Manager / GM', pkr: 350000, fte: [0, 0, 0, 0.5, 1], hire: 'Y4 (lets you step back)' },
].map(t => ({ ...t, aud: Math.round(t.pkr / FX.PKR_PER_AUD) }))

export const PRICING = [
  { offer: 'AI Visibility (Local SEO + AEO) retainer', starter: 'A$990/mo, 1 location', growth: 'A$1,790/mo, 3 locations + content', premium: 'A$2,990+/mo, multi-location + AEO PR', path: 'US$500 → 1,400/mo' },
  { offer: 'AI lead-response / receptionist', starter: 'A$2,500 setup + A$490/mo', growth: 'A$4,900 setup + A$890/mo', premium: 'A$9,000+ custom agent', path: 'US$2,000 → 6,000 setup; US$400 → 1,100/mo' },
  { offer: 'Ops automation', starter: 'A$1,900 (1 workflow)', growth: 'A$4,500 (3–4 workflow sprint)', premium: 'A$9,000+ (system)', path: 'Same as above' },
  { offer: 'Website + care plan', starter: 'A$1,900 site + A$99/mo', growth: 'A$3,900 + A$199/mo', premium: 'A$7,500+ app/portal', path: 'US$1,000 → 3,500' },
  { offer: 'Paid audit (lead magnet)', starter: 'A$290 AEO + Local audit, credited on signing', growth: '—', premium: '—', path: '—' },
]

export const CHANNELS = [
  { name: 'Upwork + Fiverr', y1: 35, y2: 25, y3: 10, note: 'Fast first revenue; Upwork fee 0–15%, Fiverr takes 20%' },
  { name: 'Cold email + Loom audits (AU)', y1: 25, y2: 25, y3: 20, note: '3 domains, 30–50 personalised emails/day' },
  { name: 'LinkedIn (founder brand)', y1: 15, y2: 15, y3: 15, note: '3 posts/week, 20 connection requests/day' },
  { name: 'Local networking (BNI, chambers)', y1: 10, y2: 10, y3: 10, note: 'Your in-person Australian edge' },
  { name: 'Referrals + partner agencies', y1: 10, y2: 15, y3: 20, note: '10% referral fee for the first year' },
  { name: 'Content / SEO / YouTube / free tools', y1: 5, y2: 10, y3: 25, note: 'Grows into the cheapest channel' },
]

export const TOOLS = [
  { p: 'Must', name: 'Ahrefs Lite', usd: 129, why: 'Keywords, backlinks, audits' },
  { p: 'Must', name: 'ChatGPT Business (2 seats)', usd: 50, why: 'Research, content, proposals' },
  { p: 'Must', name: 'Claude Pro', usd: 20, why: 'Long-form writing, coding' },
  { p: 'Must', name: 'n8n Cloud (or self-host)', usd: 24, why: 'Client automations and agents' },
  { p: 'Must', name: 'Cursor Pro', usd: 20, why: 'Vibe coding apps and tools' },
  { p: 'Must', name: 'VPS + WordPress hosting', usd: 40, why: 'Client and owned sites' },
  { p: 'Must', name: 'Instantly + domains', usd: 45, why: 'Cold email' },
  { p: 'Must', name: 'OpenAI/Anthropic API', usd: 40, why: 'Agents, pipelines, demos' },
  { p: 'Should', name: 'Perplexity Pro', usd: 20, why: 'Research, checking AI citations for AEO' },
  { p: 'Should', name: 'Google Workspace (3)', usd: 24, why: 'Email, docs' },
  { p: 'Should', name: 'Xero', usd: 24, why: 'Invoicing, BAS' },
  { p: 'Should', name: 'Upwork Plus', usd: 19.99, why: 'Connects, insights' },
  { p: 'Should', name: 'Fiverr Seller Plus', usd: 15, why: 'Seller insights' },
  { p: 'Should', name: 'Canva Pro', usd: 15, why: 'Graphics, reports' },
]

export const BUDGET = [
  { item: 'One-off setup (ASIC, business name, accountant, contracts, brand)', aud: 2333 },
  { item: 'Tools for the first 6 months', aud: 4326 },
  { item: 'Team payroll for Months 1–3', aud: 3155 },
  { item: 'Lead generation & marketing for 6 months', aud: 1200 },
  { item: 'First owned digital asset', aud: 2500 },
  { item: 'Insurance (PI + cyber, Year 1)', aud: 1200 },
  { item: 'Emergency reserve (do not touch)', aud: 5286 },
]

export const PROFIT_FIRST = [
  { account: 'Operating expenses', y1: 85, y2: 70, y3: 55 },
  { account: 'Tax (GST + income tax reserve)', y1: 10, y2: 12, y3: 15 },
  { account: 'Profit / reinvestment', y1: 5, y2: 10, y3: 15 },
  { account: 'Founder pay', y1: 0, y2: 8, y3: 15 },
]

export const GUARDRAILS = [
  'Hire only when signed recurring revenue covers 2x the new salary for 3 months.',
  'Keep 3 months of operating costs in reserve from Year 2.',
  'From Year 3, payroll stays below 30% of revenue and tools below 6%.',
  'No single client should exceed 15% of revenue from Year 2.',
  'Spend no more than 10% of quarterly profit on new assets, products or SaaS until Year 3.',
  'Invoice in advance, collect by direct debit, chase anything overdue within 7 days.',
]

export const KPI_TARGETS = [
  { key: 'mrrGrowth', name: 'MRR growth (month on month)', unit: '%', target: 10, dir: 'up', note: '10%+ in Years 1–2' },
  { key: 'grossMargin', name: 'Gross margin', unit: '%', target: 55, dir: 'up', note: '55%+ from Year 3' },
  { key: 'churn', name: 'Monthly churn', unit: '%', target: 3, dir: 'down', note: 'Under 3% a month' },
  { key: 'cacMonths', name: 'CAC (months of retainer)', unit: 'mo', target: 1, dir: 'down', note: 'Under 1 month of retainer' },
  { key: 'ltvCac', name: 'LTV : CAC', unit: 'x', target: 5, dir: 'up', note: '5x or more' },
  { key: 'recurringShare', name: 'Recurring revenue share', unit: '%', target: 65, dir: 'up', note: '65%+ from Year 2' },
  { key: 'utilisation', name: 'Team utilisation', unit: '%', target: 75, dir: 'up', note: 'Target 70–80%' },
  { key: 'onTime', name: 'On-time delivery', unit: '%', target: 90, dir: 'up', note: 'Weekly delivery scorecard' },
  { key: 'nps', name: 'Client NPS', unit: '', target: 50, dir: 'up', note: 'Weekly delivery scorecard' },
]

export const OUTREACH_TARGETS = { emails: 30, proposals: 10, looms: 5, linkedin: 20, calls: 0, deals: 0 }
export const FUNNEL_BENCH = { emails: 1000, replyLow: 0.02, replyHigh: 0.04, callsLow: 8, callsHigh: 15, clientsLow: 2, clientsHigh: 4, upworkHireLow: 0.05, upworkHireHigh: 0.10 }

export const RISKS = [
  { risk: 'AI Overviews reduce organic clicks (~38%)', l: 'High', i: 'High', m: 'Lead with AEO + Maps; sell leads and calls, not rankings; diversify owned assets beyond Google' },
  { risk: 'Google core/spam updates', l: 'High', i: 'Medium', m: 'White-hat only; no Parasite SEO or PBNs on clients; spread owned assets across niches' },
  { risk: 'Visa change (485 is temporary)', l: 'Medium', i: 'High', m: 'Get migration advice early; keep business location-independent; consider partners/co-directors' },
  { risk: 'Key staff leave', l: 'Medium', i: 'High', m: 'Pay above market, profit share, SOPs, Loom libraries, 2 people per critical skill by Year 3' },
  { risk: 'Client concentration or churn', l: 'Medium', i: 'Medium', m: '15% client cap, 3-month minimums, monthly ROI reports, annual prepay offers' },
  { risk: 'FX (AUD/PKR, AUD/USD)', l: 'Low–Med', i: 'Medium', m: 'Costs in PKR, revenue in AUD/USD is a natural hedge; hold some USD' },
  { risk: 'Marketplace account suspension', l: 'Low–Med', i: 'Medium', m: 'Follow platform rules; move clients to direct contracts after first project where allowed' },
  { risk: 'Founder burnout (job + business)', l: 'High in Y1', i: 'High', m: 'Fixed 20–25 hrs/week, 90-day sprints, delegate delivery from Month 3' },
  { risk: 'AI tools commoditise services', l: 'Medium', i: 'Medium', m: 'Sell outcomes plus accountability; productise and build your own SaaS' },
  { risk: 'Data/privacy breach from AI agents', l: 'Low', i: 'High', m: 'Privacy policy, data-processing terms, cyber insurance, minimal data retention' },
]

export const EXIT_OPTIONS = [
  { name: 'A. Full exit (end of Y5)', text: 'Base value ≈ A$2.15m. Sell to an AU agency, PE roll-up, or via Empire Flippers / Acquire.com. Value rises with 70%+ recurring revenue, a GM in place, no client above 10%, clean Xero accounts and SaaS reported separately. Typical terms: 60–80% upfront, rest as 12–24 month earn-out.' },
  { name: 'B. Partial exit (recommended)', text: 'In Y4–5 sell the micro-SaaS separately at a SaaS multiple (Acquire median ≈ 3.9x) and keep the agency as a cash-flow business.' },
  { name: 'C. Lifestyle wealth', text: 'Keep the company, take ≈ A$600–860k SDE a year by Y5 through salary + franked dividends, work 10–15 hrs/week, invest 30–50% of profits outside the business.' },
  { name: 'D. Management buy-out', text: 'Sell to your GM and pod leads over 3–5 years, funded from profits.' },
]

export const EFFORT = [
  { area: 'Client services (A–D)', v: [80, 65, 55, 50, 45] },
  { area: 'Sales & authority', v: [15, 15, 15, 15, 15] },
  { area: 'Assets, products, SaaS (E–G)', v: [5, 20, 30, 35, 40] },
]

export const PHASES = [
  { phase: '1. Cash engine', years: 'Y1–Y2', engine: 'Local SEO + AEO retainers, AI automation projects, websites', does: 'Pays salaries, proves your offers, builds case studies' },
  { phase: '2. Recurring engine', years: 'Y2–Y3', engine: 'Retainers, automation maintenance, care plans', does: 'Smooths cash flow; lifts recurring share above 65%' },
  { phase: '3. Equity engine', years: 'Y2–Y5', engine: 'Micro-SaaS, owned sites/YouTube, digital products, flips', does: 'High-margin revenue that sells for higher multiples' },
  { phase: '4. Authority engine', years: 'Y1–Y5', engine: 'LinkedIn, YouTube, case studies, AEO reports', does: 'Cuts the cost of winning clients, raises prices' },
]

export const YEAR_GOALS = [
  { year: 1, title: 'Prove and fund', revenue: 54970, team: 2.6, draw: 0, goals: ['5 retainer clients', '3 automation retainers', '4 automation projects', '8 websites', '2 owned assets live', '≈A$10k monthly revenue by M12'] },
  { year: 2, title: 'Systemise and start equity', revenue: 274481, team: 10, draw: 36000, goals: ['Average 8 retainers at ≈US$800/mo', '10 automation projects at ≈US$3,500', '4 automation retainers', '12 websites', 'Micro-SaaS live with 20 paying users', 'Marketplace share 70% → 50% of service revenue'] },
  { year: 3, title: 'Scale and authority', revenue: 680920, team: 14, draw: 72000, goals: ['14 retainers (≈US$1,100)', '15 automation projects, 7 automation retainers', '3 delivery pods with leads', 'SaaS at 80 users + paid cohort/course', 'First asset flip (≈US$20k)', 'Annual "AI Visibility of AU Small Business" report'] },
  { year: 4, title: 'Leverage', revenue: 1136795, team: 21, draw: 110000, goals: ['Half-time GM / Ops Manager hired', 'Second Tech Lead; expand NZ/UK/US via white-label', '20 retainers at ≈US$1,250', 'SaaS at 160 users', 'Flip 1 asset (≈US$30k)', 'Founder steps back from delivery'] },
  { year: 5, title: 'Optimise for exit or lifestyle', revenue: 1733234, team: 24, draw: 150000, goals: ['26 retainers at ≈US$1,400', '24 automation projects at ≈US$6,000', '14 automation retainers', '250 SaaS users', 'Sell 2 assets', 'GM runs day-to-day; 3 years clean accounts + SOPs'] },
]

export const SKILL_WEIGHTS = [
  { key: 'speed', name: 'Speed to revenue', w: 15 },
  { key: 'demand', name: 'Market demand', w: 15 },
  { key: 'recurring', name: 'Recurring revenue', w: 15 },
  { key: 'margin', name: 'Margin', w: 10 },
  { key: 'scalability', name: 'Scalability', w: 10 },
  { key: 'exit', name: 'Asset / exit value', w: 10 },
  { key: 'resilience', name: 'AI-disruption resilience', w: 10 },
  { key: 'capital', name: 'Low capital', w: 5 },
  { key: 'risk', name: 'Low risk', w: 5 },
  { key: 'edge', name: 'Australia-based edge', w: 5 },
]

export const WEEKLY_RHYTHM = [
  { day: 'Mon', focus: 'Pipeline and KPI review (30 min)' },
  { day: 'Tue–Thu', focus: 'Sales calls in your morning; team production in their evening' },
  { day: 'Fri', focus: 'Client reports, team 1:1s, plan next week' },
]

export const fmtA = (n, d = 0) => {
  if (n === null || n === undefined || isNaN(n)) return '—'
  const s = Math.abs(n).toLocaleString('en-AU', { maximumFractionDigits: d, minimumFractionDigits: d })
  return n < 0 ? `(A$${s})` : `A$${s}`
}
export const fmtK = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '—'
  const a = Math.abs(n)
  const s = a >= 1e6 ? (a / 1e6).toFixed(2) + 'm' : a >= 1e3 ? (a / 1e3).toFixed(a >= 1e5 ? 0 : 1) + 'k' : a.toFixed(0)
  return (n < 0 ? '-' : '') + 'A$' + s
}
export const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0)
