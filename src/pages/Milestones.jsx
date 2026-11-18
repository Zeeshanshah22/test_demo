import { useState } from 'react'
import { Flag, CheckCircle2, Circle, AlertTriangle, Zap, CalendarDays } from 'lucide-react'
import { useStore } from '../store'
import { PageHeader, Card, Badge, Progress, Stat, Callout } from '../components/ui'
import { BarChart, DonutChart } from '../components/charts'
import { MILESTONES, PHASE_ORDER } from '../data/milestones'
import { YEAR_GOALS, fmtK } from '../data/plan'
import { milestoneStatus, milestoneStats, dayNumber, scenarioTracking } from '../lib/scoring'

export default function Milestones() {
  const { state, update, addXP } = useStore()
  const [phase, setPhase] = useState('all')
  const [cat, setCat] = useState('all')
  const [status, setStatus] = useState('all')
  const ms = milestoneStats(state)
  const day = dayNumber(state.profile.startDate)
  const track = scenarioTracking(state)
  const cats = [...new Set(MILESTONES.map(m => m.cat))]
  const startDate = new Date(state.profile.startDate + 'T00:00:00')
  const dateFor = (d) => { const x = new Date(startDate); x.setDate(x.getDate() + d - 1); return x.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: day > 300 ? 'numeric' : undefined }) }

  const toggle = (m) => {
    const rec = state.milestones[m.id]
    update(s => { s.milestones[m.id] = rec?.done ? { done: false } : { done: true, date: new Date().toISOString() } })
    if (!rec?.done) addXP(day <= m.due ? 60 : 30, day <= m.due ? 'Milestone hit on time' : 'Milestone completed')
  }

  const filtered = MILESTONES.filter(m => (phase === 'all' || m.phase === phase) && (cat === 'all' || m.cat === cat) && (status === 'all' || milestoneStatus(state, m).key === status))
  const phaseData = PHASE_ORDER.map(p => { const l = MILESTONES.filter(m => m.phase === p); return Math.round(l.filter(m => milestoneStatus(state, m).done).length / l.length * 100) })
  const statusCounts = ['done', 'overdue', 'due', 'upcoming'].map(k => MILESTONES.filter(m => milestoneStatus(state, m).key === k).length)
  const onTrack = ms.onTrackPct >= 80 && track.label !== 'Conservative'

  return (
    <div>
      <PageHeader icon={Flag} title="Milestones" subtitle="Every milestone from the year-by-year execution plan and your first 30 days, timed from your start date. Milestones with a ⚡ tick themselves when your logged numbers reach the target." />
      <div className={`card p-4 mb-5 flex flex-col md:flex-row gap-4 md:items-center ${onTrack ? 'border-ok/40' : 'border-warn/50'}`}>
        <div className={`w-12 h-12 rounded-xl grid place-items-center ${onTrack ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn'}`}>{onTrack ? <CheckCircle2 /> : <AlertTriangle />}</div>
        <div className="flex-1">
          <div className="font-semibold text-lg">{onTrack ? 'You are on track' : 'You are behind plan'}</div>
          <div className="text-sm text-muted">Day {day}: {ms.doneDue} of {ms.dueCount} milestones due so far are done ({ms.onTrackPct.toFixed(0)}%). Scenario signal: <b>{track.label}</b> — {track.ret} active retainers vs plan {track.planRet} at M{track.month}.</div>
        </div>
        <div className="w-full md:w-56"><Progress value={ms.onTrackPct} tone={onTrack ? 'ok' : 'warn'} size="lg" /></div>
      </div>
      {track.label === 'Conservative' && <div className="mb-5"><Callout tone="bad" title="Conservative trigger hit">Fewer than 2 retainers by Month 6. The plan says: fix the offer or niche before hiring, freeze hiring, delay founder draw.</Callout></div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Completed" value={`${ms.done}/${ms.total}`} tone="ok" />
        <Stat label="On time" value={ms.onTime} />
        <Stat label="Overdue" value={ms.overdue} tone={ms.overdue ? 'bad' : 'ok'} />
        <Stat label="Due in 14 days" value={statusCounts[2]} tone="warn" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Card title="Completion by phase" className="lg:col-span-2"><BarChart pct labels={PHASE_ORDER} datasets={[{ label: 'Done %', data: phaseData }]} legend={false} height={220} /></Card>
        <Card title="Status"><DonutChart labels={['Done', 'Overdue', 'Due soon', 'Upcoming']} data={statusCounts} colors={['var(--success)', 'var(--danger)', 'var(--warning)', 'var(--faint)'].map(v => getComputedStyle(document.documentElement).getPropertyValue(v.slice(4, -1)).trim())} height={220} /></Card>
      </div>

      <div className="card p-3 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select className="input" value={phase} onChange={e => setPhase(e.target.value)} aria-label="Phase"><option value="all">All phases</option>{PHASE_ORDER.map(p => <option key={p}>{p}</option>)}</select>
        <select className="input" value={cat} onChange={e => setCat(e.target.value)} aria-label="Category"><option value="all">All categories</option>{cats.map(c => <option key={c}>{c}</option>)}</select>
        <select className="input" value={status} onChange={e => setStatus(e.target.value)} aria-label="Status"><option value="all">Any status</option><option value="done">Done</option><option value="overdue">Overdue</option><option value="due">Due soon</option><option value="upcoming">Upcoming</option></select>
      </div>

      <div className="space-y-5">
        {PHASE_ORDER.filter(p => filtered.some(m => m.phase === p)).map(p => (
          <Card key={p} title={p} subtitle={`${MILESTONES.filter(m => m.phase === p && milestoneStatus(state, m).done).length}/${MILESTONES.filter(m => m.phase === p).length} done`}>
            <ul className="divide-y divide-line">
              {filtered.filter(m => m.phase === p).map(m => {
                const s = milestoneStatus(state, m)
                return (
                  <li key={m.id} className="py-3 flex items-start gap-3">
                    <button onClick={() => toggle(m)} aria-label={s.done ? 'Mark not done' : 'Mark done'} className="mt-0.5">{s.done ? <CheckCircle2 className="text-ok" size={22} /> : <Circle className="text-faint hover:text-brand" size={22} />}</button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${s.done ? 'line-through text-muted' : ''}`}>{m.title} {m.auto && <Zap size={13} className="inline text-accent" aria-label="Auto-checked" />}</div>
                      <div className="flex flex-wrap gap-1.5 mt-1 text-xs text-muted items-center"><Badge>{m.cat}</Badge><span className="flex items-center gap-1"><CalendarDays size={12} />Day {m.due} · {dateFor(m.due)}</span>{s.auto && <Badge tone="accent">Auto-detected</Badge>}</div>
                    </div>
                    <Badge tone={s.key === 'done' ? (s.onTime ? 'ok' : 'warn') : s.key === 'overdue' ? 'bad' : s.key === 'due' ? 'warn' : 'muted'}>{s.label}</Badge>
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
      </div>

      <Card title="Year goals (base case)" className="mt-5">
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3">
          {YEAR_GOALS.map(y => (
            <div key={y.year} className={`p-4 rounded-xl border ${Math.ceil(day / 365) === y.year ? 'border-brand bg-brand/5' : 'border-line'}`}>
              <div className="text-xs font-bold text-brand">YEAR {y.year}</div>
              <div className="font-semibold">{y.title}</div>
              <div className="text-xs text-muted mt-1">{fmtK(y.revenue)} revenue · {y.team} FTE · draw {fmtK(y.draw)}</div>
              <ul className="mt-2 space-y-1 text-xs">{y.goals.map(g => <li key={g} className="flex gap-1.5"><span className="text-brand">•</span>{g}</li>)}</ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
