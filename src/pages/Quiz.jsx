import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ListChecks, Target, Zap, Sparkles, History, Brain, CheckCircle2, XCircle, Globe, Loader2, RotateCcw, Trophy } from 'lucide-react'
import { useStore, uid } from '../store'
import { PageHeader, Card, Tabs, Badge, Progress, Field, Callout, Empty, Stat } from '../components/ui'
import { LineChart, BarChart } from '../components/charts'
import { QTYPES, checkAnswer, correctText } from '../data/questions'
import { ALL_MODULES, moduleById } from '../data/curriculum'
import { allQuestions, topicAccuracy, quizStats } from '../lib/scoring'
import { aiGenerateQuestions, hasKey } from '../lib/ai'

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export default function Quiz() {
  const { state } = useStore()
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('mode') === 'history' ? 'history' : 'take')
  const bank = allQuestions(state)
  // auto-start from URL (?topic=, ?mode=placement|daily)
  const [session, setSession] = useState(() => {
    const mode = params.get('mode'), topic = params.get('topic')
    if (topic) return build(bank, state, { mode: 'topic', topic, count: 8 })
    if (mode === 'placement' || mode === 'daily') return build(bank, state, { mode })
    return null
  })

  if (session) return <Runner session={session} onExit={() => setSession(null)} onRetry={(s) => setSession(build(bank, state, s.config))} />

  return (
    <div>
      <PageHeader icon={ListChecks} title="Quizzes & Tests" subtitle="Check your level with multiple choice, true/false, fill-in-the-blank dropdowns, select-all and calculation questions. Every answer updates your knowledge score." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'take', label: 'Take a quiz', icon: Target }, { id: 'ai', label: 'AI question generator', icon: Sparkles }, { id: 'history', label: 'Results & history', icon: History }]} />
      {tab === 'take' && <TakePanel bank={bank} start={(c) => setSession(build(bank, state, c))} />}
      {tab === 'ai' && <AIPanel start={(qs, c) => setSession({ questions: qs, config: c, title: c.title })} />}
      {tab === 'history' && <HistoryPanel />}
    </div>
  )
}

function build(bank, state, config) {
  const acc = topicAccuracy(state)
  const wrongIds = new Set(state.quizAttempts.flatMap(a => a.items).filter(i => !i.ok).map(i => i.qid))
  const seen = new Set(state.quizAttempts.flatMap(a => a.items).map(i => i.qid))
  let qs = bank
  let title = 'Quiz'
  if (config.mode === 'placement') {
    // 12 questions spread across playbook + tier-1 skills and difficulties
    const topics = shuffle([...new Set(bank.map(q => q.topic))])
    const picked = []
    for (const d of [1, 2, 3, 2, 1, 3, 2, 2, 3, 1, 2, 3]) {
      const cand = shuffle(bank.filter(q => q.d === d && !picked.includes(q) && !picked.some(p => p.topic === q.topic)))
      if (cand[0]) picked.push(cand[0])
    }
    qs = picked; title = 'Placement test'; void topics
  } else if (config.mode === 'daily') {
    const unseen = shuffle(bank.filter(q => !seen.has(q.id)))
    qs = [...unseen.slice(0, 3), ...shuffle(bank.filter(q => wrongIds.has(q.id))).slice(0, 2)]
    if (qs.length < 5) qs = [...qs, ...shuffle(bank.filter(q => !qs.includes(q)))].slice(0, 5)
    title = 'Daily challenge'
  } else if (config.mode === 'weak') {
    const weakTopics = Object.entries(acc).sort((a, b) => a[1].pct - b[1].pct).slice(0, 3).map(([k]) => k)
    qs = shuffle(bank.filter(q => wrongIds.has(q.id) || weakTopics.includes(q.topic))).slice(0, config.count || 10)
    title = 'Weak-area drill'
  } else {
    if (config.topic && config.topic !== 'all') qs = qs.filter(q => q.topic === config.topic)
    if (config.difficulty && config.difficulty !== 'all') qs = qs.filter(q => q.d === +config.difficulty)
    if (config.types?.length) qs = qs.filter(q => config.types.includes(q.type))
    qs = shuffle(qs).slice(0, config.count || 10)
    title = config.topic && config.topic !== 'all' ? `${moduleById[config.topic]?.name || config.topic} quiz` : 'Mixed quiz'
  }
  return { questions: qs, config, title, timed: config.timed }
}

function TakePanel({ bank, start }) {
  const { state } = useStore()
  const [topic, setTopic] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [count, setCount] = useState(10)
  const [types, setTypes] = useState([])
  const [timed, setTimed] = useState(false)
  const acc = topicAccuracy(state)
  const available = bank.filter(q => (topic === 'all' || q.topic === topic) && (difficulty === 'all' || q.d === +difficulty) && (!types.length || types.includes(q.type))).length
  const hasHistory = state.quizAttempts.length > 0

  const quick = [
    { mode: 'placement', icon: Brain, title: 'Placement test', text: '12 questions across the plan and Tier-1 skills, mixed difficulty. Sets your level.', tone: 'bg-brand' },
    { mode: 'daily', icon: Zap, title: 'Daily challenge', text: '5 questions: new ones plus ones you missed before. Keeps your streak alive.', tone: 'bg-accent' },
    { mode: 'weak', icon: Target, title: 'Weak-area drill', text: hasHistory ? 'Targets your lowest-scoring topics and past mistakes.' : 'Take a quiz first to unlock.', tone: 'bg-bad', disabled: !hasHistory },
  ]
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-4">
        {quick.map(q => (
          <button key={q.mode} disabled={q.disabled} onClick={() => start({ mode: q.mode, count: 10 })} className="card p-5 text-left hover:border-brand/50 transition-colors disabled:opacity-50">
            <div className={`w-10 h-10 rounded-xl ${q.tone} text-white grid place-items-center`}><q.icon size={20} /></div>
            <div className="font-semibold mt-3">{q.title}</div>
            <p className="text-sm text-muted mt-1">{q.text}</p>
          </button>
        ))}
      </div>
      <Card title="Build a custom quiz" subtitle={`${bank.length} questions in the bank (${state.customQuestions.length} AI-generated)`}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field label="Topic / chapter">
            <select className="input" value={topic} onChange={e => setTopic(e.target.value)}>
              <option value="all">All topics</option>
              <optgroup label="Business plan">{ALL_MODULES.filter(m => m.kind === 'playbook').map(m => <option key={m.id} value={m.id}>{m.name}{acc[m.id] ? ` · ${acc[m.id].pct.toFixed(0)}%` : ''}</option>)}</optgroup>
              <optgroup label="SEBT skills">{ALL_MODULES.filter(m => m.kind === 'skill').map(m => <option key={m.id} value={m.id}>{m.name}{acc[m.id] ? ` · ${acc[m.id].pct.toFixed(0)}%` : ''}</option>)}</optgroup>
            </select>
          </Field>
          <Field label="Difficulty"><select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="all">Mixed</option><option value="1">Easy</option><option value="2">Medium</option><option value="3">Hard</option></select></Field>
          <Field label="Questions"><select className="input" value={count} onChange={e => setCount(+e.target.value)}>{[5, 10, 15, 20, 30].map(n => <option key={n}>{n}</option>)}</select></Field>
          <Field label="Timer"><select className="input" value={timed ? '1' : '0'} onChange={e => setTimed(e.target.value === '1')}><option value="0">Untimed</option><option value="1">45 s per question</option></select></Field>
        </div>
        <div className="mt-3">
          <span className="label">Question types</span>
          <div className="flex flex-wrap gap-2">{Object.entries(QTYPES).map(([k, v]) => (
            <button key={k} onClick={() => setTypes(t => t.includes(k) ? t.filter(x => x !== k) : [...t, k])} className={`chip ${types.includes(k) ? 'chip-brand' : 'chip-muted'} cursor-pointer py-1`}>{v}</button>
          ))}</div>
        </div>
        <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
          <span className="text-sm text-muted">{available} matching questions</span>
          <button className="btn btn-primary" disabled={!available} onClick={() => start({ mode: 'topic', topic, difficulty, count, types, timed })}>Start quiz</button>
        </div>
      </Card>
    </div>
  )
}

function AIPanel({ start }) {
  const { state, update, notify } = useStore()
  const [topic, setTopic] = useState(state.profile.niche ? 'aeo' : 'pb-7')
  const [custom, setCustom] = useState('')
  const [count, setCount] = useState(8)
  const [difficulty, setDifficulty] = useState('mixed')
  const [notes, setNotes] = useState('')
  const [web, setWeb] = useState(state.settings.webResearch)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [sources, setSources] = useState([])
  const key = hasKey(state.settings)

  const go = async () => {
    setBusy(true); setErr(''); setSources([])
    try {
      const topicName = custom.trim() || moduleById[topic]?.name
      const topicId = custom.trim() ? topic : topic
      const { questions, sources } = await aiGenerateQuestions(state.settings, { topicName, topicId, count, difficulty, profile: state.profile, notes, webSearch: web })
      if (!questions.length) throw new Error('No valid questions came back — try again.')
      update(s => { s.customQuestions.push(...questions) })
      setSources(sources)
      notify(`${questions.length} new questions added to your bank`)
      start(questions, { mode: 'ai', topic: topicId, title: `AI quiz: ${topicName}` })
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card title="Generate fresh questions with Claude" subtitle="Claude writes new questions for any topic, tailored to your niche, city and level. With web research on, it checks current facts first." className="lg:col-span-2">
        {!key && <div className="mb-4"><Callout tone="warn" title="API key needed">Add your Anthropic API key in <Link to="/settings" className="underline font-semibold">Settings</Link> to generate questions. The built-in bank of {allQuestions(state).length} questions works without one.</Callout></div>}
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Topic / chapter"><select className="input" value={topic} onChange={e => setTopic(e.target.value)}>{ALL_MODULES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
          <Field label="…or any custom topic" hint="e.g. 'Google Business Profile suspensions in 2026'"><input className="input" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Optional" /></Field>
          <Field label="Number of questions"><select className="input" value={count} onChange={e => setCount(+e.target.value)}>{[5, 8, 10, 15].map(n => <option key={n}>{n}</option>)}</select></Field>
          <Field label="Difficulty"><select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard / scenario-based</option></select></Field>
        </div>
        <Field label="What should the questions focus on? (optional)"><textarea className="input mt-0 min-h-[70px]" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. pricing objections for dentists in Brisbane, n8n error handling, GST rules…" /></Field>
        <label className="flex items-center gap-2 mt-3 text-sm"><input type="checkbox" checked={web} onChange={e => setWeb(e.target.checked)} /><Globe size={15} className="text-brand" />Research the web for up-to-date facts (deep research)</label>
        {err && <div className="mt-3"><Callout tone="bad">{err}</Callout></div>}
        <button className="btn btn-accent mt-4" disabled={!key || busy} onClick={go}>{busy ? <><Loader2 size={16} className="animate-spin" />Researching & writing…</> : <><Sparkles size={16} />Generate & start</>}</button>
        {sources.length > 0 && <div className="mt-4 text-xs"><div className="font-semibold mb-1">Sources used</div><ul className="space-y-1">{sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="text-brand underline">{s.title || s.url}</a></li>)}</ul></div>}
      </Card>
      <Card title="Your AI question bank">
        {state.customQuestions.length ? (
          <>
            <div className="text-3xl font-bold font-display">{state.customQuestions.length}</div>
            <div className="text-sm text-muted">generated questions across {new Set(state.customQuestions.map(q => q.topic)).size} topics. They are mixed into every quiz mode.</div>
            <button className="btn btn-ghost btn-sm mt-4" onClick={() => { if (confirm('Delete all AI-generated questions?')) update(s => { s.customQuestions = [] }) }}>Clear AI questions</button>
          </>
        ) : <Empty icon={Sparkles} title="No AI questions yet" text="Generated questions are saved here and reused in future quizzes." />}
      </Card>
    </div>
  )
}

function Runner({ session, onExit, onRetry }) {
  const { state, update, addXP } = useStore()
  const [i, setI] = useState(0)
  const [resp, setResp] = useState({})
  const [checked, setChecked] = useState({})
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)
  const qs = session.questions
  const q = qs[i]
  if (!qs.length) return <Empty title="No questions match" text="Try different filters." action={<button className="btn btn-primary" onClick={onExit}>Back</button>} />

  const check = () => setChecked(c => ({ ...c, [q.id]: checkAnswer(q, resp[q.id]) }))
  const finish = () => {
    const items = qs.map(x => ({ qid: x.id, topic: x.topic, type: x.type, d: x.d, ok: checked[x.id] ?? checkAnswer(x, resp[x.id]) }))
    const correct = items.filter(x => x.ok).length
    const xp = items.reduce((a, x) => a + (x.ok ? 5 * x.d : 0), 0) + (correct === items.length ? 25 : 0)
    const attempt = { id: uid(), date: new Date().toISOString(), mode: session.config.mode, topic: session.config.topic || 'mixed', title: session.title, total: items.length, correct, xp, items }
    update(s => { s.quizAttempts.push(attempt) })
    addXP(xp + 5, `${session.title}: ${correct}/${items.length}`)
    setResult(attempt); setDone(true)
  }

  if (done && result) {
    const pct = result.correct / result.total * 100
    const level = pct >= 80 ? 'Advanced' : pct >= 55 ? 'Intermediate' : 'Beginner'
    const byTopic = {}
    result.items.forEach(it => { byTopic[it.topic] ??= { c: 0, t: 0 }; byTopic[it.topic].t++; if (it.ok) byTopic[it.topic].c++ })
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="card p-6 text-center hero-grad">
          <Trophy className="mx-auto text-accent" size={36} />
          <h2 className="text-2xl font-bold mt-2">{session.title} complete</h2>
          <div className="text-5xl font-bold font-display mt-3">{result.correct}/{result.total}</div>
          <div className="text-white/80 mt-1">{pct.toFixed(0)}% · +{result.xp + 5} XP</div>
          {session.config.mode === 'placement' && <div className="mt-3 inline-block chip bg-white/15 text-white text-sm">Your level: {level}</div>}
        </div>
        <Card title="By topic">
          <div className="space-y-2.5">{Object.entries(byTopic).map(([k, v]) => (
            <div key={k}><div className="flex justify-between text-sm"><Link to={`/learn/${k}`} className="font-medium hover:text-brand">{moduleById[k]?.name || k}</Link><span>{v.c}/{v.t}</span></div><Progress value={v.c / v.t * 100} tone={v.c / v.t >= 0.75 ? 'ok' : v.c / v.t >= 0.5 ? 'warn' : 'bad'} size="sm" /></div>
          ))}</div>
        </Card>
        <Card title="Review your answers">
          <ul className="space-y-3">{qs.map((x, k) => { const ok = result.items[k].ok; return (
            <li key={x.id} className={`p-3 rounded-xl border ${ok ? 'border-ok/30 bg-ok/5' : 'border-bad/30 bg-bad/5'}`}>
              <div className="flex gap-2 text-sm font-medium">{ok ? <CheckCircle2 size={17} className="text-ok shrink-0" /> : <XCircle size={17} className="text-bad shrink-0" />}{x.q}</div>
              {!ok && <div className="text-sm mt-1.5 ml-6"><span className="text-muted">Correct answer:</span> <b>{correctText(x)}</b></div>}
              {x.why && <div className="text-xs text-muted mt-1 ml-6">{x.why}</div>}
            </li>
          ) })}</ul>
        </Card>
        <div className="flex gap-2 justify-center flex-wrap">
          <button className="btn btn-ghost" onClick={onExit}>Back to quizzes</button>
          <button className="btn btn-primary" onClick={() => onRetry(session)}><RotateCcw size={15} />New set</button>
          {result.items.some(x => !x.ok) && <Link className="btn btn-accent" to={`/learn/${result.items.find(x => !x.ok).topic}`}>Study weakest topic</Link>}
        </div>
      </div>
    )
  }

  const isChecked = q.id in checked
  const answered = resp[q.id] !== undefined && resp[q.id] !== '' && !(Array.isArray(resp[q.id]) && !resp[q.id].length)
  const set = (v) => !isChecked && setResp(r => ({ ...r, [q.id]: v }))

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3 gap-3">
        <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Leave this quiz? Progress will not be saved.')) onExit() }}>Exit</button>
        <div className="text-sm font-semibold">{session.title}</div>
        <div className="text-sm text-muted tabular-nums">{i + 1}/{qs.length}</div>
      </div>
      <Progress value={(i + (isChecked ? 1 : 0)) / qs.length * 100} />
      {session.timed && !isChecked && <Timer key={q.id} seconds={45} onEnd={check} />}
      <div className="card p-5 sm:p-6 mt-4 fade-in" key={q.id}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge tone="brand">{QTYPES[q.type]}</Badge><Badge>{moduleById[q.topic]?.name || q.topic}</Badge><Badge tone={q.d === 3 ? 'bad' : q.d === 2 ? 'warn' : 'ok'}>{['', 'Easy', 'Medium', 'Hard'][q.d]}</Badge>{q.ai && <Badge tone="accent">AI</Badge>}
        </div>
        {q.type === 'dropdown' ? (
          <div className="text-lg font-medium leading-relaxed">
            {q.q.split('___').map((part, k, arr) => (
              <span key={k}>{part}{k < arr.length - 1 && (
                <select className={`input inline-block w-auto mx-1 my-1 py-1 text-base ${isChecked ? (checked[q.id] ? 'border-ok' : 'border-bad') : ''}`} value={resp[q.id] ?? ''} onChange={e => set(e.target.value === '' ? '' : +e.target.value)} disabled={isChecked} aria-label="Fill in the blank">
                  <option value="">Choose…</option>{q.options.map((o, j) => <option key={j} value={j}>{o}</option>)}
                </select>
              )}</span>
            ))}
          </div>
        ) : <div className="text-lg font-medium leading-snug">{q.q}</div>}

        <div className="mt-4 space-y-2">
          {(q.type === 'mcq' || q.type === 'tf') && (
            <div className={q.type === 'tf' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
              {q.options.map((o, j) => {
                const sel = resp[q.id] === j, right = isChecked && j === q.answer, wrong = isChecked && sel && j !== q.answer
                return <button key={j} onClick={() => set(j)} className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-colors ${right ? 'border-ok bg-ok/10' : wrong ? 'border-bad bg-bad/10' : sel ? 'border-brand bg-brand/5' : 'border-line hover:border-brand/40'}`}>{q.type === 'mcq' && <span className="text-faint mr-2">{String.fromCharCode(65 + j)}.</span>}{o}</button>
              })}
            </div>
          )}
          {q.type === 'multi' && q.options.map((o, j) => {
            const cur = resp[q.id] || [], sel = cur.includes(j)
            const right = isChecked && q.answers.includes(j), wrong = isChecked && sel && !q.answers.includes(j)
            return <label key={j} className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm font-medium cursor-pointer ${right ? 'border-ok bg-ok/10' : wrong ? 'border-bad bg-bad/10' : sel ? 'border-brand bg-brand/5' : 'border-line'}`}>
              <input type="checkbox" checked={sel} disabled={isChecked} onChange={() => set(sel ? cur.filter(x => x !== j) : [...cur, j])} />{o}
            </label>
          })}
          {q.type === 'numeric' && (
            <div className="flex items-center gap-2"><input className="input text-lg tabular-nums" inputMode="decimal" placeholder="Your answer" value={resp[q.id] ?? ''} onChange={e => set(e.target.value)} disabled={isChecked} onKeyDown={e => e.key === 'Enter' && answered && !isChecked && check()} />{q.unit && <span className="text-muted">{q.unit}</span>}</div>
          )}
        </div>

        {isChecked && (
          <div className={`mt-4 p-3 rounded-xl text-sm fade-in ${checked[q.id] ? 'bg-ok/10 border border-ok/30' : 'bg-bad/10 border border-bad/30'}`}>
            <div className="font-semibold flex items-center gap-1.5">{checked[q.id] ? <><CheckCircle2 size={16} className="text-ok" />Correct!</> : <><XCircle size={16} className="text-bad" />Not quite — answer: {correctText(q)}</>}</div>
            {q.why && <div className="mt-1 text-ink/85">{q.why}</div>}
          </div>
        )}
        <div className="flex justify-between mt-5 gap-2">
          <button className="btn btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
          {!isChecked ? <button className="btn btn-primary" disabled={!answered} onClick={check}>Check answer</button>
            : i < qs.length - 1 ? <button className="btn btn-primary" onClick={() => setI(i + 1)}>Next question</button>
              : <button className="btn btn-accent" onClick={finish}>Finish & see results</button>}
        </div>
      </div>
    </div>
  )
}

function Timer({ seconds, onEnd }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    const t = setInterval(() => setLeft(l => { if (l <= 1) { clearInterval(t); setTimeout(onEnd, 0); return 0 } return l - 1 }), 1000)
    return () => clearInterval(t)
  }, []) // eslint-disable-line
  return <div className="mt-2 flex items-center gap-2 text-xs text-muted"><Progress value={left / seconds * 100} size="sm" tone={left < 10 ? 'bad' : 'accent'} /><span className="tabular-nums w-8">{left}s</span></div>
}

function HistoryPanel() {
  const { state } = useStore()
  const at = state.quizAttempts
  const qs = quizStats(state)
  const acc = topicAccuracy(state)
  if (!at.length) return <Empty icon={History} title="No quiz attempts yet" text="Take the placement test to see your results and progress charts here." action={<Link to="/quiz?mode=placement" className="btn btn-primary" reloadDocument={false}>Start placement test</Link>} />
  const byType = {}
  at.flatMap(a => a.items).forEach(it => { byType[it.type] ??= { c: 0, t: 0 }; byType[it.type].t++; if (it.ok) byType[it.type].c++ })
  const byDiff = [1, 2, 3].map(d => { const its = at.flatMap(a => a.items).filter(i => i.d === d); return its.length ? its.filter(i => i.ok).length / its.length * 100 : 0 })
  const topics = Object.entries(acc).sort((a, b) => a[1].pct - b[1].pct)
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Attempts" value={qs.attempts} /><Stat label="Answered" value={qs.answered} /><Stat label="Recent accuracy" value={`${qs.pct.toFixed(0)}%`} tone={qs.pct >= 75 ? 'ok' : 'warn'} /><Stat label="Topics tested" value={Object.keys(acc).length} />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Score per attempt"><LineChart pct labels={at.map((a, i) => `#${i + 1}`)} datasets={[{ label: 'Score %', data: at.map(a => Math.round(a.correct / a.total * 100)) }]} /></Card>
        <Card title="Accuracy by question type & difficulty">
          <BarChart pct labels={[...Object.keys(byType).map(k => QTYPES[k]), 'Easy', 'Medium', 'Hard']} datasets={[{ label: 'Accuracy %', data: [...Object.values(byType).map(v => Math.round(v.c / v.t * 100)), ...byDiff.map(Math.round)] }]} legend={false} />
        </Card>
      </div>
      <Card title="Topic mastery" subtitle="Lowest first — these are where you are lagging">
        <div className="scroll-x"><table className="table"><thead><tr><th>Topic</th><th className="num">Answers</th><th className="num">Accuracy</th><th>Status</th><th /></tr></thead><tbody>
          {topics.map(([k, v]) => <tr key={k}><td className="font-medium">{moduleById[k]?.name || k}</td><td className="num">{v.n}</td><td className="num">{v.pct.toFixed(0)}%</td><td><Badge tone={v.pct >= 75 ? 'ok' : v.pct >= 55 ? 'warn' : 'bad'}>{v.pct >= 75 ? 'Strong' : v.pct >= 55 ? 'Developing' : 'Lagging'}</Badge></td><td><Link className="text-brand text-xs font-semibold" to={`/learn/${k}`}>Study</Link></td></tr>)}
        </tbody></table></div>
      </Card>
      <Card title="Attempt log"><div className="scroll-x"><table className="table"><thead><tr><th>Date</th><th>Quiz</th><th className="num">Score</th><th className="num">XP</th></tr></thead><tbody>
        {[...at].reverse().map(a => <tr key={a.id}><td>{new Date(a.date).toLocaleDateString()}</td><td>{a.title}</td><td className="num">{a.correct}/{a.total}</td><td className="num">{a.xp}</td></tr>)}
      </tbody></table></div></Card>
    </div>
  )
}
