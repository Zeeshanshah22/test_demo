import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileCheck2, CalendarClock } from 'lucide-react'
import { useStore } from '../store'
import { PageHeader, Card, Badge, Stat, Progress } from '../components/ui'
import { BarChart } from '../components/charts'
import { ASSIGNMENTS } from '../data/assignments'
import { moduleById } from '../data/curriculum'
import { bestSubmission, assignmentStats, dayNumber } from '../lib/scoring'

export default function Assignments() {
  const { state } = useStore()
  const [filter, setFilter] = useState('all')
  const st = assignmentStats(state)
  const day = dayNumber(state.profile.startDate)
  const rows = ASSIGNMENTS.map(a => ({ a, best: bestSubmission(state, a.id), tries: state.submissions.filter(s => s.assignmentId === a.id).length }))
  const list = rows.filter(r => filter === 'all' || (filter === 'todo' ? !r.best : filter === 'rework' ? r.best && r.best.score < 80 : r.best && r.best.score >= 80))

  return (
    <div>
      <PageHeader icon={FileCheck2} title="Assignments" subtitle="Real business deliverables from the plan. Upload a file or paste your work — the app checks it against a rubric, points out mistakes and shows how to fix them." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Submitted" value={`${st.submitted}/${st.total}`} />
        <Stat label="Average best score" value={st.submitted ? st.avg.toFixed(0) : '—'} tone={st.avg >= 80 ? 'ok' : 'warn'} />
        <Stat label="Client-ready (80+)" value={rows.filter(r => r.best?.score >= 80).length} tone="ok" />
        <Stat label="Overdue" value={rows.filter(r => !r.best && day > r.a.due).length} tone="bad" />
      </div>
      {st.submitted > 0 && (
        <Card title="Best score per assignment" className="mb-5">
          <BarChart labels={rows.filter(r => r.best).map(r => r.a.title.length > 22 ? r.a.title.slice(0, 22) + '…' : r.a.title)} datasets={[{ label: 'Best score', data: rows.filter(r => r.best).map(r => r.best.score) }]} legend={false} height={220} />
        </Card>
      )}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[['all', 'All'], ['todo', 'Not submitted'], ['rework', 'Needs rework'], ['done', 'Client-ready']].map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={`chip py-1.5 px-3 cursor-pointer ${filter === k ? 'chip-brand' : 'chip-muted'}`}>{l}</button>)}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(({ a, best, tries }) => {
          const overdue = !best && day > a.due
          return (
            <Link key={a.id} to={`/assignments/${a.id}`} className="card p-4 hover:border-brand/50 flex flex-col">
              <div className="flex justify-between gap-2"><Badge tone="brand">{moduleById[a.module]?.name}</Badge>{best ? <Badge tone={best.score >= 80 ? 'ok' : 'warn'}>{best.score}/100</Badge> : <Badge tone={overdue ? 'bad' : 'muted'}>{overdue ? 'Overdue' : 'To do'}</Badge>}</div>
              <h3 className="font-semibold mt-2">{a.title}</h3>
              <p className="text-sm text-muted mt-1 line-clamp-3">{a.brief}</p>
              <div className="mt-auto pt-3">
                <div className="flex justify-between text-xs text-muted mb-1"><span className="flex items-center gap-1"><CalendarClock size={12} />Target: day {a.due}</span><span>{tries} attempt{tries === 1 ? '' : 's'}</span></div>
                <Progress value={best?.score || 0} size="sm" tone={best ? (best.score >= 80 ? 'ok' : 'warn') : 'brand'} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
