import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Wallet, LayoutGrid, TrendingUp, Receipt, Users, PiggyBank, Layers, PencilLine, Download, Plus, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useStore, uid } from '../store'
import { PageHeader, Card, Tabs, Stat, Badge, Field, NumberInput, Callout, Empty } from '../components/ui'
import { LineChart, BarChart, DonutChart } from '../components/charts'
import { Y1, FIVE_YEAR, ENGINES, COST_LINES, DIRECT_COSTS, TEAM, SCENARIOS, FX, YEARS, fmtA, fmtK, sum, EFFORT } from '../data/plan'
import { actualTotals, planMonth, scenarioFactor } from '../lib/scoring'

const VOLUME_FIELDS = [
  ['retainers', 'Active SEO/Local/AEO retainers'], ['automationProjects', 'Automation projects delivered'], ['automationRetainers', 'Active automation retainers'],
  ['webProjects', 'Website/app projects delivered'], ['assetsLive', 'Owned assets live'], ['saasUsers', 'Paying SaaS users'],
]

// Plan value for an engine in month m (Y1 monthly, later years interpolate the Y1 → Y5 mix)
function planEngine(m, key) {
  if (m <= 12) return Y1.revenue[key][m - 1]
  const y = Math.ceil(m / 12) - 1
  const e = ENGINES.find(x => x.key === key)
  const s1 = e.y1 / FIVE_YEAR.revenue[0], s5 = e.y5 / FIVE_YEAR.revenue[4]
  const share = s1 + (s5 - s1) * (y / 4)
  return FIVE_YEAR.revenue[y] * share / 12
}
function planCost(m, key) {
  if (m <= 12) return Y1.costs[key][m - 1]
  const y = Math.ceil(m / 12) - 1
  const line = COST_LINES.find(c => c.key === key)
  return FIVE_YEAR.totalCosts[y] * (line.y1 / sum(COST_LINES.map(c => c.y1))) / 12
}
const monthLabel = (m) => m <= 12 ? `M${m}` : `Y${Math.ceil(m / 12)} M${((m - 1) % 12) + 1}`

export default function Financials() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') || 'overview')
  return (
    <div>
      <PageHeader icon={Wallet} title="Financials" subtitle="Revenue, expenses, costs, team salaries, gross and net profit — your actual numbers tracked against the Digital Empire Financial Model." />
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'overview', label: 'Overview', icon: LayoutGrid }, { id: 'revenue', label: 'Revenue', icon: TrendingUp }, { id: 'costs', label: 'Costs & expenses', icon: Receipt },
        { id: 'team', label: 'Team & salaries', icon: Users }, { id: 'profit', label: 'Gross & net profit', icon: PiggyBank }, { id: 'scenarios', label: '5-year & scenarios', icon: Layers }, { id: 'log', label: 'Log actuals', icon: PencilLine },
      ]} />
      {tab === 'overview' && <Overview go={setTab} />}
      {tab === 'revenue' && <Revenue />}
      {tab === 'costs' && <Costs />}
      {tab === 'team' && <Team />}
      {tab === 'profit' && <Profit />}
      {tab === 'scenarios' && <Scenarios />}
      {tab === 'log' && <LogActuals />}
    </div>
  )
}

function useFin() {
  const { state } = useStore()
  const t = actualTotals(state)
  const f = scenarioFactor(state.profile.scenario)
  const months = t.months
  const planRev = sum(months.map(m => sum(ENGINES.map(e => planEngine(m, e.key))))) * f
  const planCostTot = sum(months.map(m => sum(COST_LINES.map(c => planCost(m, c.key)))))
  const directActual = sum(DIRECT_COSTS.map(k => t.cost[k] || 0))
  const directPlan = sum(months.map(m => sum(DIRECT_COSTS.map(k => planCost(m, k)))))
  return { state, t, f, months, planRev, planCostTot, gpActual: t.revenue - directActual, gpPlan: planRev - directPlan, directActual, directPlan }
}

function Variance({ actual, plan, inverse }) {
  if (!plan) return <span className="text-muted">—</span>
  const v = (actual - plan) / Math.abs(plan) * 100
  const good = inverse ? v <= 0 : v >= 0
  return <span className={`tabular-nums font-semibold ${good ? 'text-ok' : 'text-bad'}`}>{v >= 0 ? '+' : ''}{v.toFixed(0)}%</span>
}

function Overview({ go }) {
  const { state, t, f, months, planRev, planCostTot, gpActual, gpPlan } = useFin()
  const m = planMonth(state.profile.startDate)
  const labels = Y1.months
  const actRev = labels.map((_, i) => state.actuals[i + 1] ? sum(Object.values(state.actuals[i + 1].revenue || {})) : null)
  const actCost = labels.map((_, i) => state.actuals[i + 1] ? sum(Object.values(state.actuals[i + 1].costs || {})) : null)
  const payrollPct = t.revenue ? (t.cost.payroll || 0) / t.revenue * 100 : null
  return (
    <div className="space-y-5">
      {!months.length && <Callout tone="info" title="No actuals logged yet">The charts show the plan. <button className="underline font-semibold" onClick={() => go('log')}>Log your first month</button> to start tracking variance. You are in plan month M{m}.</Callout>}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Stat label="Revenue (logged)" value={fmtK(t.revenue)} sub={<>Plan {fmtK(planRev)} · <Variance actual={t.revenue} plan={planRev} /></>} />
        <Stat label="Total costs" value={fmtK(t.costs)} sub={<>Plan {fmtK(planCostTot)} · <Variance actual={t.costs} plan={planCostTot} inverse /></>} />
        <Stat label="Gross profit" value={fmtK(gpActual)} sub={t.revenue ? `${(gpActual / t.revenue * 100).toFixed(0)}% margin (Y1 plan 13.1%)` : 'Revenue − direct costs'} tone={gpActual >= 0 ? 'ok' : 'bad'} />
        <Stat label="Net profit" value={fmtK(t.net)} sub={t.revenue ? `${(t.net / t.revenue * 100).toFixed(0)}% net margin` : 'Revenue − all costs'} tone={t.net >= 0 ? 'ok' : 'bad'} />
        <Stat label="Cash balance" value={t.lastCash !== null ? fmtK(t.lastCash) : '—'} sub={t.lastMonth ? `Plan ${fmtK(t.lastMonth <= 12 ? Y1.cash[t.lastMonth - 1] : FIVE_YEAR.cashYearEnd[Math.ceil(t.lastMonth / 12) - 1])} at ${monthLabel(t.lastMonth)}` : 'Starts at A$20,000'} tone={t.lastCash !== null && t.lastCash < 2000 ? 'bad' : undefined} />
        <Stat label="Payroll / revenue" value={payrollPct !== null ? `${payrollPct.toFixed(0)}%` : '—'} sub="Target < 30% from Year 3" tone={payrollPct !== null && payrollPct > 60 ? 'warn' : undefined} />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Year 1: revenue vs costs" subtitle="Dashed = plan, solid = your actuals">
          <LineChart money labels={labels} datasets={[{ label: 'Plan revenue', data: Y1.totalRevenue.map(v => Math.round(v * f)), dashed: true, colorIndex: 0, points: 0 }, { label: 'Actual revenue', data: actRev, colorIndex: 0 }, { label: 'Plan costs', data: Y1.totalCosts, dashed: true, colorIndex: 1, points: 0 }, { label: 'Actual costs', data: actCost, colorIndex: 1 }]} height={290} />
        </Card>
        <Card title="Year 1: net cash flow (plan)" subtitle="First positive month M5; low cash A$1,142 in M11">
          <BarChart money labels={labels} datasets={[{ label: 'Plan net cash', data: Y1.netCash, color: undefined, backgroundColor: Y1.netCash.map(v => v >= 0 ? 'rgba(27,175,122,.85)' : 'rgba(227,73,72,.8)') }, ...(months.length ? [{ label: 'Actual net', data: labels.map((_, i) => state.actuals[i + 1] ? sum(Object.values(state.actuals[i + 1].revenue || {})) - sum(Object.values(state.actuals[i + 1].costs || {})) : null), colorIndex: 0 }] : [])]} height={290} />
        </Card>
      </div>
      <Card title="Effort allocation by year (plan)" subtitle="Founder + team time">
        <BarChart pct stacked labels={YEARS} datasets={EFFORT.map((e, i) => ({ label: e.area, data: e.v, colorIndex: i }))} height={240} />
      </Card>
    </div>
  )
}

function Revenue() {
  const { state, t, f, months } = useFin()
  const labels = Y1.months
  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card title="Year-1 plan revenue by engine" className="lg:col-span-2">
          <BarChart money stacked labels={labels} datasets={ENGINES.filter(e => e.y1).map((e, i) => ({ label: e.short, data: Y1.revenue[e.key].map(v => Math.round(v * f)), colorIndex: i }))} height={290} />
        </Card>
        <Card title="Revenue mix: Year 1 vs Year 5">
          <div className="grid grid-cols-1 gap-2">
            <DonutChart money labels={ENGINES.map(e => e.short)} data={ENGINES.map(e => e.y1)} height={190} />
            <DonutChart money labels={ENGINES.map(e => e.short)} data={ENGINES.map(e => e.y5)} height={190} />
          </div>
          <p className="text-xs text-muted mt-2">Top: Year 1 (services 97%). Bottom: Year 5 (assets, SaaS & products 28%). Recurring share rises 55% → 71%.</p>
        </Card>
      </div>
      {months.length > 0 && (
        <Card title="Your actual revenue by engine">
          <BarChart money stacked labels={months.map(monthLabel)} datasets={ENGINES.map((e, i) => ({ label: e.short, data: months.map(m => +(state.actuals[m].revenue?.[e.key] || 0)), colorIndex: i }))} height={260} />
        </Card>
      )}
      <Card title="Engine performance: actual vs plan (logged months)">
        <div className="scroll-x"><table className="table"><thead><tr><th>Engine</th><th className="num">Actual</th><th className="num">Plan</th><th className="num">Variance</th><th className="num">Y1 plan</th><th className="num">Y5 plan</th><th>Type</th></tr></thead><tbody>
          {ENGINES.map(e => { const plan = sum(months.map(m => planEngine(m, e.key))) * f; return (
            <tr key={e.key}><td className="font-medium">{e.name}</td><td className="num">{fmtA(t.rev[e.key] || 0)}</td><td className="num">{fmtA(plan)}</td><td className="num">{months.length ? <Variance actual={t.rev[e.key] || 0} plan={plan} /> : '—'}</td><td className="num">{fmtA(e.y1)}</td><td className="num">{fmtA(e.y5)}</td><td><Badge tone={e.recurring ? 'ok' : 'muted'}>{e.recurring ? 'Recurring' : 'One-off'}</Badge></td></tr>
          ) })}
          <tr className="font-bold"><td>Total</td><td className="num">{fmtA(t.revenue)}</td><td className="num">{fmtA(sum(months.map(m => sum(ENGINES.map(e => planEngine(m, e.key))))) * f)}</td><td /><td className="num">{fmtA(FIVE_YEAR.revenue[0])}</td><td className="num">{fmtA(FIVE_YEAR.revenue[4])}</td><td /></tr>
        </tbody></table></div>
        {t.revenue > 0 && <p className="text-sm mt-3">Your recurring share: <b>{((sum(ENGINES.filter(e => e.recurring).map(e => t.rev[e.key] || 0)) / t.revenue) * 100).toFixed(0)}%</b> (plan: 55% Y1, 65%+ from Y2).</p>}
      </Card>
    </div>
  )
}

function Costs() {
  const { state, t, months } = useFin()
  const fixed = COST_LINES.filter(c => c.fixed)
  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Year-1 plan costs by line" subtitle="Total A$71,617">
          <BarChart money horizontal labels={COST_LINES.filter(c => c.y1).map(c => c.name.length > 28 ? c.name.slice(0, 28) + '…' : c.name)} datasets={[{ label: 'Y1 plan', data: COST_LINES.filter(c => c.y1).map(c => c.y1) }]} height={420} legend={false} />
        </Card>
        <Card title="Monthly costs (plan)" subtitle="Fixed overheads vs variable delivery costs">
          <BarChart money stacked labels={Y1.months} datasets={[{ label: 'Fixed (payroll, tools, marketing, compliance, training)', data: Y1.months.map((_, i) => sum(fixed.map(c => Y1.costs[c.key][i]))), colorIndex: 0 }, { label: 'Variable & one-off', data: Y1.months.map((_, i) => Y1.totalCosts[i] - sum(fixed.map(c => Y1.costs[c.key][i]))), colorIndex: 1 }]} height={420} />
        </Card>
      </div>
      <Card title="Expenses: actual vs plan" subtitle={months.length ? `${months.length} logged month(s)` : 'Log actuals to see variance'}>
        <div className="scroll-x"><table className="table"><thead><tr><th>Cost line</th><th className="num">Actual</th><th className="num">Plan (logged months)</th><th className="num">Variance</th><th className="num">Y1 plan</th></tr></thead><tbody>
          {COST_LINES.map(c => { const plan = sum(months.map(m => planCost(m, c.key))); return (
            <tr key={c.key}><td className="font-medium">{c.name}{DIRECT_COSTS.includes(c.key) && <Badge className="ml-2">Direct</Badge>}</td><td className="num">{fmtA(t.cost[c.key] || 0)}</td><td className="num">{fmtA(plan)}</td><td className="num">{months.length ? <Variance actual={t.cost[c.key] || 0} plan={plan} inverse /> : '—'}</td><td className="num">{fmtA(c.y1)}</td></tr>
          ) })}
          <tr className="font-bold"><td>Total</td><td className="num">{fmtA(t.costs)}</td><td className="num">{fmtA(sum(months.map(m => sum(COST_LINES.map(c => planCost(m, c.key))))))}</td><td /><td className="num">{fmtA(71617)}</td></tr>
        </tbody></table></div>
      </Card>
      <Card title="Cost guardrails">
        <ul className="grid md:grid-cols-2 gap-3 text-sm">
          <Guard ok={!t.revenue || (t.cost.tools || 0) / t.revenue <= 0.06 || planMonth(state.profile.startDate) < 25} label="Tools below 6% of revenue (from Year 3)" val={t.revenue ? `${((t.cost.tools || 0) / t.revenue * 100).toFixed(0)}%` : '—'} />
          <Guard ok={!t.revenue || (t.cost.payroll || 0) / t.revenue <= 0.3 || planMonth(state.profile.startDate) < 25} label="Payroll below 30% of revenue (from Year 3)" val={t.revenue ? `${((t.cost.payroll || 0) / t.revenue * 100).toFixed(0)}%` : '—'} />
          <Guard ok label="A tool stays only if it saves 3x its cost or is billed to a client" val="Check in Calculators → Tool ROI" />
          <Guard ok={t.lastCash === null || t.lastCash >= 1000} label="Keep the emergency reserve (A$5,286)" val={t.lastCash !== null ? fmtA(t.lastCash) : '—'} />
        </ul>
      </Card>
    </div>
  )
}
const Guard = ({ ok, label, val }) => <li className={`flex items-start gap-2 p-3 rounded-xl border ${ok ? 'border-ok/30 bg-ok/5' : 'border-bad/30 bg-bad/5'}`}>{ok ? <ShieldCheck size={18} className="text-ok shrink-0" /> : <ShieldAlert size={18} className="text-bad shrink-0" />}<span><span className="font-medium">{label}</span><span className="block text-xs text-muted">{val}</span></span></li>

function Team() {
  const { state, update, addXP } = useStore()
  const t = actualTotals(state)
  const [form, setForm] = useState({ name: '', role: TEAM[0].role, pkr: TEAM[0].pkr, startMonth: planMonth(state.profile.startDate), fte: 1 })
  const loaded = (pkr) => pkr / FX.PKR_PER_AUD * (1 + FX.LOADING)
  const monthlyPayroll = sum(state.team.map(h => loaded(h.pkr) * h.fte))
  const recurringLast = t.lastMonth ? sum(ENGINES.filter(e => e.recurring).map(e => +(state.actuals[t.lastMonth].revenue?.[e.key] || 0))) : 0
  const newCost = loaded(+form.pkr || 0) * (+form.fte || 0)
  const guardOK = recurringLast >= 2 * (monthlyPayroll + newCost)
  return (
    <div className="space-y-5">
      <Card title="Team plan, salaries and hiring timeline" subtitle={`PKR ${FX.PKR_PER_AUD} per A$ · +${FX.LOADING * 100}% loading (equipment, internet, bonuses, transfer fees) · +${FX.RAISE * 100}% annual raises`}>
        <div className="scroll-x"><table className="table"><thead><tr><th>Role</th><th className="num">PKR/mo</th><th className="num">A$/mo</th><th className="num">Loaded A$</th>{YEARS.map((y, i) => <th key={i} className="num">Y{i + 1} FTE</th>)}<th>When to hire</th></tr></thead><tbody>
          {TEAM.map(r => <tr key={r.role}><td className="font-medium">{r.role}</td><td className="num">{r.pkr.toLocaleString()}</td><td className="num">{fmtA(r.aud)}</td><td className="num">{fmtA(loaded(r.pkr))}</td>{r.fte.map((f, i) => <td key={i} className="num">{f || '—'}</td>)}<td className="text-xs">{r.hire}</td></tr>)}
          <tr className="font-bold"><td>Total team cost (A$)</td><td /><td /><td />{FIVE_YEAR.teamCost.map((c, i) => <td key={i} className="num">{fmtK(c)}</td>)}<td /></tr>
        </tbody></table></div>
      </Card>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Team cost & FTE by year (plan)"><BarChart money labels={YEARS} datasets={[{ label: 'Team cost', data: FIVE_YEAR.teamCost }]} height={240} legend={false} /><p className="text-xs text-muted mt-2">Average FTE: {FIVE_YEAR.teamFTE.join(' → ')}</p></Card>
        <Card title="Year-1 headcount plan (FTE by month)"><BarChart stacked labels={Y1.months} datasets={Object.entries(Y1.fte).map(([k, v], i) => ({ label: k, data: v, colorIndex: i }))} height={240} /></Card>
      </div>
      <Card title="Your actual team" subtitle={`Monthly payroll (loaded): ${fmtA(monthlyPayroll)} · ${sum(state.team.map(h => +h.fte)).toFixed(1)} FTE`}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <Field label="Name"><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ali" /></Field>
          <Field label="Role"><select className="input" value={form.role} onChange={e => { const r = TEAM.find(x => x.role === e.target.value); setForm({ ...form, role: e.target.value, pkr: r?.pkr || form.pkr }) }}>{TEAM.map(r => <option key={r.role}>{r.role}</option>)}</select></Field>
          <Field label="Salary (PKR/mo)"><NumberInput value={form.pkr} onChange={v => setForm({ ...form, pkr: v })} /></Field>
          <Field label="FTE"><select className="input" value={form.fte} onChange={e => setForm({ ...form, fte: +e.target.value })}>{[0.25, 0.5, 0.75, 1].map(v => <option key={v}>{v}</option>)}</select></Field>
          <button className="btn btn-primary" onClick={() => { update(s => { s.team.push({ ...form, id: uid() }) }); addXP(30, 'Team member added'); setForm({ ...form, name: '' }) }}><Plus size={15} />Add hire</button>
        </div>
        <div className={`mt-4 p-3 rounded-xl border text-sm flex gap-2 ${guardOK ? 'border-ok/30 bg-ok/5' : 'border-warn/40 bg-warn/5'}`}>
          {guardOK ? <ShieldCheck size={18} className="text-ok shrink-0" /> : <ShieldAlert size={18} className="text-warn shrink-0" />}
          <div><b>Hiring guardrail:</b> recurring revenue (last logged month {fmtA(recurringLast)}) should cover 2× total payroll including this hire ({fmtA(2 * (monthlyPayroll + newCost))}) for 3 months. {guardOK ? 'You can afford this hire.' : 'Not yet — sign more recurring revenue first, or start half-time.'}</div>
        </div>
        {state.team.length > 0 ? (
          <div className="scroll-x mt-4"><table className="table"><thead><tr><th>Name</th><th>Role</th><th className="num">PKR</th><th className="num">Loaded A$</th><th className="num">FTE</th><th className="num">Cost/mo</th><th /></tr></thead><tbody>
            {state.team.map(h => <tr key={h.id}><td className="font-medium">{h.name || '—'}</td><td className="text-xs">{h.role}</td><td className="num">{(+h.pkr).toLocaleString()}</td><td className="num">{fmtA(loaded(h.pkr))}</td><td className="num">{h.fte}</td><td className="num">{fmtA(loaded(h.pkr) * h.fte)}</td><td><button aria-label="Remove" className="text-faint hover:text-bad" onClick={() => update(s => { s.team = s.team.filter(x => x.id !== h.id) })}><Trash2 size={14} /></button></td></tr>)}
          </tbody></table></div>
        ) : <p className="text-sm text-muted mt-4">No hires recorded yet. Plan: Tech Lead half-time in M1, SEO/AEO Specialist in M3.</p>}
      </Card>
    </div>
  )
}

function Profit() {
  const { state, f, months } = useFin()
  const gpPlan = Y1.months.map((_, i) => Math.round(Y1.totalRevenue[i] * f - sum(DIRECT_COSTS.map(k => Y1.costs[k][i]))))
  const npPlan = Y1.months.map((_, i) => Math.round(Y1.totalRevenue[i] * f - Y1.totalCosts[i]))
  const act = (i, direct) => { const a = state.actuals[i + 1]; if (!a) return null; const r = sum(Object.values(a.revenue || {})); const c = direct ? sum(DIRECT_COSTS.map(k => +(a.costs?.[k] || 0))) : sum(Object.values(a.costs || {})); return r - c }
  const [period, setPeriod] = useState('y1')
  const pl = useMemo(() => {
    const ms = period === 'y1' ? Array.from({ length: 12 }, (_, i) => i + 1) : months
    const rev = sum(ms.map(m => sum(ENGINES.map(e => planEngine(m, e.key))))) * f
    const direct = sum(ms.map(m => sum(DIRECT_COSTS.map(k => planCost(m, k)))))
    const overhead = sum(ms.map(m => sum(COST_LINES.filter(c => !DIRECT_COSTS.includes(c.key)).map(c => planCost(m, c.key)))))
    const aRev = sum(ms.map(m => sum(Object.values(state.actuals[m]?.revenue || {}))))
    const aDirect = sum(ms.map(m => sum(DIRECT_COSTS.map(k => +(state.actuals[m]?.costs?.[k] || 0)))))
    const aOver = sum(ms.map(m => sum(COST_LINES.filter(c => !DIRECT_COSTS.includes(c.key)).map(c => +(state.actuals[m]?.costs?.[c.key] || 0)))))
    return { rev, direct, overhead, aRev, aDirect, aOver }
  }, [period, months, state.actuals, f])
  const row = (label, p, a, bold, inverse) => <tr className={bold ? 'font-bold' : ''}><td>{label}</td><td className="num">{fmtA(p)}</td><td className="num">{fmtA(a)}</td><td className="num"><Variance actual={a} plan={p} inverse={inverse} /></td></tr>
  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Gross profit by month (Year 1)" subtitle="Revenue − direct delivery costs (payroll, contractors, fees, refunds, commissions)">
          <LineChart money labels={Y1.months} datasets={[{ label: 'Plan GP', data: gpPlan, dashed: true, colorIndex: 2, points: 0 }, { label: 'Actual GP', data: Y1.months.map((_, i) => act(i, true)), colorIndex: 2 }]} />
        </Card>
        <Card title="Net profit by month (Year 1)" subtitle="Revenue − all costs (before tax)">
          <LineChart money labels={Y1.months} datasets={[{ label: 'Plan net', data: npPlan, dashed: true, colorIndex: 6, points: 0 }, { label: 'Actual net', data: Y1.months.map((_, i) => act(i, false)), colorIndex: 6 }]} />
        </Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Profit & loss statement" action={<select className="input w-auto py-1 text-sm" value={period} onChange={e => setPeriod(e.target.value)}><option value="y1">Full Year 1</option><option value="logged">Logged months</option></select>}>
          <div className="scroll-x"><table className="table"><thead><tr><th>Line</th><th className="num">Plan</th><th className="num">Actual</th><th className="num">Var.</th></tr></thead><tbody>
            {row('Revenue', pl.rev, pl.aRev)}{row('Direct costs', pl.direct, pl.aDirect, false, true)}{row('Gross profit', pl.rev - pl.direct, pl.aRev - pl.aDirect, true)}
            {row('Overheads & one-offs', pl.overhead, pl.aOver, false, true)}{row('Net profit (pre-tax)', pl.rev - pl.direct - pl.overhead, pl.aRev - pl.aDirect - pl.aOver, true)}
            <tr><td className="text-muted">Tax reserve (25% of positive profit)</td><td className="num">{fmtA(Math.max(0, (pl.rev - pl.direct - pl.overhead) * 0.25))}</td><td className="num">{fmtA(Math.max(0, (pl.aRev - pl.aDirect - pl.aOver) * 0.25))}</td><td /></tr>
          </tbody></table></div>
        </Card>
        <Card title="5-year margins (plan)"><LineChart pct labels={YEARS} datasets={[{ label: 'Gross margin', data: FIVE_YEAR.grossMargin, colorIndex: 2 }, { label: 'Net margin', data: FIVE_YEAR.netMargin, colorIndex: 6 }]} /></Card>
      </div>
      <Card title="5-year profit plan">
        <div className="scroll-x"><table className="table"><thead><tr><th>A$</th>{YEARS.map(y => <th key={y} className="num">{y}</th>)}</tr></thead><tbody>
          <tr><td>Revenue</td>{FIVE_YEAR.revenue.map((v, i) => <td key={i} className="num">{fmtA(v)}</td>)}</tr>
          <tr><td>Gross profit</td>{FIVE_YEAR.grossProfit.map((v, i) => <td key={i} className="num">{fmtA(v)}</td>)}</tr>
          <tr><td>Gross margin</td>{FIVE_YEAR.grossMargin.map((v, i) => <td key={i} className="num">{v}%</td>)}</tr>
          <tr><td>Founder draw</td>{FIVE_YEAR.founderDraw.map((v, i) => <td key={i} className="num">{fmtA(v)}</td>)}</tr>
          <tr className="font-bold"><td>Net profit after tax</td>{FIVE_YEAR.netProfit.map((v, i) => <td key={i} className={`num ${v < 0 ? 'text-bad' : ''}`}>{fmtA(v)}</td>)}</tr>
          <tr><td>Net margin</td>{FIVE_YEAR.netMargin.map((v, i) => <td key={i} className="num">{v}%</td>)}</tr>
          <tr><td>Cash in company (year end)</td>{FIVE_YEAR.cashYearEnd.map((v, i) => <td key={i} className="num">{fmtA(v)}</td>)}</tr>
        </tbody></table></div>
      </Card>
    </div>
  )
}

function Scenarios() {
  const { state, update } = useStore()
  const keys = ['conservative', 'base', 'aggressive']
  const rows = [['Year-1 revenue', 'y1'], ['Year-3 revenue', 'y3'], ['Year-5 revenue', 'y5'], ['5-year revenue', 'total5'], ['5-year net profit', 'np5'], ['Year-5 SDE', 'sde5'], ['Cumulative founder draw', 'draws'], ['Cash in company, end Y5', 'cash5'], ['Indicative exit value', 'exit'], ['Founder wealth created', 'wealth']]
  return (
    <div className="space-y-5">
      <Card title="Your scenario" subtitle="Changes plan targets across the app (revenue lines are scaled to the scenario)">
        <div className="grid sm:grid-cols-3 gap-3">
          {keys.map(k => (
            <button key={k} onClick={() => update(s => { s.profile.scenario = k })} className={`p-4 rounded-xl border-2 text-left ${state.profile.scenario === k ? 'border-brand bg-brand/5' : 'border-line'}`}>
              <div className="font-semibold">{SCENARIOS[k].label}</div>
              <div className="text-2xl font-bold font-display mt-1">{fmtK(SCENARIOS[k].wealth)}</div>
              <div className="text-xs text-muted">founder wealth · A$1m in 5 yrs: {SCENARIOS[k].million}</div>
            </button>
          ))}
        </div>
      </Card>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Revenue by scenario"><BarChart money labels={['Year 1', 'Year 3', 'Year 5']} datasets={keys.map((k, i) => ({ label: SCENARIOS[k].label, data: [SCENARIOS[k].y1, SCENARIOS[k].y3, SCENARIOS[k].y5], colorIndex: i }))} /></Card>
        <Card title="Base case: revenue, net profit and cash"><BarChart money labels={YEARS} datasets={[{ label: 'Revenue', data: FIVE_YEAR.revenue, colorIndex: 0 }, { label: 'Net profit', data: FIVE_YEAR.netProfit, colorIndex: 2 }, { label: 'Cash (year end)', data: FIVE_YEAR.cashYearEnd, colorIndex: 1 }]} /></Card>
      </div>
      <Card title="Projections across scenarios">
        <div className="scroll-x"><table className="table"><thead><tr><th>A$</th>{keys.map(k => <th key={k} className="num">{SCENARIOS[k].label}</th>)}</tr></thead><tbody>
          {rows.map(([l, k]) => <tr key={k}><td>{l}</td>{keys.map(s => <td key={s} className="num">{fmtA(SCENARIOS[s][k])}</td>)}</tr>)}
          <tr><td>Year-5 gross / net margin</td>{keys.map(s => <td key={s} className="num">{SCENARIOS[s].gm5}% / {SCENARIOS[s].nm5}%</td>)}</tr>
          <tr><td>Exit multiple on SDE</td>{keys.map(s => <td key={s} className="num">{SCENARIOS[s].multiple}x</td>)}</tr>
        </tbody></table></div>
      </Card>
      <Card title="How the scenarios differ (levers)">
        <div className="scroll-x"><table className="table"><thead><tr><th>Lever</th>{keys.map(k => <th key={k} className="num">{SCENARIOS[k].label}</th>)}</tr></thead><tbody>
          {Object.keys(SCENARIOS.base.levers).map(l => <tr key={l}><td className="capitalize">{l}</td>{keys.map(k => <td key={k} className="num">×{SCENARIOS[k].levers[l]}</td>)}</tr>)}
        </tbody></table></div>
        <div className="mt-4"><Callout tone="warn" title="Conservative-case warning">Year-end cash is negative from Year 1 to Year 3 (deepest ≈A$(35.8k) end of Year 2). If you see conservative numbers after 6 months: freeze hiring, delay founder draw, push asset/SaaS spending back a year, or add A$15–40k of capital.</Callout></div>
      </Card>
    </div>
  )
}

function LogActuals() {
  const { state, update, addXP, notify } = useStore()
  const [m, setM] = useState(() => Math.min(60, Math.max(1, planMonth(state.profile.startDate))))
  const existing = state.actuals[m] || { revenue: {}, costs: {}, volume: {}, cash: '' }
  const [draft, setDraft] = useState(existing)
  const [loadedMonth, setLoadedMonth] = useState(m)
  if (loadedMonth !== m) { setDraft(state.actuals[m] || { revenue: {}, costs: {}, volume: {}, cash: '' }); setLoadedMonth(m) }
  const setV = (grp, k, v) => setDraft(d => ({ ...d, [grp]: { ...d[grp], [k]: v } }))
  const fillPlan = () => setDraft({
    revenue: Object.fromEntries(ENGINES.map(e => [e.key, Math.round(planEngine(m, e.key))])),
    costs: Object.fromEntries(COST_LINES.map(c => [c.key, Math.round(planCost(m, c.key))])),
    volume: m <= 12 ? { retainers: Y1.volume.retainers[m - 1], automationProjects: Y1.volume.automationProjects[m - 1], automationRetainers: Y1.volume.automationRetainers[m - 1], webProjects: Y1.volume.webProjects[m - 1], assetsLive: Y1.volume.assetsLive[m - 1] } : {},
    cash: m <= 12 ? Y1.cash[m - 1] : '',
  })
  const save = () => {
    const isNew = !state.actuals[m]
    update(s => { s.actuals[m] = draft })
    if (isNew) addXP(40, `Logged ${monthLabel(m)} actuals`); else notify(`${monthLabel(m)} updated`)
  }
  const exportCSV = () => {
    const ms = Object.keys(state.actuals).map(Number).sort((a, b) => a - b)
    const head = ['Line', ...ms.map(monthLabel)]
    const lines = [head, ...ENGINES.map(e => [`Revenue: ${e.name}`, ...ms.map(x => state.actuals[x].revenue?.[e.key] ?? '')]), ...COST_LINES.map(c => [`Cost: ${c.name}`, ...ms.map(x => state.actuals[x].costs?.[c.key] ?? '')]), ...VOLUME_FIELDS.map(([k, l]) => [`Volume: ${l}`, ...ms.map(x => state.actuals[x].volume?.[k] ?? '')]), ['Cash balance', ...ms.map(x => state.actuals[x].cash ?? '')]]
    const blob = new Blob([lines.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'digital-empire-actuals.csv'; a.click()
  }
  const rev = sum(Object.values(draft.revenue || {})), cost = sum(Object.values(draft.costs || {}))
  return (
    <div className="space-y-5">
      <div className="card p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <Field label="Month"><select className="input sm:w-48" value={m} onChange={e => setM(+e.target.value)}>{Array.from({ length: 60 }, (_, i) => i + 1).map(i => <option key={i} value={i}>{monthLabel(i)}{state.actuals[i] ? ' ✓' : ''}</option>)}</select></Field>
        <div className="flex gap-2 flex-wrap sm:ml-auto">
          <button className="btn btn-ghost" onClick={fillPlan}>Prefill with plan</button>
          <button className="btn btn-ghost" onClick={exportCSV} disabled={!Object.keys(state.actuals).length}><Download size={15} />Export CSV</button>
          {state.actuals[m] && <button className="btn btn-ghost" onClick={() => { if (confirm('Delete this month?')) update(s => { delete s.actuals[m] }) }}><Trash2 size={15} /></button>}
          <button className="btn btn-primary" onClick={save}>Save {monthLabel(m)}</button>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card title={`Revenue · ${fmtA(rev)}`} subtitle="A$ received this month by engine">
          <div className="space-y-2.5">{ENGINES.map(e => <Field key={e.key} label={e.name}><NumberInput prefix="A$" value={draft.revenue?.[e.key]} onChange={v => setV('revenue', e.key, v)} placeholder={`Plan ${Math.round(planEngine(m, e.key))}`} /></Field>)}</div>
        </Card>
        <Card title={`Costs · ${fmtA(cost)}`} subtitle="A$ spent this month by line">
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">{COST_LINES.map(c => <Field key={c.key} label={c.name}><NumberInput prefix="A$" value={draft.costs?.[c.key]} onChange={v => setV('costs', c.key, v)} placeholder={`Plan ${Math.round(planCost(m, c.key))}`} /></Field>)}</div>
        </Card>
        <div className="space-y-5">
          <Card title="Volumes & cash">
            <div className="space-y-2.5">
              {VOLUME_FIELDS.map(([k, l]) => <Field key={k} label={l}><NumberInput value={draft.volume?.[k]} onChange={v => setV('volume', k, v)} placeholder={m <= 12 && Y1.volume[k] ? `Plan ${Y1.volume[k][m - 1]}` : ''} /></Field>)}
              <Field label="Cash balance at month end"><NumberInput prefix="A$" value={draft.cash} onChange={v => setDraft(d => ({ ...d, cash: v }))} placeholder={m <= 12 ? `Plan ${Y1.cash[m - 1]}` : ''} /></Field>
            </div>
          </Card>
          <Card title="This month">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span>Revenue</span><b>{fmtA(rev)}</b></div>
              <div className="flex justify-between"><span>Costs</span><b>{fmtA(cost)}</b></div>
              <div className="flex justify-between"><span>Net cash flow</span><b className={rev - cost >= 0 ? 'text-ok' : 'text-bad'}>{fmtA(rev - cost)}</b></div>
              <div className="flex justify-between text-muted"><span>Plan net ({monthLabel(m)})</span><span>{m <= 12 ? fmtA(Y1.netCash[m - 1]) : '—'}</span></div>
            </div>
          </Card>
        </div>
      </div>
      {!Object.keys(state.actuals).length && <Empty title="Tip" text="Use 'Prefill with plan' and then overwrite with your real numbers. Volumes drive milestone auto-checks (e.g. retainers reached)." />}
    </div>
  )
}
