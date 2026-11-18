import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { KanbanSquare, Plus, Trash2, ChevronLeft, ChevronRight, Send, ListPlus, CalendarDays, Megaphone } from 'lucide-react'
import { useStore, uid } from '../store'
import { PageHeader, Card, Tabs, Badge, Field, NumberInput, Stat, Empty, Progress } from '../components/ui'
import { BarChart, LineChart } from '../components/charts'
import { WORKFLOW_TEMPLATES } from '../data/milestones'
import { OUTREACH_TARGETS, FUNNEL_BENCH, WEEKLY_RHYTHM, sum } from '../data/plan'

const COLS = [{ id: 'todo', label: 'To do' }, { id: 'doing', label: 'In progress' }, { id: 'review', label: 'Review / QA' }, { id: 'done', label: 'Done' }]
const PRI = { high: 'bad', medium: 'warn', low: 'muted' }

export default function Workflow() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') || 'board')
  return (
    <div>
      <PageHeader icon={KanbanSquare} title="Workflow" subtitle="Run the business day to day: a task board with plan-based workflow templates, the daily outreach system, and the weekly operating rhythm." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'board', label: 'Task board', icon: KanbanSquare }, { id: 'outreach', label: 'Daily outreach', icon: Megaphone }, { id: 'rhythm', label: 'Weekly rhythm', icon: CalendarDays }]} />
      {tab === 'board' && <Board />}
      {tab === 'outreach' && <Outreach />}
      {tab === 'rhythm' && <Rhythm />}
    </div>
  )
}

function Board() {
  const { state, update, addXP } = useStore()
  const [title, setTitle] = useState('')
  const [pri, setPri] = useState('medium')
  const [due, setDue] = useState('')
  const [board, setBoard] = useState('all')
  const boards = [...new Set(state.cards.map(c => c.board))]
  const cards = state.cards.filter(c => board === 'all' || c.board === board)

  const add = () => { if (!title.trim()) return; update(s => { s.cards.push({ id: uid(), title: title.trim(), col: 'todo', board: 'My tasks', priority: pri, due, created: new Date().toISOString() }) }); setTitle(''); setDue('') }
  const move = (c, dir) => {
    const idx = COLS.findIndex(x => x.id === c.col), next = COLS[idx + dir]
    if (!next) return
    update(s => { s.cards.find(x => x.id === c.id).col = next.id })
    if (next.id === 'done') addXP(c.priority === 'high' ? 15 : 8, 'Task completed')
  }
  const addTemplate = (t) => {
    update(s => { t.tasks.forEach((task, i) => s.cards.push({ id: uid(), title: task, col: 'todo', board: t.name, priority: i < 2 ? 'high' : 'medium', due: '', created: new Date().toISOString() })) })
    setBoard(t.name)
  }

  return (
    <div className="space-y-5">
      <Card title="Workflow templates" subtitle="Add a ready-made checklist from the plan to your board">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORKFLOW_TEMPLATES.map(t => (
            <div key={t.id} className="p-3 rounded-xl border border-line flex flex-col">
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-muted mt-1 line-clamp-2">{t.tasks.slice(0, 3).join(' → ')}…</div>
              <button className="btn btn-ghost btn-sm mt-3 self-start" onClick={() => addTemplate(t)}><ListPlus size={14} />Add {t.tasks.length} tasks</button>
            </div>
          ))}
        </div>
      </Card>
      <div className="card p-3 flex flex-col md:flex-row gap-2">
        <input className="input flex-1" placeholder="Add a task…" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <select className="input md:w-32" value={pri} onChange={e => setPri(e.target.value)} aria-label="Priority"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
        <input type="date" className="input md:w-44" value={due} onChange={e => setDue(e.target.value)} aria-label="Due date" />
        <button className="btn btn-primary" onClick={add}><Plus size={15} />Add</button>
        <select className="input md:w-52" value={board} onChange={e => setBoard(e.target.value)} aria-label="Board filter"><option value="all">All boards</option>{boards.map(b => <option key={b}>{b}</option>)}</select>
      </div>
      {!state.cards.length ? <div className="card"><Empty icon={KanbanSquare} title="Your board is empty" text="Add a template above (start with 'Daily outreach system') or create your own tasks." /></div> : (
        <div className="scroll-x -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="grid grid-cols-4 gap-3 min-w-[920px]">
            {COLS.map(col => {
              const list = cards.filter(c => c.col === col.id)
              return (
                <div key={col.id} className="rounded-2xl bg-surface-2 border border-line p-2.5"
                  onDragOver={e => e.preventDefault()} onDrop={e => { const id = e.dataTransfer.getData('id'); const c = state.cards.find(x => x.id === id); if (c && c.col !== col.id) { update(s => { s.cards.find(x => x.id === id).col = col.id }); if (col.id === 'done') addXP(8, 'Task completed') } }}>
                  <div className="flex justify-between items-center px-1.5 py-1 mb-1"><span className="font-semibold text-sm">{col.label}</span><Badge>{list.length}</Badge></div>
                  <div className="space-y-2 min-h-[80px]">
                    {list.map(c => {
                      const overdue = c.due && c.col !== 'done' && new Date(c.due) < new Date(new Date().toDateString())
                      return (
                        <div key={c.id} draggable onDragStart={e => e.dataTransfer.setData('id', c.id)} className="card p-3 cursor-grab active:cursor-grabbing">
                          <div className={`text-sm font-medium ${c.col === 'done' ? 'line-through text-muted' : ''}`}>{c.title}</div>
                          <div className="flex flex-wrap gap-1 mt-2"><Badge tone={PRI[c.priority]}>{c.priority}</Badge>{c.board !== 'My tasks' && <Badge>{c.board}</Badge>}{c.due && <Badge tone={overdue ? 'bad' : 'muted'}>{overdue ? 'Overdue ' : ''}{new Date(c.due).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</Badge>}</div>
                          <div className="flex justify-between mt-2">
                            <div className="flex gap-1"><button aria-label="Move left" className="btn btn-ghost btn-sm px-1.5" disabled={col.id === 'todo'} onClick={() => move(c, -1)}><ChevronLeft size={14} /></button><button aria-label="Move right" className="btn btn-ghost btn-sm px-1.5" disabled={col.id === 'done'} onClick={() => move(c, 1)}><ChevronRight size={14} /></button></div>
                            <button aria-label="Delete" className="text-faint hover:text-bad" onClick={() => update(s => { s.cards = s.cards.filter(x => x.id !== c.id) })}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {state.cards.length > 0 && <div className="flex justify-end"><button className="btn btn-ghost btn-sm" onClick={() => update(s => { s.cards = s.cards.filter(c => c.col !== 'done') })}>Clear done tasks</button></div>}
    </div>
  )
}

const FIELDS = [['emails', 'Cold emails', 30], ['proposals', 'Upwork proposals', 10], ['looms', 'Loom audits', 5], ['linkedin', 'LinkedIn connections', 20], ['calls', 'Calls booked', null], ['deals', 'Deals closed', null]]

function Outreach() {
  const { state, update, addXP } = useStore()
  const today = new Date().toISOString().slice(0, 10)
  const ex = state.outreach.find(o => o.date === today)
  const [d, setD] = useState(ex || { date: today, emails: '', proposals: '', looms: '', linkedin: '', calls: '', deals: '' })
  const save = () => {
    update(s => { const i = s.outreach.findIndex(o => o.date === d.date); if (i >= 0) s.outreach[i] = d; else s.outreach.push(d); s.outreach.sort((a, b) => a.date.localeCompare(b.date)) })
    const hit = (+d.emails >= 30) + (+d.proposals >= 10) + (+d.looms >= 5)
    if (!ex) addXP(15 + hit * 10, `Outreach logged (${hit}/3 targets)`)
  }
  const last = state.outreach.slice(-30)
  const tot = (k) => sum(state.outreach.map(o => +o[k] || 0))
  const emails = tot('emails'), calls = tot('calls'), deals = tot('deals'), proposals = tot('proposals')
  const replies = emails * ((FUNNEL_BENCH.replyLow + FUNNEL_BENCH.replyHigh) / 2)
  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card title="Log today's outreach" subtitle="Plan targets: 30 emails, 10 proposals, 5 Loom audits a day">
          <Field label="Date"><input type="date" className="input" value={d.date} onChange={e => { const o = state.outreach.find(x => x.date === e.target.value); setD(o || { date: e.target.value, emails: '', proposals: '', looms: '', linkedin: '', calls: '', deals: '' }) }} /></Field>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {FIELDS.map(([k, l, t]) => (
              <Field key={k} label={l}><NumberInput value={d[k]} onChange={v => setD({ ...d, [k]: v })} placeholder={t ? `Target ${t}` : '0'} />{t && <div className="mt-1"><Progress value={(+d[k] || 0) / t * 100} size="sm" tone={(+d[k] || 0) >= t ? 'ok' : 'accent'} /></div>}</Field>
            ))}
          </div>
          <button className="btn btn-primary w-full mt-4" onClick={save}><Send size={15} />Save day</button>
        </Card>
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Days logged" value={state.outreach.length} />
            <Stat label="Emails sent" value={emails.toLocaleString()} />
            <Stat label="Calls booked" value={calls} />
            <Stat label="Deals closed" value={deals} tone="ok" />
          </div>
          <Card title="Activity vs daily targets (last 30 days)">
            {last.length ? <BarChart labels={last.map(o => o.date.slice(5))} datasets={[{ label: 'Emails', data: last.map(o => +o.emails || 0), colorIndex: 0 }, { label: 'Proposals', data: last.map(o => +o.proposals || 0), colorIndex: 1 }, { label: 'Looms', data: last.map(o => +o.looms || 0), colorIndex: 2 }]} height={240} /> : <Empty title="No days logged" text="Log today's numbers to start your funnel." />}
          </Card>
        </div>
      </div>
      <Card title="Your funnel vs plan benchmarks" subtitle="Benchmark: 1,000 emails → 2–4% replies → 8–15 calls → 2–4 clients. Upwork: 5–10% hire rate.">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-3 text-sm">
            {[['Emails sent', emails, null], ['Expected replies (2–4%)', Math.round(replies), null], ['Calls booked', calls, `Benchmark ${Math.round(emails / 1000 * FUNNEL_BENCH.callsLow)}–${Math.round(emails / 1000 * FUNNEL_BENCH.callsHigh)}`], ['Deals closed', deals, `Benchmark ${(emails / 1000 * FUNNEL_BENCH.clientsLow).toFixed(1)}–${(emails / 1000 * FUNNEL_BENCH.clientsHigh).toFixed(1)}`], ['Upwork proposals', proposals, `Expect ${(proposals * 0.05).toFixed(1)}–${(proposals * 0.1).toFixed(1)} hires`]].map(([l, v, b]) => (
              <div key={l} className="flex justify-between gap-3 border-b border-line pb-2"><span>{l}</span><span className="text-right"><b className="tabular-nums">{v.toLocaleString()}</b>{b && <span className="block text-xs text-muted">{b}</span>}</span></div>
            ))}
          </div>
          <div>
            {state.outreach.length > 1 ? <LineChart labels={state.outreach.map(o => o.date.slice(5))} datasets={[{ label: 'Cumulative calls', data: state.outreach.map((_, i) => sum(state.outreach.slice(0, i + 1).map(o => +o.calls || 0))), colorIndex: 0 }, { label: 'Cumulative deals', data: state.outreach.map((_, i) => sum(state.outreach.slice(0, i + 1).map(o => +o.deals || 0))), colorIndex: 2 }]} height={220} /> : <p className="text-sm text-muted">Log at least two days to see your trend.</p>}
            <p className="text-xs text-muted mt-2">Follow up at days 3, 7, 14 and 30 — most deals close after the third touch.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Rhythm() {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card title="Weekly operating rhythm (plan)">
        <ul className="space-y-3">{WEEKLY_RHYTHM.map(r => <li key={r.day} className="flex gap-3"><Badge tone="brand" className="w-20 justify-center">{r.day}</Badge><span className="text-sm">{r.focus}</span></li>)}</ul>
        <p className="text-sm text-muted mt-4">Run a quarterly 90-day sprint review and decide hires and investments there.</p>
      </Card>
      <Card title="Daily outreach system">
        <ol className="space-y-2 text-sm list-decimal pl-5">
          <li><b>Build lists</b>: one niche, one city from Google Maps. Note reviews, map rank, AI mentions, site speed.</li>
          <li><b>Record a 2-minute Loom audit</b>: your rank vs 3 competitors, what ChatGPT says, 3 fixes.</li>
          <li><b>Send a short email</b>: "[Business] is invisible in ChatGPT". Two lines, the video, one question.</li>
          <li><b>Missed-call test</b>: call after hours; if nobody answers, pitch the AI receptionist.</li>
          <li><b>Book a 20-minute call</b>: diagnose → numbers → one plan → 3-option price sheet → close with paid audit or 3-month start.</li>
          <li><b>Follow up</b> at days 3, 7, 14 and 30.</li>
        </ol>
      </Card>
      <Card title="Daily targets" className="lg:col-span-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Object.entries(OUTREACH_TARGETS).filter(([, v]) => v).map(([k, v]) => <div key={k} className="p-4 rounded-xl bg-surface-2 text-center"><div className="text-2xl font-bold font-display">{v}</div><div className="text-xs text-muted capitalize">{k === 'linkedin' ? 'LinkedIn requests' : k}/day</div></div>)}</div>
        <p className="text-sm text-muted mt-3">Time zones: Pakistan is 5–6 hours behind eastern Australia — book client calls in your morning, schedule team production for their evening. LinkedIn: 3 posts/week.</p>
      </Card>
    </div>
  )
}
