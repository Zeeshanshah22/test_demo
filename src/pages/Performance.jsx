import { Link } from 'react-router-dom'
import { BarChart3, TrendingUp, TrendingDown, Users, Award, ArrowRight } from 'lucide-react'
import { useStore } from '../store'
import { PageHeader, Card, Badge, Progress, Stat, Callout } from '../components/ui'
import { RadarChart, BarChart, LineChart } from '../components/charts'
import { peerComparison, strengthsAndGaps, recommendations, empireScore, totalXP, levelFor, topicAccuracy, LEVELS, scenarioTracking, percentile } from '../lib/scoring'
import { moduleById, SKILLS } from '../data/curriculum'

export default function Performance() {
  const { state } = useStore()
  const peers = peerComparison(state)
  const { strong, weak } = strengthsAndGaps(state)
  const recs = recommendations(state)
  const score = empireScore(state)
  const xp = totalXP(state)
  const lvl = levelFor(xp)
  const acc = topicAccuracy(state)
  const track = scenarioTracking(state)
  const overallPct = percentile(score / 10, peers.reduce((a, p) => a + p.peer, 0) / peers.length, 15)

  // XP over time (cumulative by day)
  const byDay = {}
  state.xpLog.forEach(x => { const d = x.date.slice(0, 10); byDay[d] = (byDay[d] || 0) + x.xp })
  const days = Object.keys(byDay).sort()
  let c = 0; const cum = days.map(d => (c += byDay[d]))
  const tier1 = SKILLS.filter(s => s.tier === 1)

  return (
    <div>
      <PageHeader icon={BarChart3} title="Performance" subtitle="Where you are working well, where you are lagging, and how you compare with a peer on the plan's pace." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Empire score" value={`${score}/1000`} tone="brand" />
        <Stat label="Level" value={lvl.name} sub={`${xp.toLocaleString()} XP`} />
        <Stat label="Peer percentile" value={`P${overallPct}`} sub={`Ahead of ${overallPct}% of a simulated on-plan cohort`} tone={overallPct >= 50 ? 'ok' : 'warn'} />
        <Stat label="Scenario signal" value={track.label} sub={`${track.ret} retainers vs plan ${track.planRet}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card title="You vs benchmark peers" subtitle="On-plan peer = expected progress at your day; top 10% = ahead of plan">
          <RadarChart labels={peers.map(p => p.name)} datasets={[{ label: 'You', data: peers.map(p => Math.round(p.value)), colorIndex: 0 }, { label: 'On-plan peer', data: peers.map(p => Math.round(p.peer)), colorIndex: 1, dashed: true }, { label: 'Top 10%', data: peers.map(p => Math.round(p.top)), colorIndex: 2, dashed: true }]} height={320} />
        </Card>
        <Card title="Percentile by area" subtitle="How far ahead or behind you are">
          <div className="space-y-3">
            {peers.map(p => (
              <div key={p.key}>
                <div className="flex justify-between text-sm"><span className="font-medium">{p.name}</span><span className="text-muted tabular-nums">{Math.round(p.value)} vs {Math.round(p.peer)} · <b className={p.percentile >= 50 ? 'text-ok' : 'text-bad'}>P{p.percentile}</b></span></div>
                <Progress value={p.percentile} tone={p.percentile >= 60 ? 'ok' : p.percentile >= 40 ? 'warn' : 'bad'} size="sm" />
              </div>
            ))}
          </div>
          <p className="text-xs text-faint mt-4"><Users size={12} className="inline mr-1" />The peer cohort is simulated from the plan's expected pace (this app stores data only in your browser, so there is no live leaderboard).</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card title={<span className="flex items-center gap-2"><TrendingUp size={18} className="text-ok" />Working well</span>}>
          {strong.length ? <ul className="space-y-2">{strong.slice(0, 8).map((s, i) => <li key={i} className="flex justify-between gap-3 p-2.5 rounded-lg bg-ok/5 border border-ok/20 text-sm"><span className="font-medium">{s.name}</span><span className="text-muted text-xs text-right">{s.why}</span></li>)}</ul> : <p className="text-sm text-muted">Complete lessons, quizzes and log your numbers to reveal strengths.</p>}
        </Card>
        <Card title={<span className="flex items-center gap-2"><TrendingDown size={18} className="text-bad" />Lagging — fix these first</span>}>
          {weak.length ? <ul className="space-y-2">{weak.slice(0, 8).map((w, i) => (
            <li key={i} className="flex justify-between items-center gap-3 p-2.5 rounded-lg bg-bad/5 border border-bad/20 text-sm">
              <span><span className="font-medium">{w.name}</span><span className="block text-xs text-muted">{w.why}</span></span>
              {w.topic ? <Link className="btn btn-ghost btn-sm" to={`/quiz?topic=${w.topic}`}>Drill</Link> : <Badge tone="bad">−{Math.round(w.gap)}</Badge>}
            </li>
          ))}</ul> : <p className="text-sm text-muted">Nothing lagging — you are at or above plan pace everywhere.</p>}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Card title="Tier-1 skill mastery" subtitle="Quiz accuracy on your most important skills" className="lg:col-span-2">
          <BarChart pct labels={tier1.map(s => s.name)} datasets={[{ label: 'Quiz accuracy %', data: tier1.map(s => Math.round(acc[s.id]?.pct || 0)) }]} legend={false} height={230} />
        </Card>
        <Card title="Level path">
          <ol className="space-y-2">{LEVELS.map((l, i) => <li key={l.name} className={`flex justify-between items-center p-2 rounded-lg text-sm ${i === lvl.index ? 'bg-brand/10 font-semibold' : i < lvl.index ? 'text-muted' : ''}`}><span className="flex items-center gap-2"><Award size={15} className={i <= lvl.index ? 'text-accent' : 'text-faint'} />{l.name}</span><span className="tabular-nums text-xs">{l.min.toLocaleString()} XP</span></li>)}</ol>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="XP growth over time">{days.length > 1 ? <LineChart labels={days.map(d => d.slice(5))} datasets={[{ label: 'Cumulative XP', data: cum }]} area /> : <p className="text-sm text-muted">Keep going — your XP trend appears after two active days.</p>}</Card>
        <Card title="Recommendations to stay ahead of peers">
          <ul className="space-y-2">{recs.map((r, i) => <li key={i}><Link to={r.to} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-line hover:border-brand/40"><span><span className="block text-sm font-semibold">{r.title}</span><span className="text-xs text-muted">{r.why}</span></span><ArrowRight size={16} className="text-brand shrink-0" /></Link></li>)}</ul>
          <div className="mt-4"><Callout tone="info" title="Competitive edge">Most SEBT graduates sell low-priced gigs globally. Your edge is selling AEO + AI automation to Australian businesses at AU prices. Keep 3+ assignments client-ready and log outreach daily to stay ahead.</Callout></div>
        </Card>
      </div>
    </div>
  )
}
