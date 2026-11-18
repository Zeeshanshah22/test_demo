import { useEffect, useState } from 'react'
import { Calculator, Search } from 'lucide-react'
import { PageHeader, Card, Field, NumberInput, Badge, Callout } from '../components/ui'
import { LineChart, BarChart, DonutChart } from '../components/charts'
import { FX, SKILL_WEIGHTS, PROFIT_FIRST, SCENARIOS, Y1, fmtA, fmtK, sum, TOOLS } from '../data/plan'
import { SKILLS as CURR } from '../data/curriculum'
import { useStore } from '../store'
import { actualTotals } from '../lib/scoring'

const slug = (t) => t.toLowerCase().replace(/[^a-z]+/g, '-')
const R = ({ label, value, strong, tone }) => <div className="flex justify-between gap-3 py-1.5 border-b border-line last:border-0 text-sm"><span className="text-muted">{label}</span><span className={`tabular-nums text-right ${strong ? 'font-bold text-base' : 'font-semibold'} ${tone === 'ok' ? 'text-ok' : tone === 'bad' ? 'text-bad' : ''}`}>{value}</span></div>

const TOOLS_LIST = [
  { id: 'Runway', cat: 'Money', C: Runway }, { id: 'Break-even', cat: 'Money', C: BreakEven }, { id: 'Profit First', cat: 'Money', C: ProfitFirst }, { id: 'GST threshold', cat: 'Money', C: GST },
  { id: 'Pricing & ROI', cat: 'Sales', C: PricingROI }, { id: 'Funnel predictor', cat: 'Sales', C: Funnel }, { id: 'LTV:CAC', cat: 'Sales', C: LTV }, { id: 'Retainer MRR projector', cat: 'Sales', C: MRRProjector },
  { id: 'Salary converter', cat: 'Team', C: Salary }, { id: 'Hiring guardrail', cat: 'Team', C: HireGuard },
  { id: 'Exit valuation', cat: 'Equity', C: Exit }, { id: 'Wealth predictor', cat: 'Equity', C: Wealth }, { id: 'Flip valuation', cat: 'Equity', C: Flip }, { id: 'SaaS MRR', cat: 'Equity', C: SaaS },
  { id: 'Skill scorer', cat: 'Strategy', C: SkillScorer }, { id: 'Tool ROI', cat: 'Strategy', C: ToolROI },
]

export default function Tools() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  useEffect(() => { const h = window.location.hash.split('#')[2]; if (h) setTimeout(() => document.getElementById(h)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) }, [])
  const list = TOOLS_LIST.filter(t => (cat === 'All' || t.cat === cat) && t.id.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <PageHeader icon={Calculator} title="Calculators, estimators & predictors" subtitle="16 tools built on the Digital Empire model's assumptions (AUD/USD 0.674, PKR 186.4 per A$, 12% loading, 25% company tax). Change the inputs to test your own numbers." />
      <div className="card p-3 mb-5 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><input className="input pl-9" placeholder="Find a calculator" value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="flex gap-1.5 flex-wrap">{['All', 'Money', 'Sales', 'Team', 'Equity', 'Strategy'].map(c => <button key={c} onClick={() => setCat(c)} className={`chip py-1.5 px-3 cursor-pointer ${cat === c ? 'chip-brand' : 'chip-muted'}`}>{c}</button>)}</div>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        {list.map(t => <div key={t.id} id={slug(t.id)} className="scroll-mt-20 min-w-0"><t.C /></div>)}
      </div>
    </div>
  )
}

function Runway() {
  const { state } = useStore()
  const t = actualTotals(state)
  const [cash, setCash] = useState(t.lastCash ?? 20000)
  const [rev, setRev] = useState(3000)
  const [cost, setCost] = useState(5500)
  const [growth, setGrowth] = useState(10)
  const months = Array.from({ length: 18 }, (_, i) => i + 1)
  let c = cash; const bal = months.map(i => { c += rev * Math.pow(1 + growth / 100, i - 1) - cost; return Math.round(c) })
  const out = bal.findIndex(b => b < 0)
  const burn = cost - rev
  return (
    <Card title="Runway calculator" subtitle="How long does your cash last? Revenue grows monthly; costs stay flat.">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cash now"><NumberInput prefix="A$" value={cash} onChange={setCash} /></Field>
        <Field label="Monthly revenue"><NumberInput prefix="A$" value={rev} onChange={setRev} /></Field>
        <Field label="Monthly costs"><NumberInput prefix="A$" value={cost} onChange={setCost} /></Field>
        <Field label="Revenue growth / month"><NumberInput suffix="%" value={growth} onChange={setGrowth} /></Field>
      </div>
      <div className="mt-3"><R label="Current burn" value={burn > 0 ? fmtA(burn) + '/mo' : 'Cash-positive'} tone={burn > 0 ? 'bad' : 'ok'} /><R label="Simple runway (no growth)" value={burn > 0 ? `${(cash / burn).toFixed(1)} months` : '∞'} /><R strong label="Cash runs out" value={out >= 0 ? `Month ${out + 1}` : 'Not within 18 months'} tone={out >= 0 ? 'bad' : 'ok'} /></div>
      <div className="mt-3"><LineChart money labels={months.map(m => `+${m}`)} datasets={[{ label: 'Projected cash', data: bal }]} height={180} /></div>
    </Card>
  )
}

function BreakEven() {
  const [fixed, setFixed] = useState(1338)
  const [payroll, setPayroll] = useState(2674)
  const [price, setPrice] = useState(742)
  const [margin, setMargin] = useState(75)
  const contrib = price * margin / 100
  const n = contrib > 0 ? (fixed + payroll) / contrib : Infinity
  return (
    <Card title="Break-even estimator" subtitle="How many retainers cover your monthly overheads? (Y1 plan: tools A$721 + marketing A$200 + compliance A$292 + training A$125)">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fixed overheads / month"><NumberInput prefix="A$" value={fixed} onChange={setFixed} /></Field>
        <Field label="Payroll / month"><NumberInput prefix="A$" value={payroll} onChange={setPayroll} /></Field>
        <Field label="Retainer price / month"><NumberInput prefix="A$" value={price} onChange={setPrice} /></Field>
        <Field label="Contribution margin"><NumberInput suffix="%" value={margin} onChange={setMargin} /></Field>
      </div>
      <div className="mt-3"><R label="Contribution per retainer" value={fmtA(contrib)} /><R strong label="Retainers to break even" value={isFinite(n) ? Math.ceil(n) : '—'} /><R label="Break-even monthly revenue" value={isFinite(n) ? fmtA(Math.ceil(n) * price) : '—'} /></div>
      <p className="text-xs text-muted mt-2">Y1 plan prices retainers at US$500 ≈ A$742. Raise price toward A$990+ to need fewer clients.</p>
    </Card>
  )
}

function ProfitFirst() {
  const [amt, setAmt] = useState(8000)
  const [yr, setYr] = useState('y1')
  const rows = PROFIT_FIRST.map(r => ({ ...r, v: amt * r[yr] / 100 }))
  return (
    <Card title="Profit First allocator" subtitle="Apply the plan's allocation rules to every A$ received">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Money received"><NumberInput prefix="A$" value={amt} onChange={setAmt} /></Field>
        <Field label="Stage"><select className="input" value={yr} onChange={e => setYr(e.target.value)}><option value="y1">Year 1</option><option value="y2">Year 2</option><option value="y3">Year 3+</option></select></Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-3 items-center">
        <div>{rows.map(r => <R key={r.account} label={`${r.account} (${r[yr]}%)`} value={fmtA(r.v)} />)}</div>
        <DonutChart money labels={rows.map(r => r.account)} data={rows.map(r => Math.round(r.v))} height={190} />
      </div>
    </Card>
  )
}

function GST() {
  const [cur, setCur] = useState(10000)
  const [g, setG] = useState(10)
  const [ytd, setYtd] = useState(30000)
  let total = ytd, m = 0, r = cur
  while (total < 75000 && m < 60) { m++; r *= 1 + g / 100; total += r }
  return (
    <Card title="GST threshold predictor" subtitle="Register for GST once turnover reaches A$75k in a 12-month period (base case: during Year 2).">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="Turnover last 12 months"><NumberInput prefix="A$" value={ytd} onChange={setYtd} /></Field>
        <Field label="Monthly revenue now"><NumberInput prefix="A$" value={cur} onChange={setCur} /></Field>
        <Field label="Growth / month"><NumberInput suffix="%" value={g} onChange={setG} /></Field>
      </div>
      <div className="mt-3"><R strong label="Months until A$75k" value={ytd >= 75000 ? 'Register now' : m >= 60 ? '> 5 years' : `≈ ${m} month(s)`} tone={ytd >= 75000 || m <= 2 ? 'bad' : undefined} /></div>
      <p className="text-xs text-muted mt-2">Simplified projection (adds future months to the current total). Services exported to overseas clients are generally GST-free. General information only — confirm with your accountant.</p>
    </Card>
  )
}

function PricingROI() {
  const [job, setJob] = useState(400)
  const [extra, setExtra] = useState(1)
  const [price, setPrice] = useState(990)
  const annualValue = job * extra * 50, annualCost = price * 12
  const roi = annualCost ? (annualValue - annualCost) / annualCost * 100 : 0
  return (
    <Card title="Pricing & ROI anchor" subtitle="'One extra booked job a week at A$400 is A$20k a year. The plan costs A$11.9k.'">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="Average job value"><NumberInput prefix="A$" value={job} onChange={setJob} /></Field>
        <Field label="Extra jobs / week"><NumberInput value={extra} onChange={setExtra} step="0.5" /></Field>
        <Field label="Your price / month"><NumberInput prefix="A$" value={price} onChange={setPrice} /></Field>
      </div>
      <div className="mt-3"><R label="Value to client per year" value={fmtA(annualValue)} /><R label="Cost to client per year" value={fmtA(annualCost)} /><R strong label="Client ROI" value={`${roi.toFixed(0)}%`} tone={roi > 0 ? 'ok' : 'bad'} /><R label="Payback" value={annualValue ? `${(annualCost / (annualValue / 52)).toFixed(1)} weeks` : '—'} /></div>
      <div className="mt-3 p-3 rounded-xl bg-surface-2 text-sm">Script: "One extra booked job a week at {fmtA(job)} is {fmtA(annualValue)} a year. The plan costs {fmtA(annualCost)}."</div>
    </Card>
  )
}

function Funnel() {
  const [emails, setEmails] = useState(30 * 22)
  const [reply, setReply] = useState(3)
  const [callRate, setCallRate] = useState(40)
  const [close, setClose] = useState(25)
  const [proposals, setProposals] = useState(10 * 22)
  const [hire, setHire] = useState(7.5)
  const replies = emails * reply / 100, calls = replies * callRate / 100, clients = calls * close / 100, upwork = proposals * hire / 100
  return (
    <Card title="Funnel predictor" subtitle="Benchmark: 1,000 emails → 2–4% replies → 8–15 calls → 2–4 clients">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="Emails / month"><NumberInput value={emails} onChange={setEmails} /></Field>
        <Field label="Reply rate"><NumberInput suffix="%" value={reply} onChange={setReply} /></Field>
        <Field label="Replies → calls"><NumberInput suffix="%" value={callRate} onChange={setCallRate} /></Field>
        <Field label="Calls → clients"><NumberInput suffix="%" value={close} onChange={setClose} /></Field>
        <Field label="Upwork proposals / mo"><NumberInput value={proposals} onChange={setProposals} /></Field>
        <Field label="Upwork hire rate"><NumberInput suffix="%" value={hire} onChange={setHire} /></Field>
      </div>
      <BarChart labels={['Emails', 'Replies', 'Calls', 'Clients (email)', 'Upwork hires']} datasets={[{ label: 'Predicted / month', data: [emails, replies, calls, clients, upwork].map(v => +v.toFixed(1)) }]} height={170} legend={false} />
      <R strong label="Predicted new clients / month" value={(clients + upwork).toFixed(1)} />
    </Card>
  )
}

function LTV() {
  const [arpu, setArpu] = useState(990)
  const [gm, setGm] = useState(60)
  const [churn, setChurn] = useState(3)
  const [cac, setCac] = useState(800)
  const life = churn > 0 ? 100 / churn : 0
  const ltv = arpu * gm / 100 * life
  const ratio = cac ? ltv / cac : 0
  return (
    <Card title="LTV : CAC calculator" subtitle="Targets: LTV:CAC ≥ 5x, CAC under 1 month of retainer, churn < 3%">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Monthly revenue per client"><NumberInput prefix="A$" value={arpu} onChange={setArpu} /></Field>
        <Field label="Gross margin"><NumberInput suffix="%" value={gm} onChange={setGm} /></Field>
        <Field label="Monthly churn"><NumberInput suffix="%" value={churn} onChange={setChurn} /></Field>
        <Field label="CAC (cost to win a client)"><NumberInput prefix="A$" value={cac} onChange={setCac} /></Field>
      </div>
      <div className="mt-3"><R label="Average client lifetime" value={`${life.toFixed(0)} months`} /><R label="Lifetime value (gross profit)" value={fmtA(ltv)} /><R strong label="LTV : CAC" value={`${ratio.toFixed(1)}x`} tone={ratio >= 5 ? 'ok' : 'bad'} /><R label="CAC in months of retainer" value={`${(cac / arpu).toFixed(2)}`} tone={cac / arpu <= 1 ? 'ok' : 'bad'} /></div>
    </Card>
  )
}

function MRRProjector() {
  const [start, setStart] = useState(0)
  const [add, setAdd] = useState(0.5)
  const [price, setPrice] = useState(742)
  const [churn, setChurn] = useState(3)
  const months = Array.from({ length: 24 }, (_, i) => i + 1)
  let c = start; const clients = months.map(() => { c = c * (1 - churn / 100) + add; return +c.toFixed(1) })
  return (
    <Card title="Retainer MRR projector" subtitle="Clients added per month vs churn. Plan: 5 retainers by M12, 8 average in Y2.">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Clients now"><NumberInput value={start} onChange={setStart} /></Field>
        <Field label="New / month"><NumberInput value={add} onChange={setAdd} step="0.25" /></Field>
        <Field label="Price"><NumberInput prefix="A$" value={price} onChange={setPrice} /></Field>
        <Field label="Churn"><NumberInput suffix="%" value={churn} onChange={setChurn} /></Field>
      </div>
      <LineChart money labels={months.map(m => `M${m}`)} datasets={[{ label: 'Projected MRR', data: clients.map(x => Math.round(x * price)) }, { label: 'Plan retainer revenue (Y1)', data: Y1.revenue.retainers, dashed: true, colorIndex: 1, points: 0 }]} height={190} />
      <R strong label="Clients at month 12 / 24" value={`${clients[11]} / ${clients[23]}`} />
    </Card>
  )
}

function Salary() {
  const [pkr, setPkr] = useState(150000)
  const [rate, setRate] = useState(FX.PKR_PER_AUD)
  const [load, setLoad] = useState(12)
  const aud = pkr / rate, loaded = aud * (1 + load / 100)
  return (
    <Card title="Salary converter (PKR ↔ A$)" subtitle="Plan: PKR 186.4 per A$, +12% loading, +10% annual raises">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="Salary (PKR/mo)"><NumberInput value={pkr} onChange={setPkr} /></Field>
        <Field label="PKR per A$"><NumberInput value={rate} onChange={setRate} /></Field>
        <Field label="Loading"><NumberInput suffix="%" value={load} onChange={setLoad} /></Field>
      </div>
      <div className="mt-3"><R label="A$ per month" value={fmtA(aud)} /><R strong label="Loaded A$ per month" value={fmtA(loaded)} /><R label="Loaded A$ per year" value={fmtA(loaded * 12)} /><R label="US$ per month" value={`US$${Math.round(aud * FX.AUD_USD).toLocaleString()}`} /><R label="Year 2 with 10% raise" value={fmtA(loaded * 1.1)} /></div>
    </Card>
  )
}

function HireGuard() {
  const [recurring, setRecurring] = useState(3000)
  const [payroll, setPayroll] = useState(1652)
  const [pkr, setPkr] = useState(120000)
  const newCost = pkr / FX.PKR_PER_AUD * (1 + FX.LOADING)
  const need = 2 * (payroll + newCost)
  const ok = recurring >= need
  return (
    <Card title="Hiring guardrail check" subtitle="Hire only when signed recurring revenue covers 2× the salary for 3 months">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="Signed recurring / month"><NumberInput prefix="A$" value={recurring} onChange={setRecurring} /></Field>
        <Field label="Current payroll / month"><NumberInput prefix="A$" value={payroll} onChange={setPayroll} /></Field>
        <Field label="New hire (PKR/mo)"><NumberInput value={pkr} onChange={setPkr} /></Field>
      </div>
      <div className="mt-3"><R label="New hire loaded cost" value={fmtA(newCost)} /><R label="Recurring needed (2×)" value={fmtA(need)} /><R strong label="Decision" value={ok ? 'Safe to hire' : `Wait — need ${fmtA(need - recurring)} more MRR`} tone={ok ? 'ok' : 'bad'} /></div>
    </Card>
  )
}

function Exit() {
  const [sde, setSde] = useState(861996)
  const [mult, setMult] = useState(2.5)
  const [recurring, setRecurring] = useState(71)
  const adj = mult + (recurring >= 70 ? 0.25 : 0)
  return (
    <Card title="Exit valuation estimator" subtitle="Base: 2.5x Year-5 SDE ≈ A$2.15m. Recurring ≥70%, a GM and no client >10% lift the multiple.">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label="SDE (profit before draw)"><NumberInput prefix="A$" value={sde} onChange={setSde} /></Field>
        <Field label="Multiple"><NumberInput suffix="x" value={mult} onChange={setMult} step="0.1" /></Field>
        <Field label="Recurring share"><NumberInput suffix="%" value={recurring} onChange={setRecurring} /></Field>
      </div>
      <div className="mt-3"><R label="Value at chosen multiple" value={fmtA(sde * mult)} /><R strong label={`With recurring premium (${adj.toFixed(2)}x)`} value={fmtA(sde * adj)} /><R label="Upfront (60–80%)" value={`${fmtK(sde * adj * 0.6)} – ${fmtK(sde * adj * 0.8)}`} /></div>
    </Card>
  )
}

function Wealth() {
  const [sc, setSc] = useState('base')
  const s = SCENARIOS[sc]
  return (
    <Card title="Millionaire / wealth predictor" subtitle="Founder wealth = cumulative draws + cash in company + exit value">
      <Field label="Scenario"><select className="input" value={sc} onChange={e => setSc(e.target.value)}>{Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
      <div className="grid sm:grid-cols-2 gap-3 mt-3 items-center">
        <div><R label="Cumulative founder draw" value={fmtA(s.draws)} /><R label="Cash in company end Y5" value={fmtA(s.cash5)} /><R label="Indicative exit value" value={fmtA(s.exit)} /><R strong label="Founder wealth (pre-tax)" value={fmtA(s.wealth)} tone={s.wealth >= 1e6 ? 'ok' : 'bad'} /><R label="A$1m in 5 years?" value={s.million} /></div>
        <DonutChart money labels={['Draws', 'Cash', 'Exit']} data={[s.draws, s.cash5, s.exit]} height={190} />
      </div>
    </Card>
  )
}

function Flip() {
  const [profit, setProfit] = useState(800)
  const [months, setMonths] = useState(12)
  const annual = profit * 12
  return (
    <Card title="Asset flip valuation" subtitle="Flippa content sites ≈2.32x annual profit (top quartile 4.68x); Empire Flippers 1.7–5x. Need 12+ months of verified profit.">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Average monthly profit"><NumberInput prefix="A$" value={profit} onChange={setProfit} /></Field>
        <Field label="Months of verified profit"><NumberInput value={months} onChange={setMonths} /></Field>
      </div>
      {months < 12 && <div className="mt-3"><Callout tone="warn">Wait until you have 12+ months of verified profit before listing.</Callout></div>}
      <div className="mt-3"><R label="Low (1.7x)" value={fmtA(annual * 1.7)} /><R strong label="Flippa average (2.32x)" value={fmtA(annual * 2.32)} /><R label="Top quartile (4.68x)" value={fmtA(annual * 4.68)} /></div>
    </Card>
  )
}

function SaaS() {
  const [users, setUsers] = useState(20)
  const [growth, setGrowth] = useState(8)
  const [arpu, setArpu] = useState(32)
  const [churn, setChurn] = useState(4)
  const months = Array.from({ length: 36 }, (_, i) => i + 1)
  let u = users; const arr = months.map(() => { u = u * (1 + growth / 100 - churn / 100); return Math.round(u) })
  const mrr = arr.map(x => Math.round(x * arpu / FX.AUD_USD))
  return (
    <Card title="Micro-SaaS MRR predictor" subtitle="Model: US$25–39 ARPU, 20 users (Y2) → 80 (Y3) → 160 (Y4) → 250 (Y5) ≈ A$174k/yr. Acquire median ≈3.9x.">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Users now"><NumberInput value={users} onChange={setUsers} /></Field>
        <Field label="Growth / mo"><NumberInput suffix="%" value={growth} onChange={setGrowth} /></Field>
        <Field label="ARPU (US$)"><NumberInput value={arpu} onChange={setArpu} /></Field>
        <Field label="Churn / mo"><NumberInput suffix="%" value={churn} onChange={setChurn} /></Field>
      </div>
      <LineChart money labels={months.map(m => `+${m}`)} datasets={[{ label: 'MRR (A$)', data: mrr }]} height={170} />
      <R label="Users in 12 / 24 / 36 months" value={`${arr[11]} / ${arr[23]} / ${arr[35]}`} /><R strong label="ARR in 36 months (A$)" value={fmtA(mrr[35] * 12)} /><R label="Value at 3.9x ARR-profit proxy" value={fmtK(mrr[35] * 12 * 0.6 * 3.9)} />
    </Card>
  )
}

function SkillScorer() {
  const [skill, setSkill] = useState('aeo')
  const preset = CURR.find(s => s.id === skill)?.scores
  const [scores, setScores] = useState(preset || Object.fromEntries(SKILL_WEIGHTS.map(w => [w.key, 5])))
  const [weights, setWeights] = useState(Object.fromEntries(SKILL_WEIGHTS.map(w => [w.key, w.w])))
  useEffect(() => { if (preset) setScores(preset) }, [skill]) // eslint-disable-line
  const wsum = sum(Object.values(weights))
  const score = wsum ? sum(SKILL_WEIGHTS.map(w => (scores[w.key] || 0) * weights[w.key])) / wsum * 10 : 0
  const tier = score >= 72.5 ? 1 : score >= 67.5 ? 2 : score >= 55.5 ? 3 : 4
  return (
    <Card title="Skill priority scorer" subtitle="Score = weighted sum × 10 across 10 factors. Rate any skill 1–10 and change the weights.">
      <Field label="Start from"><select className="input" value={skill} onChange={e => setSkill(e.target.value)}>{CURR.filter(s => s.scores).map(s => <option key={s.id} value={s.id}>{s.name} (plan {s.score})</option>)}<option value="custom">Custom skill</option></select></Field>
      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {SKILL_WEIGHTS.map(w => (
          <div key={w.key} className="text-sm">
            <div className="flex justify-between"><span>{w.name}</span><span className="text-muted tabular-nums">{scores[w.key] || 0}/10 · w{weights[w.key]}%</span></div>
            <input type="range" min="1" max="10" value={scores[w.key] || 1} onChange={e => setScores({ ...scores, [w.key]: +e.target.value })} className="w-full accent-[var(--brand)]" aria-label={w.name} />
          </div>
        ))}
      </div>
      <details className="mt-2 text-sm"><summary className="cursor-pointer text-brand">Edit weights</summary><div className="grid grid-cols-2 gap-2 mt-2">{SKILL_WEIGHTS.map(w => <Field key={w.key} label={w.name}><NumberInput suffix="%" value={weights[w.key]} onChange={v => setWeights({ ...weights, [w.key]: +v || 0 })} /></Field>)}</div><p className="text-xs text-muted mt-1">Weights total {wsum}%.</p></details>
      <div className="mt-3"><R strong label="Skill score" value={score.toFixed(1)} /><R label="Likely tier" value={<Badge tone={tier === 1 ? 'brand' : 'muted'}>Tier {tier}</Badge>} /></div>
    </Card>
  )
}

function ToolROI() {
  const [rows, setRows] = useState(TOOLS.slice(0, 6).map(t => ({ name: t.name, usd: t.usd, hours: 3, billed: false })))
  const [rate, setRate] = useState(25)
  const total = sum(rows.map(r => r.usd)) / FX.AUD_USD
  return (
    <Card title="Tool ROI (3x rule)" subtitle="A tool stays only if it saves more than 3x its cost in team hours or is billed to a client">
      <Field label="Team cost per hour (A$)"><NumberInput prefix="A$" value={rate} onChange={setRate} /></Field>
      <div className="scroll-x mt-3"><table className="table"><thead><tr><th>Tool</th><th className="num">US$/mo</th><th className="num">Hrs saved/mo</th><th>Billed</th><th className="num">ROI</th></tr></thead><tbody>
        {rows.map((r, i) => { const cost = r.usd / FX.AUD_USD, saved = r.hours * rate, x = cost ? saved / cost : 0, keep = r.billed || x >= 3; return (
          <tr key={i}><td className="text-xs font-medium">{r.name}</td><td className="num">{r.usd}</td><td className="num"><input className="input w-20 py-1 text-right" type="number" value={r.hours} onChange={e => setRows(rows.map((y, j) => j === i ? { ...y, hours: +e.target.value } : y))} aria-label="Hours saved" /></td><td><input type="checkbox" checked={r.billed} onChange={e => setRows(rows.map((y, j) => j === i ? { ...y, billed: e.target.checked } : y))} aria-label="Billed to client" /></td><td className="num"><Badge tone={keep ? 'ok' : 'bad'}>{r.billed ? 'Billed' : `${x.toFixed(1)}x`}</Badge></td></tr>
        ) })}
      </tbody></table></div>
      <R label="Total (A$/mo)" value={fmtA(total)} />
    </Card>
  )
}
