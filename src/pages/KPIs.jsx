import { useState } from 'react'
import { Gauge, Save, CheckCircle2, XCircle } from 'lucide-react'
import { useStore, uid } from '../store'
import { PageHeader, Card, Field, NumberInput, Badge, Empty, Progress } from '../components/ui'
import { LineChart, RadarChart } from '../components/charts'
import { KPI_TARGETS } from '../data/plan'

const weekStart = (d = new Date()) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return x.toISOString().slice(0, 10) }
const hit = (k, v) => v === '' || v === undefined || v === null ? null : (k.dir === 'up' ? +v >= k.target : +v <= k.target)
const attain = (k, v) => { if (v === '' || v === undefined) return null; const r = k.dir === 'up' ? +v / k.target : (+v === 0 ? 2 : k.target / +v); return Math.max(0, Math.min(100, r * 100)) }

export default function KPIs() {
  const { state, update, addXP } = useStore()
  const [week, setWeek] = useState(weekStart())
  const existing = state.kpis.find(k => k.week === week)
  const [vals, setVals] = useState(existing?.values || {})
  const [loaded, setLoaded] = useState(week)
  if (loaded !== week) { setVals(state.kpis.find(k => k.week === week)?.values || {}); setLoaded(week) }
  const save = () => {
    update(s => { const i = s.kpis.findIndex(k => k.week === week); const rec = { id: existing?.id || uid(), week, values: vals }; if (i >= 0) s.kpis[i] = rec; else s.kpis.push(rec); s.kpis.sort((a, b) => a.week.localeCompare(b.week)) })
    if (!existing) addXP(30, 'Weekly KPI scorecard logged')
  }
  const latest = state.kpis[state.kpis.length - 1]
  const hits = latest ? KPI_TARGETS.filter(k => hit(k, latest.values[k.key])).length : 0
  const measured = latest ? KPI_TARGETS.filter(k => hit(k, latest.values[k.key]) !== null).length : 0

  return (
    <div>
      <PageHeader icon={Gauge} title="KPI Scorecard" subtitle="The plan's weekly and monthly targets: MRR growth, gross margin, churn, CAC, LTV:CAC, recurring share, utilisation, delivery and NPS." />
      <div className="grid lg:grid-cols-3 gap-5">
        <Card title="Log this week" subtitle="Leave blank anything you don't track yet">
          <Field label="Week starting"><input type="date" className="input" value={week} onChange={e => setWeek(weekStart(new Date(e.target.value)))} /></Field>
          <div className="space-y-3 mt-3">
            {KPI_TARGETS.map(k => (
              <Field key={k.key} label={`${k.name} (${k.dir === 'up' ? '≥' : '≤'} ${k.target}${k.unit})`}>
                <NumberInput value={vals[k.key]} onChange={v => setVals({ ...vals, [k.key]: v })} suffix={k.unit} />
              </Field>
            ))}
          </div>
          <button className="btn btn-primary w-full mt-4" onClick={save}><Save size={15} />Save scorecard</button>
        </Card>
        <div className="lg:col-span-2 space-y-5">
          {!latest ? <div className="card"><Empty icon={Gauge} title="No scorecards yet" text="Log your first week to see which KPIs are on target and where you are lagging." /></div> : (
            <>
              <Card title={`Latest week: ${latest.week}`} subtitle={`${hits} of ${measured} measured KPIs on target`}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {KPI_TARGETS.map(k => { const v = latest.values[k.key]; const h = hit(k, v); return (
                    <div key={k.key} className={`p-3 rounded-xl border ${h === null ? 'border-line' : h ? 'border-ok/30 bg-ok/5' : 'border-bad/30 bg-bad/5'}`}>
                      <div className="flex justify-between items-start gap-2"><span className="text-sm font-medium">{k.name}</span>{h === null ? <Badge>Not tracked</Badge> : h ? <CheckCircle2 size={17} className="text-ok" /> : <XCircle size={17} className="text-bad" />}</div>
                      <div className="text-xl font-bold font-display mt-1 tabular-nums">{v === '' || v === undefined ? '—' : `${v}${k.unit}`}<span className="text-xs text-muted font-normal ml-2">target {k.dir === 'up' ? '≥' : '≤'} {k.target}{k.unit}</span></div>
                      {h !== null && <div className="mt-1.5"><Progress value={attain(k, v)} size="sm" tone={h ? 'ok' : 'bad'} /></div>}
                      <div className="text-[11px] text-faint mt-1">{k.note}</div>
                    </div>
                  ) })}
                </div>
              </Card>
              <Card title="Target attainment" subtitle="100 = on target"><RadarChart labels={KPI_TARGETS.map(k => k.name.split(' (')[0])} datasets={[{ label: 'This week', data: KPI_TARGETS.map(k => attain(k, latest.values[k.key]) ?? 0) }, { label: 'Target', data: KPI_TARGETS.map(() => 100), colorIndex: 1, dashed: true }]} /></Card>
              {state.kpis.length > 1 && (
                <Card title="Trends">
                  <div className="grid md:grid-cols-2 gap-5">
                    <LineChart pct labels={state.kpis.map(k => k.week.slice(5))} datasets={['grossMargin', 'recurringShare', 'utilisation'].map((key, i) => ({ label: KPI_TARGETS.find(k => k.key === key).name, data: state.kpis.map(w => w.values[key] === '' ? null : w.values[key] ?? null), colorIndex: i }))} />
                    <LineChart labels={state.kpis.map(k => k.week.slice(5))} datasets={[{ label: 'LTV:CAC (x)', data: state.kpis.map(w => w.values.ltvCac ?? null), colorIndex: 3 }, { label: 'Churn %', data: state.kpis.map(w => w.values.churn ?? null), colorIndex: 7 }]} />
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
