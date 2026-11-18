import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Search, Clock, Star, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store'
import { PageHeader, Card, Progress, Badge, Tabs } from '../components/ui'
import { BarChart, DonutChart } from '../components/charts'
import { ALL_MODULES, SKILLS, PLAYBOOK, TIER_LABEL, LEARNING_ORDER, moduleById } from '../data/curriculum'
import { lessonProgress, topicAccuracy } from '../lib/scoring'

export default function Learn() {
  const { state } = useStore()
  const lp = lessonProgress(state)
  const acc = topicAccuracy(state)
  const [tab, setTab] = useState('skills')
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('rank')

  const list = useMemo(() => {
    let l = tab === 'skills' ? SKILLS : PLAYBOOK.map(p => ({ ...p, tier: 0 }))
    if (q) l = l.filter(m => (m.name + ' ' + (m.role || '') + ' ' + m.lessons.map(x => x.title + x.points.join(' ')).join(' ')).toLowerCase().includes(q.toLowerCase()))
    if (tier !== 'all') l = l.filter(m => String(m.tier) === tier)
    if (status !== 'all') l = l.filter(m => { const p = lp.byModule[m.id].pct; return status === 'done' ? p === 100 : status === 'progress' ? p > 0 && p < 100 : p === 0 })
    if (sort === 'progress') l = [...l].sort((a, b) => lp.byModule[b.id].pct - lp.byModule[a.id].pct)
    if (sort === 'name') l = [...l].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'score') l = [...l].sort((a, b) => (b.score || 0) - (a.score || 0))
    return l
  }, [tab, q, tier, status, sort, lp])

  const tierData = [1, 2, 3, 4].map(t => { const ms = SKILLS.filter(s => s.tier === t); const d = ms.reduce((a, m) => a + lp.byModule[m.id].done, 0), tot = ms.reduce((a, m) => a + m.lessons.length, 0); return Math.round(d / tot * 100) })

  return (
    <div>
      <PageHeader icon={GraduationCap} title="Course" subtitle="The Digital Empire playbook plus every SEBT skill, ranked and tiered exactly as in the business plan. Tier 1 gets 60% of your learning time." />
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Card title="Your 120-day learning order" subtitle="Spend about 70% of study time here. Hire for the rest." className="lg:col-span-2">
          <ol className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
            {LEARNING_ORDER.map((id, i) => {
              const m = moduleById[id], pr = lp.byModule[id]
              return (
                <li key={id}><Link to={`/learn/${id}`} className="block p-3 rounded-xl border border-line hover:border-brand/50 h-full">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold text-brand">Step {i + 1}</span>{pr.pct === 100 && <CheckCircle2 size={15} className="text-ok" />}</div>
                  <div className="font-semibold text-sm mt-1">{m.name}</div>
                  <div className="mt-2"><Progress value={pr.pct} size="sm" tone={pr.pct === 100 ? 'ok' : 'brand'} /></div>
                </Link></li>
              )
            })}
          </ol>
        </Card>
        <Card title="Progress by tier">
          <BarChart labels={['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']} datasets={[{ label: 'Completed %', data: tierData }]} pct height={190} legend={false} />
          <div className="text-xs text-muted mt-2">Playbook: {lp.playbook.toFixed(0)}% · Overall: {lp.pct.toFixed(0)}%</div>
        </Card>
      </div>

      <Tabs value={tab} onChange={(t) => { setTab(t); setTier('all') }} tabs={[{ id: 'skills', label: `SEBT skills (${SKILLS.length})` }, { id: 'playbook', label: `Business plan playbook (${PLAYBOOK.length})` }]} />

      <div className="card p-3 mb-4 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><input className="input pl-9" placeholder="Search modules and lessons" value={q} onChange={e => setQ(e.target.value)} /></div>
        {tab === 'skills' && <select className="input md:w-36" value={tier} onChange={e => setTier(e.target.value)} aria-label="Tier"><option value="all">All tiers</option>{[1, 2, 3, 4].map(t => <option key={t} value={t}>Tier {t}</option>)}</select>}
        <select className="input md:w-40" value={status} onChange={e => setStatus(e.target.value)} aria-label="Status"><option value="all">Any status</option><option value="todo">Not started</option><option value="progress">In progress</option><option value="done">Completed</option></select>
        <select className="input md:w-40" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort"><option value="rank">Plan rank</option>{tab === 'skills' && <option value="score">Skill score</option>}<option value="progress">Progress</option><option value="name">Name</option></select>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(m => {
          const pr = lp.byModule[m.id]
          const a = acc[m.id]
          const mins = m.lessons.reduce((x, l) => x + l.minutes, 0)
          return (
            <Link key={m.id} to={`/learn/${m.id}`} className="card p-4 hover:border-brand/50 transition-colors flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={m.tier === 1 ? 'brand' : m.tier === 0 ? 'accent' : 'muted'}>{TIER_LABEL[m.tier]}</Badge>
                  {m.rank && <Badge>#{m.rank}</Badge>}
                  {m.start && <Badge tone={m.start === 'Avoid' ? 'bad' : 'muted'}>{m.start}</Badge>}
                </div>
                {m.score && <span className="flex items-center gap-1 text-xs font-bold text-warn"><Star size={13} />{m.score}</span>}
              </div>
              <h3 className="font-semibold mt-2">{m.name}</h3>
              {m.role && <p className="text-xs text-muted mt-0.5">{m.role}</p>}
              <div className="mt-auto pt-3">
                <div className="flex justify-between text-xs text-muted mb-1"><span className="flex items-center gap-1"><Clock size={12} />{m.lessons.length} lessons · {mins} min{m.time ? ` · ${m.time}% time` : ''}</span><span>{pr.done}/{pr.total}</span></div>
                <Progress value={pr.pct} size="sm" tone={pr.pct === 100 ? 'ok' : 'brand'} />
                {a && <div className="text-xs mt-2">Quiz accuracy: <b className={a.pct >= 75 ? 'text-ok' : a.pct >= 55 ? 'text-warn' : 'text-bad'}>{a.pct.toFixed(0)}%</b></div>}
              </div>
            </Link>
          )
        })}
      </div>
      {tab === 'skills' && (
        <Card title="Where your learning time goes (plan)" className="mt-5">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <DonutChart labels={['Tier 1 (60%)', 'Tier 2 (25%)', 'Tier 3 (12%)', 'Tier 4 (3%)']} data={[60, 25, 12, 3]} />
            <p className="text-sm text-muted">Learning time is split 60/25/12/3% across Tiers 1–4, then shared within each tier in proportion to the skill score. Parasite SEO is listed so you understand the risk — never use it for clients.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
