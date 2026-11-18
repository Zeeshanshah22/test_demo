import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, Clock, ListChecks, FileCheck2, Lightbulb, StickyNote, Bot } from 'lucide-react'
import { useStore } from '../store'
import { Card, Progress, Badge, Empty, Callout } from '../components/ui'
import { moduleById, ALL_MODULES, TIER_LABEL } from '../data/curriculum'
import { SKILL_WEIGHTS } from '../data/plan'
import { ASSIGNMENTS } from '../data/assignments'
import { lessonProgress, topicAccuracy, bestSubmission, allQuestions } from '../lib/scoring'
import { BarChart } from '../components/charts'

export default function ModulePage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, update, addXP } = useStore()
  const m = moduleById[id]
  const [openId, setOpenId] = useState(null)
  useEffect(() => {
    const h = window.location.hash.split('#')[2]
    setOpenId(h || m?.lessons.find(l => !state.lessons[l.id])?.id || m?.lessons[0]?.id)
  }, [id]) // eslint-disable-line
  if (!m) return <Empty title="Module not found" action={<Link className="btn btn-primary" to="/learn">Back to course</Link>} />

  const pr = lessonProgress(state).byModule[m.id]
  const acc = topicAccuracy(state)[m.id]
  const qCount = allQuestions(state).filter(q => q.topic === m.id).length
  const related = ASSIGNMENTS.filter(a => a.module === m.id)
  const idx = ALL_MODULES.findIndex(x => x.id === m.id)
  const next = ALL_MODULES[idx + 1]

  const toggle = (lid) => {
    const done = !!state.lessons[lid]
    update(s => { if (done) delete s.lessons[lid]; else s.lessons[lid] = new Date().toISOString() })
    if (!done) {
      addXP(m.tier === 1 ? 20 : 10, 'Lesson completed')
      const l = m.lessons.findIndex(x => x.id === lid)
      if (m.lessons[l + 1]) setOpenId(m.lessons[l + 1].id)
    }
  }

  return (
    <div className="max-w-5xl">
      <Link to="/learn" className="text-sm text-muted hover:text-brand inline-flex items-center gap-1 mb-3"><ArrowLeft size={15} />Course</Link>
      <div className="card p-5 mb-5">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge tone={m.tier === 1 ? 'brand' : m.tier === 0 ? 'accent' : 'muted'}>{TIER_LABEL[m.tier]}</Badge>
          {m.rank && <Badge>Rank #{m.rank}</Badge>}{m.score && <Badge tone="warn">Score {m.score}</Badge>}{m.start && <Badge>Start {m.start}</Badge>}{m.time && <Badge>{m.time}% of learning time</Badge>}
        </div>
        <h1 className="text-2xl font-bold">{m.name}</h1>
        {m.role && <p className="text-muted text-sm mt-1">Role in the plan: {m.role}</p>}
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <div><div className="text-xs text-muted mb-1">Lessons {pr.done}/{pr.total}</div><Progress value={pr.pct} tone={pr.pct === 100 ? 'ok' : 'brand'} /></div>
          <div className="text-sm"><span className="text-muted">Quiz accuracy: </span><b>{acc ? `${acc.pct.toFixed(0)}% (${acc.n} answers)` : 'not tested yet'}</b></div>
          <div className="flex gap-2 sm:justify-end flex-wrap">
            <button className="btn btn-primary btn-sm" onClick={() => nav(`/quiz?topic=${m.id}`)} disabled={!qCount}><ListChecks size={15} />Quiz ({qCount})</button>
            <Link className="btn btn-ghost btn-sm" to={`/coach?q=${encodeURIComponent('Explain ' + m.name + ' and how it fits my plan')}`}><Bot size={15} />Ask coach</Link>
          </div>
        </div>
        {m.id === 'parasite' && <div className="mt-4"><Callout tone="bad" title="Avoid">High spam-policy risk. This module is here so you can explain the risk to clients — never use it on client sites.</Callout></div>}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {m.lessons.map((l, i) => {
            const done = !!state.lessons[l.id]
            const open = openId === l.id
            return (
              <div key={l.id} id={l.id} className={`card overflow-hidden ${open ? 'border-brand/40' : ''}`}>
                <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setOpenId(open ? null : l.id)} aria-expanded={open}>
                  {done ? <CheckCircle2 className="text-ok shrink-0" size={22} /> : <Circle className="text-faint shrink-0" size={22} />}
                  <div className="flex-1 min-w-0"><div className="text-xs text-muted">Lesson {i + 1}</div><div className="font-semibold">{l.title}</div></div>
                  <span className="text-xs text-muted flex items-center gap-1 shrink-0"><Clock size={12} />{l.minutes}m</span>
                </button>
                {open && (
                  <div className="px-4 pb-4 fade-in">
                    <ul className="space-y-2">
                      {l.points.map((pt, k) => <li key={k} className="flex gap-2.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" /><span>{pt}</span></li>)}
                    </ul>
                    <div className="mt-4 rounded-xl bg-accent/10 border border-accent/25 p-3 text-sm flex gap-2"><Lightbulb size={17} className="text-accent shrink-0 mt-0.5" /><div><b>Action task:</b> {l.action}</div></div>
                    <label className="block mt-3">
                      <span className="label flex items-center gap-1"><StickyNote size={12} />Your notes</span>
                      <textarea className="input min-h-[80px]" placeholder="Write what you learned or your action-task answer…" value={state.lessonNotes[l.id] || ''} onChange={e => update(s => { s.lessonNotes[l.id] = e.target.value })} />
                    </label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button className={`btn ${done ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggle(l.id)}>{done ? 'Mark as not done' : 'Mark complete (+XP)'}</button>
                      <Link className="btn btn-ghost" to={`/coach?q=${encodeURIComponent(`Check my answer to the action task "${l.action}": ${state.lessonNotes[l.id] || ''}`)}`}><Bot size={15} />Get feedback</Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {next && <Link to={`/learn/${next.id}`} className="card p-4 flex items-center justify-between hover:border-brand/40"><span className="text-sm"><span className="text-muted">Next module:</span> <b>{next.name}</b></span><span className="text-brand">→</span></Link>}
        </div>

        <div className="space-y-5">
          {related.length > 0 && (
            <Card title="Assignments">
              <ul className="space-y-2">{related.map(a => { const b = bestSubmission(state, a.id); return (
                <li key={a.id}><Link to={`/assignments/${a.id}`} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-line hover:border-brand/40"><span className="flex items-center gap-2 text-sm font-medium"><FileCheck2 size={15} className="text-brand" />{a.title}</span>{b ? <Badge tone={b.score >= 80 ? 'ok' : 'warn'}>{b.score}</Badge> : <Badge>To do</Badge>}</Link></li>
              ) })}</ul>
            </Card>
          )}
          {m.scores && (
            <Card title="Why this skill scores high" subtitle="Plan scores (1–10) on the 10 weighted factors">
              <BarChart horizontal labels={SKILL_WEIGHTS.map(w => `${w.name} (${w.w}%)`)} datasets={[{ label: 'Score', data: SKILL_WEIGHTS.map(w => m.scores[w.key]) }]} height={300} legend={false} />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
