import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, ListChecks, FileCheck2, Flag, Wallet, Target, TrendingUp, Flame, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store'
import { Card, Stat, Progress, Ring, Badge } from '../components/ui'
import { LineChart, RadarChart } from '../components/charts'
import { areaScores, empireScore, totalXP, levelFor, streak, lessonProgress, quizStats, assignmentStats, milestoneStats, actualTotals, dayNumber, planMonth, recommendations, peerComparison, scenarioTracking, planMonthValue, scenarioFactor } from '../lib/scoring'
import { Y1, fmtA, fmtK, FIVE_YEAR, SCENARIOS } from '../data/plan'

export default function Dashboard() {
  const { state } = useStore()
  const p = state.profile
  const day = dayNumber(p.startDate), month = planMonth(p.startDate)
  const score = empireScore(state), xp = totalXP(state), lvl = levelFor(xp)
  const lp = lessonProgress(state), qs = quizStats(state), as = assignmentStats(state), ms = milestoneStats(state)
  const t = actualTotals(state)
  const recs = recommendations(state)
  const peers = peerComparison(state)
  const track = scenarioTracking(state)
  const f = scenarioFactor(p.scenario)
  const upcoming = ms.list.filter(x => !x.s.done).sort((a, b) => a.m.due - b.m.due).slice(0, 5)

  const months = Y1.months
  const actualRev = months.map((_, i) => state.actuals[i + 1] ? Object.values(state.actuals[i + 1].revenue || {}).reduce((a, b) => a + (+b || 0), 0) : null)
  const actualCash = months.map((_, i) => state.actuals[i + 1]?.cash !== undefined && state.actuals[i + 1]?.cash !== '' ? +state.actuals[i + 1].cash : null)

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="hero-grad rounded-2xl p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="text-accent text-sm font-semibold flex items-center gap-1.5"><Sparkles size={15} />Day {day} · Plan month M{month} · {SCENARIOS[p.scenario].label} scenario</div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1.5">{p.name ? `G'day, ${p.name}` : 'Welcome back'} — let's build your empire.</h1>
            <p className="text-white/80 text-sm mt-2 max-w-2xl">Goal: {p.goal}. {p.niche ? `Niche: ${p.niche}${p.city ? ' in ' + p.city : ''}.` : 'Set your niche in Settings to tailor quizzes and feedback.'}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link to={recs[0]?.to || '/learn'} className="btn btn-accent">{recs[0] ? recs[0].title : 'Continue learning'}<ArrowRight size={16} /></Link>
              <Link to="/quiz?mode=daily" className="btn bg-white/10 text-white hover:bg-white/20">Daily challenge</Link>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Ring value={score} max={1000} size={128} label={score} sub="Empire score" color="var(--accent)" />
            <div className="space-y-2 text-sm">
              <div className="font-semibold">{lvl.name}</div>
              <div className="text-white/75 text-xs">{xp.toLocaleString()} XP{lvl.next ? ` · ${lvl.next.min - xp} to ${lvl.next.name}` : ''}</div>
              <div className="w-36 h-1.5 bg-white/15 rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: `${lvl.pct}%` }} /></div>
              <div className="flex items-center gap-1 text-xs text-white/80"><Flame size={13} className="text-accent" />{streak(state)}-day streak</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <Stat label="Course" value={`${lp.pct.toFixed(0)}%`} sub={`${lp.done}/${lp.total} lessons`} icon={GraduationCap} to="/learn" />
        <Stat label="Quiz accuracy" value={qs.answered ? `${qs.pct.toFixed(0)}%` : '—'} sub={`${qs.answered} answered`} icon={ListChecks} to="/quiz" tone={qs.answered ? (qs.pct >= 75 ? 'ok' : qs.pct >= 55 ? 'warn' : 'bad') : undefined} />
        <Stat label="Assignments" value={as.submitted ? `${as.avg.toFixed(0)}` : '—'} sub={`${as.submitted}/${as.total} submitted`} icon={FileCheck2} to="/assignments" />
        <Stat label="Milestones" value={`${ms.done}/${ms.total}`} sub={ms.overdue ? `${ms.overdue} overdue` : 'None overdue'} tone={ms.overdue ? 'bad' : 'ok'} icon={Flag} to="/milestones" />
        <Stat label="Revenue to date" value={fmtK(t.revenue)} sub={t.months.length ? `${t.months.length} month(s) logged` : 'Log actuals'} icon={Wallet} to="/financials" />
        <Stat label="Tracking" value={track.label} sub={`${track.ret} retainers vs plan ${track.planRet}`} tone={{ success: 'ok', danger: 'bad', warning: 'warn', info: 'brand' }[track.tone]} icon={Target} to="/performance" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card title="Next best actions" subtitle="Personalised from your progress and the plan" className="lg:col-span-1">
          <ul className="space-y-2">
            {recs.map((r, i) => (
              <li key={i}><Link to={r.to} className="flex items-start gap-3 p-3 rounded-xl border border-line hover:border-brand/40 hover:bg-surface-2 transition-colors">
                <span className="w-6 h-6 rounded-full bg-brand/10 text-brand grid place-items-center text-xs font-bold shrink-0">{i + 1}</span>
                <span className="min-w-0"><span className="block text-sm font-semibold">{r.title}</span><span className="block text-xs text-muted mt-0.5">{r.why}</span></span>
              </Link></li>
            ))}
          </ul>
        </Card>

        <Card title="Strengths vs benchmark peers" subtitle="Your area scores vs a peer on plan pace (simulated benchmark)" className="lg:col-span-1">
          <RadarChart labels={peers.map(p => p.name)} datasets={[{ label: 'You', data: peers.map(p => Math.round(p.value)), colorIndex: 0 }, { label: 'On-plan peer', data: peers.map(p => Math.round(p.peer)), colorIndex: 1, dashed: true }]} height={280} />
        </Card>

        <Card title="Upcoming milestones" action={<Link to="/milestones" className="text-xs text-brand font-semibold">All</Link>}>
          <ul className="space-y-2.5">
            {upcoming.map(({ m, s }) => (
              <li key={m.id} className="flex items-start gap-2.5">
                {s.key === 'overdue' ? <AlertTriangle size={16} className="text-bad mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="text-faint mt-0.5 shrink-0" />}
                <div className="min-w-0 flex-1"><div className="text-sm font-medium leading-snug">{m.title}</div><div className="text-xs text-muted">{m.phase}</div></div>
                <Badge tone={s.key === 'overdue' ? 'bad' : s.key === 'due' ? 'warn' : 'muted'}>{s.label}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Year-1 revenue: actual vs plan" subtitle={`Plan line adjusted to ${SCENARIOS[p.scenario].label} scenario`} action={<Link to="/financials?tab=log" className="btn btn-ghost btn-sm">Log month</Link>}>
          <LineChart money labels={months} datasets={[{ label: 'Plan', data: Y1.totalRevenue.map(v => Math.round(v * f)), dashed: true, colorIndex: 1, points: 0 }, { label: 'Actual', data: actualRev, colorIndex: 0 }]} />
        </Card>
        <Card title="Cash runway: actual vs plan" subtitle="Plan starts with A$20,000; low point A$1,142 in M11">
          <LineChart money labels={months} datasets={[{ label: 'Plan cash', data: Y1.cash, dashed: true, colorIndex: 1, points: 0 }, { label: 'Actual cash', data: actualCash, colorIndex: 0 }]} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card title="Area scores" className="lg:col-span-2" action={<Link to="/performance" className="text-xs text-brand font-semibold">Details</Link>}>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {areaScores(state).map(a => (
              <div key={a.key}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium">{a.name}</span><span className="tabular-nums text-muted">{Math.round(a.value)}</span></div>
                <Progress value={a.value} tone={a.value >= 75 ? 'ok' : a.value >= 50 ? 'warn' : 'bad'} label={a.name} />
                <div className="text-xs text-faint mt-1">{a.hint}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="5-year plan at a glance">
          <div className="space-y-3">
            {FIVE_YEAR.revenue.map((r, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm"><span className="font-medium">Year {i + 1} {i + 1 === Math.ceil(month / 12) && <Badge tone="brand" className="ml-1">You are here</Badge>}</span><span className="tabular-nums">{fmtK(r)}</span></div>
                <Progress value={r / FIVE_YEAR.revenue[4] * 100} size="sm" tone={i + 1 === Math.ceil(month / 12) ? 'accent' : 'brand'} />
                <div className="text-[11px] text-muted mt-0.5">Net {fmtA(FIVE_YEAR.netProfit[i])} · {FIVE_YEAR.teamFTE[i]} FTE</div>
              </div>
            ))}
            <Link to="/financials?tab=scenarios" className="btn btn-ghost btn-sm w-full"><TrendingUp size={14} />Scenarios & projections</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
