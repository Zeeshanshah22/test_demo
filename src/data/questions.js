// Question bank. Types: mcq, tf, dropdown (fill the blank), multi (select all), numeric.
// topic = module id from curriculum.js, d = difficulty 1 (easy) .. 3 (hard)
let n = 0
const id = () => 'q' + (++n)
const mcq = (topic, d, q, options, answer, why) => ({ id: id(), type: 'mcq', topic, d, q, options, answer, why })
const tf = (topic, d, q, answer, why) => ({ id: id(), type: 'tf', topic, d, q, options: ['True', 'False'], answer: answer ? 0 : 1, why })
const dd = (topic, d, q, options, answer, why) => ({ id: id(), type: 'dropdown', topic, d, q, options, answer, why })
const multi = (topic, d, q, options, answers, why) => ({ id: id(), type: 'multi', topic, d, q, options, answers, why })
const num = (topic, d, q, answer, tol, unit, why) => ({ id: id(), type: 'numeric', topic, d, q, answer, tol, unit, why })

export const QUESTIONS = [
  // ---------- Executive summary
  mcq('pb-1', 1, 'What is the plan\'s one-line verdict?', ['Monetise all 21 SEBT skills at once', 'Build one AU-facing "AI Visibility + AI Automation" agency with an offshore team', 'Focus only on Fiverr gigs', 'Start with a micro-SaaS in month 1'], 1, 'The plan says do not try to monetise all 21 skills; build one focused agency and use its cash to fund recurring assets.'),
  dd('pb-1', 1, 'The flywheel is Agency → Recurring → ___ → Authority.', ['Ads', 'Assets/SaaS', 'Freelancing', 'Blogging'], 1, 'Agency → Recurring → Assets/SaaS → Authority.'),
  num('pb-1', 2, 'Base-case Year 5 revenue (A$, nearest thousand)?', 1733000, 5000, 'A$', 'Year 5 base revenue is A$1,733,234.'),
  tf('pb-1', 1, 'The model pays the founder A$0 in Year 1.', true, 'Founder draw is A$0 in Year 1, which is why keeping your job matters.'),
  mcq('pb-1', 2, 'Reaching A$1m in 5 years depends most on…', ['Hitting 8+ retainer clients by Year 2', 'Selling on Etsy', 'Hiring 10 people in Year 1', 'Running TikTok ads'], 0, 'The plan says A$1m is realistic but depends on hitting 8+ retainers by Year 2.'),
  multi('pb-1', 2, 'Which are among the "five decisions that matter most"? (select all)', ['Keep your job through Year 1', 'Sell to Australian local businesses first', 'Lead with AEO and AI automation', 'Hire 5 people in month 1', 'Build equity from Year 2'], [0, 1, 2, 4], 'Hiring slowly is a decision — not hiring 5 people in month 1.'),
  mcq('pb-1', 2, 'Base-case net margin in Year 5?', ['13.1%', '22.0%', '30.8%', '62.8%'], 2, '30.8% net margin; 62.8% is gross margin.'),
  num('pb-1', 3, 'Indicative base-case exit value is 2.5x Year-5 SDE of A$861,996. What is it (A$)?', 2154990, 5000, 'A$', '861,996 × 2.5 ≈ A$2,154,990.'),
  // ---------- Course analysis
  mcq('pb-2', 1, 'Who leads the SEBT programme?', ['Neil Patel', 'M Tanveer Nandla', 'Brian Dean', 'Rand Fishkin'], 1, 'SEBT by iSkills is led by M Tanveer Nandla.'),
  tf('pb-2', 1, 'The plan treats "71% of graduates earned online" as a guaranteed outcome.', false, 'It says to treat these as marketing claims, not guarantees.'),
  mcq('pb-2', 2, 'What is your biggest edge versus most SEBT graduates?', ['Lower prices on Fiverr', 'Selling to Australian businesses at Australian prices', 'More SEO tools', 'Parasite SEO'], 1, 'You live in Australia, so you can sell locally at AU prices while paying PKR salaries.'),
  multi('pb-2', 2, 'Which modules carry Google-penalty risk and must never be used on client sites?', ['Parasite SEO', 'Aggressive tiered links', 'Mass auto-blogging', 'Local SEO', 'AEO'], [0, 1, 2], 'Parasite SEO, aggressive tiered links and mass auto-blogging carry penalty risk.'),
  // ---------- Skill prioritisation
  mcq('pb-3', 1, 'Which skill ranks #1 in the plan?', ['Local SEO', 'AI Automation', 'AEO (AI SEO)', 'SaaS Development'], 2, 'AEO scores 84.5 and ranks first.'),
  dd('pb-3', 2, 'Learning time is split ___ across Tiers 1–4.', ['25/25/25/25', '60/25/12/3', '50/30/15/5', '70/20/10/0'], 1, '60/25/12/3%.'),
  num('pb-3', 2, 'What weight (%) does "speed to revenue" have in the skill score?', 15, 0, '%', 'Speed, demand and recurring revenue are 15% each.'),
  mcq('pb-3', 2, 'What is the first skill in your personal 120-day learning order?', ['Vibe Coding', 'AEO', 'Technical SEO', 'AI Agents'], 1, 'AEO → Local SEO → AI Automation → Vibe Coding → AI Agents → Technical SEO → Micro PM.'),
  tf('pb-3', 2, 'Parasite SEO ranks last (26th) with a score of 43.0.', true, 'Parasite SEO is Tier 4, "Avoid".'),
  mcq('pb-3', 3, 'Why is classic SEO lower than you might expect?', ['It is illegal', 'AI Overviews cut organic clicks by about 38% in one study', 'It has no demand', 'It needs a big budget'], 1, 'AI Overviews reduce clicks, so SEO must be packaged with AEO.'),
  num('pb-3', 3, 'A skill scores 8 on every one of the 10 factors. What is its score (weighted sum × 10)?', 80, 0, '', 'Weights sum to 100%, so 8 × 1.0 × 10 = 80.'),
  // ---------- Business model
  mcq('pb-4', 1, 'Which engine is the largest Year-1 revenue source?', ['AI automation', 'SEO / Local SEO / AEO retainers', 'Websites', 'Micro-SaaS'], 1, 'Retainers are A$22,255 (40.5%) in Year 1.'),
  dd('pb-4', 2, 'Recurring revenue rises from 55% in Year 1 to ___ in Year 5.', ['60%', '65%', '71%', '90%'], 2, '71% in Year 5.'),
  tf('pb-4', 2, 'Ads management is modelled as its own revenue engine with separate pricing.', false, 'Ads sit inside Engine A pricing in the model.'),
  mcq('pb-4', 2, 'Flippa data shows SaaS sells for about what multiple of profit?', ['1.43x', '2.47x', '5x', '10x'], 1, 'SaaS ≈2.47x vs services ≈1.43x.'),
  num('pb-4', 2, 'What % of effort goes to assets, products and SaaS in Year 5?', 40, 0, '%', '5% in Y1 rising to 40% in Y5.'),
  // ---------- Ideas
  mcq('pb-5', 1, 'What is the Tier-1 #1 service idea?', ['eCommerce SEO', 'AI Visibility retainer (Local SEO + AEO)', 'White-label SEO', 'Etsy store'], 1, 'The AI Visibility retainer for Australian trades, clinics and professionals.'),
  dd('pb-5', 2, 'In "rank and rent" you rank a local lead-gen site and ___ the leads to a local business.', ['sell', 'rent', 'give away', 'auction'], 1, 'Rank and rent.'),
  tf('pb-5', 2, 'You should only flip assets with 12+ months of verified profit.', true, 'Buyers pay for verified profit history.'),
  mcq('pb-5', 2, 'n8n/Make workflow template packs are priced at…', ['US$1–5', 'US$29–149', 'US$500–1,000', 'Free only'], 1, 'US$29–149 each.'),
  multi('pb-5', 3, 'Which are the strongest micro-SaaS candidates in the plan?', ['AI Visibility Tracker', 'Review-response & reputation agent', 'White-label client-reporting dashboard', 'Crypto trading bot'], [0, 1, 2], 'The crypto bot is not in the plan.'),
  num('pb-5', 2, 'How many SaaS paying users does the model assume by Year 5?', 250, 0, 'users', '250 paying users ≈ A$174k/yr.'),
  // ---------- Offers & pricing
  mcq('pb-6', 1, 'Starter price of the AI Visibility retainer?', ['A$290/mo', 'A$990/mo', 'A$1,790/mo', 'A$2,990/mo'], 1, 'Starter A$990/mo for 1 location.'),
  dd('pb-6', 1, 'The paid audit costs ___ and is credited on signing.', ['A$99', 'A$290', 'A$990', 'A$2,500'], 1, 'A$290 AEO + Local audit.'),
  tf('pb-6', 2, 'The plan recommends performance-only pricing.', false, 'It recommends performance bonuses instead of performance-only pricing.'),
  mcq('pb-6', 2, 'What is the minimum contract term?', ['1 month', '3 months, then month-to-month', '12 months', 'No minimum'], 1, '3 months minimum, then month-to-month.'),
  num('pb-6', 2, 'ROI anchor: one extra A$400 job a week for 50 weeks is worth how much (A$)?', 20000, 0, 'A$', '400 × 50 = A$20,000 — vs a A$11.9k plan.'),
  multi('pb-6', 2, 'Which are part of the client ladder?', ['Audit', 'Website/automation project', 'Retainer', 'Annual prepay (2 months free)', 'Free lifetime support'], [0, 1, 2, 3], 'Audit → project → retainer → upsell → annual prepay.'),
  mcq('pb-6', 3, 'AI lead-response Growth package?', ['A$2,500 setup + A$490/mo', 'A$4,900 setup + A$890/mo', 'A$9,000 setup + A$0/mo', 'A$1,900 one-off'], 1, 'Growth: A$4,900 setup + A$890/mo.'),
  // ---------- Acquisition
  mcq('pb-7', 1, 'Which channel gets the largest share of acquisition effort in Year 1?', ['LinkedIn', 'Upwork + Fiverr', 'Cold email', 'Content/YouTube'], 1, 'Upwork + Fiverr 35% in Year 1.'),
  dd('pb-7', 2, 'Suggested cold email subject: "[Business] is ___ in ChatGPT".', ['famous', 'invisible', 'ranked #1', 'banned'], 1, '"[Business] is invisible in ChatGPT".'),
  num('pb-7', 2, 'How many Upwork proposals a day in Months 1–3?', 10, 0, '', '10 proposals a day, aiming for a 5–10% hire rate.'),
  mcq('pb-7', 2, 'Benchmark: 1,000 emails produce about how many clients?', ['0–1', '2–4', '10–15', '50'], 1, '1,000 emails → 2–4% replies → 8–15 calls → 2–4 clients.'),
  multi('pb-7', 2, 'On which days do you follow up?', ['Day 3', 'Day 7', 'Day 14', 'Day 30', 'Day 60'], [0, 1, 2, 3], 'Follow up at days 3, 7, 14 and 30.'),
  tf('pb-7', 1, 'The "missed-call test" means calling after hours and pitching the AI receptionist if nobody answers.', true, 'Use the exact call you made as proof.'),
  mcq('pb-7', 3, 'Best reply to "We already have an SEO guy"?', ['Offer a 50% discount', 'Ask if they show up in ChatGPT/Google AI — a separate layer you can add alongside for 90 days', 'Criticise their SEO provider', 'End the call'], 1, 'Position AEO as a separate layer.'),
  num('pb-7', 2, 'How many personalised cold emails a day does the plan target (lower bound)?', 30, 0, '', '30–50 personalised emails/day from 3 domains.'),
  // ---------- Team
  mcq('pb-8', 1, 'First hire in Month 1?', ['SEO/AEO Specialist', 'Half-time Tech Lead', 'GM', 'Video producer'], 1, 'Tech Lead half-time in M1, full-time from M4.'),
  num('pb-8', 2, 'PKR 150,000 / 186.4 = how many A$ per month (unloaded, nearest dollar)?', 805, 2, 'A$', '150,000 ÷ 186.4 ≈ A$805.'),
  dd('pb-8', 2, 'The model adds ___ for equipment, internet, bonuses and transfer fees.', ['5%', '12%', '25%', '40%'], 1, '12% loading, plus 10% annual raises.'),
  tf('pb-8', 2, 'A paid test task (PKR 5–10k) should be used before any offer.', true, 'Plus a 3-month probation.'),
  mcq('pb-8', 3, 'Phantom equity for early partners in the plan?', ['50% immediately', 'Up to 5–10% over 4 years with a 1-year cliff', '1% per month', 'None'], 1, 'Vesting phantom equity up to 5–10% over 4 years, 1-year cliff.'),
  num('pb-8', 2, 'Average team FTE in Year 5?', 24, 0, 'FTE', 'About 24 FTE.'),
  mcq('pb-8', 2, 'Time difference: Pakistan vs eastern Australia?', ['Pakistan is 5–6 hours behind', 'Same time', 'Pakistan is 3 hours ahead', '12 hours'], 0, 'Book client calls in your morning, production in their evening.'),
  // ---------- Legal & tax
  mcq('pb-9', 1, 'Recommended starting structure?', ['US LLC', 'Sole trader with an ABN', 'Public company', 'Trust'], 1, 'Sole trader with ABN in Months 1–3, Pty Ltd later.'),
  num('pb-9', 2, 'At what turnover (A$) must you register for GST?', 75000, 0, 'A$', 'A$75k.'),
  tf('pb-9', 2, 'A US LLC reduces Australian tax for an Australian tax resident.', false, 'The ATO can look through it — extra compliance, no tax benefit.'),
  dd('pb-9', 2, 'Move to a Pty Ltd once revenue passes about ___ a month.', ['A$1–2k', 'A$5–8k', 'A$20k', 'A$50k'], 1, 'About A$5–8k a month.'),
  num('pb-9', 2, 'Base rate entity company tax rate (%)?', 25, 0, '%', '25%.'),
  // ---------- Tools
  num('pb-10', 2, 'Year-1 tools cost per month in A$ (approx)?', 721, 5, 'A$', '≈US$486/mo ≈ A$721/mo.'),
  mcq('pb-10', 2, 'The tool-keeping rule is…', ['Keep every free trial', 'A tool stays only if it saves 3x its cost or is billed to a client', 'Buy annual plans for everything', 'Only use free tools'], 1, 'The 3x rule.'),
  tf('pb-10', 1, 'Ahrefs Lite is a "Must" tool in Year 1.', true, 'US$129/mo.'),
  // ---------- Capital
  num('pb-11', 2, 'Lowest Year-1 cash balance in the base case (A$)?', 1142, 0, 'A$', 'A$1,142 in Month 11.'),
  mcq('pb-11', 1, 'First month with positive net cash flow?', ['M2', 'M5', 'M9', 'M12'], 1, 'Month 5.'),
  dd('pb-11', 2, 'Profit First in Year 1 allocates ___ to operating expenses.', ['55%', '70%', '85%', '100%'], 2, '85% opex, 10% tax, 5% profit, 0% founder pay.'),
  num('pb-11', 2, 'How much of the A$20k is the emergency reserve (A$)?', 5286, 0, 'A$', 'A$5,286 (26.4%).'),
  multi('pb-11', 3, 'Which are spending guardrails?', ['Hire only when recurring revenue covers 2x salary for 3 months', 'No client above 15% of revenue from Year 2', 'Payroll below 30% of revenue from Year 3', 'Spend 50% of profit on new SaaS in Year 1'], [0, 1, 2], 'Max 10% of quarterly profit on new assets until Year 3.'),
  tf('pb-11', 2, 'From Year 2 you keep 3 months of operating costs in reserve.', true, 'Guardrail #2.'),
  // ---------- Execution
  mcq('pb-12', 1, 'Year-1 goal for retainer clients by Month 12?', ['2', '5', '8', '14'], 1, '5 retainers, 3 automation retainers, 4 automation projects, 8 websites, 2 assets.'),
  dd('pb-12', 2, 'In Days 1–90 you hire the SEO/AEO Specialist in Month ___.', ['1', '3', '6', '9'], 1, 'Month 3.'),
  tf('pb-12', 2, 'In Year 2 you can consider leaving your job when monthly revenue passes about A$25k.', true, 'Year 2 guidance.'),
  num('pb-12', 3, 'How many SaaS users is the Year 3 target?', 80, 0, 'users', '80 users in Year 3, 160 in Year 4, 250 in Year 5.'),
  mcq('pb-12', 2, 'When do you pre-sell the micro-SaaS to 10 users?', ['Days 1–90', 'Days 271–365', 'Year 4', 'Never'], 1, 'Days 271–365 of Year 1.'),
  // ---------- Scenarios
  mcq('pb-13', 2, 'Founder wealth created in the aggressive case?', ['A$0.99m', 'A$3.52m', 'A$7.38m', 'A$12m'], 2, 'A$7,382,636.'),
  dd('pb-13', 2, 'Conservative trigger: fewer than ___ retainers by Month 6.', ['1', '2', '5', '8'], 1, 'Fix the offer or niche before hiring.'),
  multi('pb-13', 3, 'If you see conservative-level numbers after 6 months, you should…', ['Freeze hiring', 'Delay your founder draw', 'Push asset/SaaS spending back a year', 'Add A$15–40k capital', 'Double ad spend'], [0, 1, 2, 3], 'Doubling ad spend is not in the plan.'),
  num('pb-13', 2, 'Service volume multiplier in the aggressive case?', 1.4, 0, 'x', '×0.6 / ×1 / ×1.4.'),
  // ---------- Risks
  mcq('pb-14', 2, 'Mitigation for AI Overviews reducing clicks?', ['Stop doing SEO', 'Lead with AEO + Maps; sell leads and calls, not rankings', 'Buy PBN links', 'Only use Fiverr'], 1, 'Sell outcomes, not rankings.'),
  tf('pb-14', 1, 'Founder burnout is rated High likelihood in Year 1.', true, 'Fixed 20–25 hrs/week and 90-day sprints.'),
  // ---------- Exit
  mcq('pb-15', 2, 'Which exit option does the plan recommend?', ['Full exit', 'Partial exit — sell the SaaS separately', 'Management buy-out', 'Close the business'], 1, 'Option B.'),
  num('pb-15', 3, 'Typical deal terms pay what % upfront (lower bound)?', 60, 0, '%', '60–80% upfront, rest as earn-out.'),
  // ---------- KPIs
  dd('pb-16', 2, 'Target monthly churn is under ___.', ['1%', '3%', '10%', '25%'], 1, 'Under 3% a month.'),
  num('pb-16', 2, 'Target LTV:CAC ratio (x)?', 5, 0, 'x', '5x or more.'),
  mcq('pb-16', 2, 'Team utilisation target?', ['40–50%', '70–80%', '95–100%', 'Not tracked'], 1, '70–80%.'),
  tf('pb-16', 1, 'Monday is for pipeline and KPI review.', true, 'Mon pipeline & KPI review (30 min).'),
  // ---------- 30 days
  mcq('pb-17', 1, 'Day-90 success test?', ['10 clients and A$20k MRR', '2+ paying clients, A$2–3k monthly revenue, SOPs and a full pipeline', 'A finished SaaS', '1,000 YouTube subscribers'], 1, 'If fewer than 1 client by Day 90, change the niche or offer, not the whole plan.'),
  dd('pb-17', 1, 'Days 4–7: pick one niche and one ___.', ['country', 'city', 'platform', 'tool'], 1, 'One niche + one city, then audit 30 businesses.'),
  // ---------- AEO
  mcq('aeo', 1, 'AEO stands for…', ['Advanced Email Outreach', 'Answer Engine Optimisation', 'Automated Ecommerce Operations', 'Ad Engine Optimisation'], 1, 'Optimising for AI answer engines like ChatGPT, Perplexity and Google AI.'),
  multi('aeo', 2, 'Which help a business appear in AI answers?', ['Consistent NAP across the web', 'Structured data (schema)', 'Mentions on trusted third-party lists', 'Hiding key facts in images', 'Direct, question-led answers'], [0, 1, 2, 4], 'Facts hidden in images are hard for AI to read.'),
  dd('aeo', 2, 'Put a ___ word direct answer first, then the detail.', ['5–10', '40–60', '300–500', '1,000+'], 1, 'Short, direct answers are easy to quote.'),
  tf('aeo', 2, 'GEO/AEO starter retainers run US$1,800–4,200/mo according to First Page Sage.', true, 'Cited in the plan.'),
  mcq('aeo', 3, 'Which metric best shows AEO progress?', ['Bounce rate', 'Share of answer / AI mentions for tracked prompts', 'Domain age', 'Number of blog posts'], 1, 'Track how often the brand is mentioned across tracked prompts.'),
  // ---------- Automation
  mcq('automation', 1, 'Which tool is the plan\'s main automation platform?', ['Zapier only', 'n8n (or Make)', 'Excel macros', 'IFTTT'], 1, 'n8n Cloud or self-hosted, Make from Year 2.'),
  dd('automation', 2, 'An n8n workflow starts with a ___.', ['report', 'trigger', 'invoice', 'loop'], 1, 'Trigger → nodes → actions.'),
  num('automation', 2, 'An automation saves 6 hours/week at A$45/hr. Annual value over 48 weeks (A$)?', 12960, 0, 'A$', '6 × 45 × 48 = A$12,960.'),
  tf('automation', 2, 'Add error handling before handing a workflow to a client.', true, 'Use an Error Trigger and logging.'),
  mcq('automation', 2, 'Typical SMB AI automation setup price range (The Data Prism)?', ['US$50–200', 'US$1,500–5,000', 'US$50,000+', 'Free'], 1, 'Retainers US$500–1,500/mo.'),
  // ---------- Local SEO
  mcq('localseo', 1, 'Strongest single GBP ranking factor you control?', ['Number of posts', 'Primary category', 'Logo colour', 'Website age'], 1, 'Primary category drives relevance.'),
  multi('localseo', 2, 'Map-pack ranking is driven by…', ['Proximity', 'Relevance', 'Prominence', 'Font choice'], [0, 1, 2], 'Google\'s three local factors.'),
  tf('localseo', 2, 'Adding keywords to the GBP business name is a safe tactic.', false, 'Keyword-stuffing the name risks suspension.'),
  dd('localseo', 1, 'NAP stands for Name, Address, ___.', ['Price', 'Phone', 'Page', 'Profile'], 1, 'Keep NAP identical everywhere.'),
  mcq('localseo', 2, 'Reply to reviews within…', ['48 hours', '1 month', 'Never', 'Only to 5-star reviews'], 0, 'Reply to every review quickly.'),
  // ---------- Agents
  mcq('agents', 1, 'An AI agent is…', ['A chatbot with no tools', 'A model + instructions + tools + memory + guardrails', 'A human assistant', 'A website theme'], 1, 'Tools let the agent act.'),
  tf('agents', 2, 'Agents that record calls need privacy and data-processing terms.', true, 'Plus cyber insurance and minimal retention.'),
  mcq('agents', 2, 'Which tools are named for voice AI?', ['Vapi/Retell + ElevenLabs', 'Canva', 'Xero', 'Ahrefs'], 0, 'Year 2 additions.'),
  // ---------- SaaS / Vibe
  mcq('saas', 2, 'How should you choose the micro-SaaS?', ['Pick a trendy idea', 'Build what comes up most often in client work', 'Copy a big competitor', 'Ask on social media only'], 1, 'Repeated client requests validate demand.'),
  num('saas', 3, 'Acquire.com median SaaS multiple (x)?', 3.9, 0.05, 'x', '≈3.9x.'),
  mcq('vibe', 1, 'Which is a vibe-coding tool in the stack?', ['Cursor Pro', 'Xero', 'Instantly', 'Canva'], 0, 'Cursor Pro US$20/mo.'),
  tf('vibe', 2, 'AI-generated code should still be reviewed for secrets, auth and input validation.', true, 'Security review is required.'),
  // ---------- Others
  tf('freelancing', 1, 'Fiverr takes 20% of each order.', true, 'Plan figure.'),
  mcq('freelancing', 2, 'Target Upwork hire rate?', ['0.5–1%', '5–10%', '30–40%', '90%'], 1, '5–10% from 10 proposals a day.'),
  mcq('techseo', 2, 'Good LCP threshold?', ['< 2.5s', '< 10s', '< 0.1s', '< 30s'], 0, 'LCP < 2.5s, INP < 200ms, CLS < 0.1.'),
  dd('techseo', 2, 'Core Web Vitals: CLS should be below ___.', ['0.1', '1', '5', '25'], 0, 'CLS < 0.1.'),
  num('flipping', 2, 'Value a site with A$12,000 annual profit at the Flippa average 2.32x (A$).', 27840, 0, 'A$', '12,000 × 2.32 = A$27,840.'),
  tf('parasite', 1, 'Parasite SEO is acceptable for client sites if it ranks quickly.', false, 'Never on client sites — spam-policy risk.'),
  mcq('pm', 2, 'Bonus pool when targets are hit?', ['1% of revenue', '5–10% of monthly gross profit', '50% of net profit', 'None'], 1, 'Paid monthly through Wise or Payoneer.'),
  mcq('seo', 2, 'Classic SEO should now be packaged with…', ['AEO', 'Parasite SEO', 'PBNs', 'Nothing'], 0, 'SEO is the foundation under AEO and Local SEO.'),
  mcq('web', 1, 'Website Starter offer?', ['A$1,900 site + A$99/mo care plan', 'A$500 one-off', 'A$7,500 + A$0', 'Free'], 0, 'Every site is an entry point to a retainer.'),
  mcq('gads', 2, 'When do Google Ads upsells start?', ['Month 1', 'Year 2', 'Year 5', 'Never'], 1, 'Upsell to local SEO clients from Year 2.'),
  mcq('youtube', 2, 'Topic of the faceless YouTube channel?', ['Gaming', 'AI automation tutorials', 'Travel vlogs', 'Cooking'], 1, 'Doubles as authority content.'),
  tf('blogging', 2, 'The plan builds 2 owned assets in Year 1.', true, 'Then 2 a year in Years 2–3, then 1 a year.'),
  mcq('links', 2, 'Which link tactic is acceptable on client sites?', ['PBNs', 'Genuine local partnerships and PR', 'Aggressive tiered links', 'Link farms'], 1, 'White-hat only.'),
  mcq('ecomseo', 2, 'Which page type usually drives the most organic revenue for a store?', ['Blog posts', 'Category pages', 'Contact page', 'Privacy policy'], 1, 'Category pages target high-intent commercial searches.'),
  dd('ecomseo', 2, 'eCommerce SEO targets stores doing ___ a year from Year 2.', ['A$50k+', 'A$1m+', 'A$100m+', 'any revenue'], 1, 'Higher-ticket Shopify/Woo retainers.'),
  mcq('metaads', 2, 'How fast should Meta lead-form leads be followed up?', ['Within 5 minutes (automate it)', 'Next week', 'Only by email newsletter', 'Never'], 0, 'Speed to lead drives conversion — automate the follow-up.'),
  tf('metaads', 1, 'Meta Ads are sold as an add-on to existing local clients from Year 2.', true, 'Lead-gen upsell.'),
  mcq('tooldev', 1, 'Main purpose of free no-code AI tools in the plan?', ['Lead magnets', 'Replacing the agency', 'Selling ads', 'Recruiting staff'], 0, 'E.g. a Google review reply generator or local SEO grader, gated by email.'),
  mcq('browser', 2, 'Browser automation in the plan is mainly used for…', ['Internal efficiency', 'Fake reviews', 'Scraping competitors\' private data', 'Client billing'], 0, 'List building, citation submissions and QA — respecting site terms.'),
  tf('tiktok', 2, 'TikTok Ads are a core Year-1 service.', false, 'Optional upsell from Year 3.'),
  mcq('appdev', 2, 'What should come before native mobile apps?', ['A responsive web app / PWA', 'A TV app', 'A smartwatch app', 'Nothing'], 0, 'Start with a PWA; add native apps when users need push/offline features.'),
  tf('etsy', 1, 'Etsy digital downloads are a low-priority Year-2 test only.', true, 'Measure profit per hour before continuing.'),
  dd('content', 2, 'AI-assisted writing workflow: brief → AI draft → ___ → fact check → publish.', ['human edit', 'auto-publish', 'spin', 'translate'], 0, 'Add first-hand experience and local detail AI cannot invent.'),
  mcq('quick', 1, 'Quick Skills are used to…', ['Fill spare team capacity', 'Replace Tier-1 offers', 'Train AI models', 'Run ads'], 0, 'Never let them distract from Tier-1 offers.'),
]

export const QTYPES = { mcq: 'Multiple choice', tf: 'True / False', dropdown: 'Fill in the blank', multi: 'Select all', numeric: 'Calculation' }

export function checkAnswer(q, resp) {
  if (resp === undefined || resp === null || resp === '') return false
  if (q.type === 'multi') {
    const a = [...(resp || [])].sort().join(','), b = [...q.answers].sort().join(',')
    return a === b
  }
  if (q.type === 'numeric') {
    const v = parseFloat(String(resp).replace(/[^0-9.\-]/g, ''))
    if (isNaN(v)) return false
    return Math.abs(v - q.answer) <= Math.max(q.tol, Math.abs(q.answer) * 0.005)
  }
  return Number(resp) === q.answer
}

export function correctText(q) {
  if (q.type === 'multi') return q.answers.map(i => q.options[i]).join('; ')
  if (q.type === 'numeric') return `${q.answer.toLocaleString()} ${q.unit || ''}`.trim()
  return q.options[q.answer]
}
