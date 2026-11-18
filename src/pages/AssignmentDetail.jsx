import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, Sparkles, Loader2, FileText, Eye, Send } from 'lucide-react'
import { useStore, uid } from '../store'
import { Card, Badge, Callout, Empty, Collapse } from '../components/ui'
import { LineChart } from '../components/charts'
import { RubricFeedback, AIFeedback } from '../components/Feedback'
import { assignmentById } from '../data/assignments'
import { moduleById } from '../data/curriculum'
import { gradeAssignment, planAlignment } from '../lib/grader'
import { extractFile } from '../lib/fileAnalyzer'
import { aiReview, hasKey } from '../lib/ai'
import { dayNumber } from '../lib/scoring'

export default function AssignmentDetail() {
  const { id } = useParams()
  const a = assignmentById[id]
  const { state, update, addXP, notify } = useStore()
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [image, setImage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [err, setErr] = useState('')
  const [useAI, setUseAI] = useState(hasKey(state.settings))
  const subs = state.submissions.filter(s => s.assignmentId === id)
  const [view, setView] = useState(subs.length ? subs[subs.length - 1].id : null)
  const current = state.submissions.find(s => s.id === view)
  if (!a) return <Empty title="Assignment not found" action={<Link to="/assignments" className="btn btn-primary">Back</Link>} />

  const onFile = async (f) => {
    if (!f) return
    setErr(''); setBusy(true)
    try {
      const ex = await extractFile(f)
      setFile(ex)
      if (ex.kind === 'image') { setImage(ex.image); if (!hasKey(state.settings)) setErr('Images need a Claude API key for review. Paste text instead, or add a key in Settings.') }
      else setText(ex.text)
    } catch (e) { setErr(`Could not read file: ${e.message}`) } finally { setBusy(false) }
  }

  const submit = async () => {
    setErr('')
    const grade = text.trim() ? gradeAssignment(a, text, state.profile) : null
    const alignment = text.trim() ? planAlignment(text) : null
    const sub = { id: uid(), assignmentId: a.id, date: new Date().toISOString(), fileName: file?.name || null, text: text.slice(0, 20000), grade, alignment, score: grade?.score ?? 0, ai: null }
    const prevBest = Math.max(0, ...subs.map(s => s.score))
    update(s => { s.submissions.push(sub) })
    setView(sub.id)
    if (grade) addXP(Math.round(grade.score * 0.8) + (grade.score > prevBest && subs.length ? 20 : 0), `Assignment graded: ${grade.score}/100`)
    if (useAI && hasKey(state.settings)) {
      setAiBusy(true)
      try {
        const rubric = a.criteria.map(c => `${c.label} (${c.weight})`).join('; ')
        const ai = await aiReview(state.settings, { title: a.title, brief: `${a.brief} Deliverable: ${a.deliverable}`, text, rubric, image })
        update(s => { const x = s.submissions.find(y => y.id === sub.id); x.ai = ai; if (!grade) x.score = ai.score || 0 })
        notify('Claude review ready')
      } catch (e) { setErr(e.message) } finally { setAiBusy(false) }
    }
  }

  const day = dayNumber(state.profile.startDate)
  return (
    <div className="max-w-6xl">
      <Link to="/assignments" className="text-sm text-muted hover:text-brand inline-flex items-center gap-1 mb-3"><ArrowLeft size={15} />Assignments</Link>
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <div className="flex flex-wrap gap-1.5"><Link to={`/learn/${a.module}`}><Badge tone="brand">{moduleById[a.module]?.name}</Badge></Link><Badge tone={day > a.due && !subs.length ? 'bad' : 'muted'}>Target day {a.due}</Badge><Badge>{a.points} pts</Badge></div>
            <h1 className="text-xl font-bold mt-2">{a.title}</h1>
            <p className="text-sm mt-2">{a.brief}</p>
            <div className="mt-3 text-sm"><span className="label">Deliverable</span>{a.deliverable}</div>
          </div>
          <Card title="Rubric" subtitle="What the checker looks for">
            <ul className="space-y-2">{a.criteria.map((c, i) => <li key={i} className="flex justify-between gap-3 text-sm"><span>{c.label}</span><span className="text-muted tabular-nums shrink-0">{c.weight} pts</span></li>)}</ul>
          </Card>
          <Collapse title={<span className="flex items-center gap-1.5"><Eye size={15} />Model answer (try first!)</span>}><pre className="whitespace-pre-wrap text-sm font-sans text-ink/90">{a.solution}</pre></Collapse>
          {subs.length > 1 && <Card title="Your score trend"><LineChart labels={subs.map((_, i) => `#${i + 1}`)} datasets={[{ label: 'Score', data: subs.map(s => s.score) }]} height={180} /></Card>}
        </div>

        <div className="lg:col-span-3 space-y-5">
          <Card title="Submit your work" subtitle="Paste text, or upload PDF, DOCX, TXT, MD, CSV, XLSX, HTML, JSON or an image">
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-xl p-5 text-center cursor-pointer hover:border-brand/50 hover:bg-surface-2 transition-colors">
              {busy ? <Loader2 className="animate-spin text-brand" /> : <Upload className="text-brand" />}
              <span className="text-sm font-medium">{file ? file.name : 'Drop or choose a file'}</span>
              <span className="text-xs text-muted">Text is extracted in your browser — files are not uploaded to any server</span>
              <input type="file" className="hidden" accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.xls,.html,.htm,.json,image/*" onChange={e => onFile(e.target.files?.[0])} />
            </label>
            {image && <img src={image.url} alt="Uploaded" className="mt-3 max-h-60 rounded-xl border border-line mx-auto" />}
            <textarea className="input mt-3 min-h-[220px] font-mono text-[13px]" placeholder="…or paste your work here" value={text} onChange={e => setText(e.target.value)} />
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
              <label className={`flex items-center gap-2 text-sm ${!hasKey(state.settings) ? 'opacity-60' : ''}`}><input type="checkbox" checked={useAI} disabled={!hasKey(state.settings)} onChange={e => setUseAI(e.target.checked)} /><Sparkles size={15} className="text-accent" />Also get Claude review {!hasKey(state.settings) && <Link to="/settings" className="text-brand underline text-xs">add key</Link>}</label>
              <button className="btn btn-primary" disabled={(!text.trim() && !image) || aiBusy} onClick={submit}><Send size={15} />Check my work</button>
            </div>
            {err && <div className="mt-3"><Callout tone="warn">{err}</Callout></div>}
          </Card>

          {subs.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="text-muted">Attempts:</span>
              {subs.map((s, i) => <button key={s.id} onClick={() => setView(s.id)} className={`chip py-1 cursor-pointer ${view === s.id ? 'chip-brand' : 'chip-muted'}`}>#{i + 1} · {s.score}</button>)}
            </div>
          )}
          {aiBusy && <Callout tone="info"><span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" />Claude is reviewing your work…</span></Callout>}
          {current?.grade && <RubricFeedback grade={current.grade} alignment={current.alignment} />}
          {current?.ai && <AIFeedback ai={current.ai} />}
          {current && <Collapse title={<span className="flex items-center gap-1.5"><FileText size={15} />Submitted text {current.fileName ? `(${current.fileName})` : ''}</span>}><pre className="whitespace-pre-wrap text-xs font-mono max-h-80 overflow-y-auto">{current.text || '(image only)'}</pre></Collapse>}
        </div>
      </div>
    </div>
  )
}
