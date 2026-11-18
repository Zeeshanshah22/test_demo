import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSearch, Upload, Loader2, Sparkles, CheckCircle2, AlertTriangle, XCircle, Trash2, Lightbulb } from 'lucide-react'
import { useStore, uid } from '../store'
import { PageHeader, Card, Ring, Badge, Callout, Empty, Field, Collapse } from '../components/ui'
import { BarChart } from '../components/charts'
import { AIFeedback, RubricFeedback } from '../components/Feedback'
import { extractFile, analyzeExtracted } from '../lib/fileAnalyzer'
import { aiReview, hasKey } from '../lib/ai'
import { ASSIGNMENTS, assignmentById } from '../data/assignments'
import { gradeAssignment, planAlignment } from '../lib/grader'

const KIND_LABEL = { html: 'Web page', spreadsheet: 'Spreadsheet', document: 'Document', json: 'JSON', image: 'Image', text: 'Text' }
const icon = { good: <CheckCircle2 size={17} className="text-ok shrink-0 mt-0.5" />, warn: <AlertTriangle size={17} className="text-warn shrink-0 mt-0.5" />, bad: <XCircle size={17} className="text-bad shrink-0 mt-0.5" /> }

export default function Analyzer() {
  const { state, update, addXP, notify } = useStore()
  const [busy, setBusy] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [err, setErr] = useState('')
  const [rubric, setRubric] = useState('auto')
  const [goal, setGoal] = useState('')
  const [current, setCurrent] = useState(state.analyses[state.analyses.length - 1]?.id || null)
  const [extracted, setExtracted] = useState(null)
  const a = state.analyses.find(x => x.id === current)
  const key = hasKey(state.settings)

  const run = async (file) => {
    if (!file) return
    setErr(''); setBusy(true)
    try {
      const ex = await extractFile(file)
      setExtracted(ex)
      const res = analyzeExtracted(ex)
      let rub = null
      if (rubric !== 'auto' && ex.text) rub = { id: rubric, grade: gradeAssignment(assignmentById[rubric], ex.text, state.profile), alignment: planAlignment(ex.text) }
      const rec = { id: uid(), date: new Date().toISOString(), name: ex.name, size: ex.size, kind: ex.kind, pages: ex.pages, ...res, rubric: rub, excerpt: (ex.text || '').slice(0, 3000), preview: ex.sheets ? ex.sheets[0].rows.slice(0, 15) : null, image: ex.kind === 'image' ? ex.image.url.slice(0, 600000) : null, ai: null }
      update(s => { s.analyses.push(rec); if (s.analyses.length > 40) s.analyses.shift() })
      setCurrent(rec.id)
      addXP(15, 'File analysed')
      if (ex.truncated) setErr('This file is very large. Built-in analysis read all of it; the Claude review will only see the first 400,000 characters.')
      if (key) await runAI(rec, ex)
    } catch (e) { setErr(`Could not analyse this file: ${e.message}`) } finally { setBusy(false) }
  }

  const runAI = async (rec, ex = extracted) => {
    if (!ex) { setErr('Re-upload the file to run the Claude review.'); return }
    setAiBusy(true)
    try {
      const text = ex.kind === 'spreadsheet' ? ex.text.slice(0, 400000) : (rec.kind === 'html' ? ex.text.slice(0, 400000) : ex.text.slice(0, 400000))
      const brief = `File type: ${KIND_LABEL[ex.kind]} named "${ex.name}". ${goal ? 'The learner wants: ' + goal + '.' : 'Give analysis, feedback, mistakes and solutions relevant to the Digital Empire plan.'} ${ex.kind === 'html' ? 'Audit it for local SEO, AEO and conversion.' : ex.kind === 'spreadsheet' ? 'Compare the numbers with the Digital Empire financial model and flag risks.' : ''}`
      const ai = await aiReview(state.settings, { title: rec.name, brief, text, image: ex.kind === 'image' ? ex.image : null })
      update(s => { const x = s.analyses.find(y => y.id === rec.id); if (x) x.ai = ai })
      notify('Claude analysis ready')
    } catch (e) { setErr(e.message) } finally { setAiBusy(false) }
  }

  return (
    <div>
      <PageHeader icon={FileSearch} title="File Analyzer" subtitle="Upload anything — proposals, offer sheets, website HTML, financial spreadsheets, JSON-LD schema, ad creatives — for analysis, mistakes, suggestions and solutions aligned with the Digital Empire plan." />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <Card title="Analyse a file">
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-xl p-6 text-center cursor-pointer hover:border-brand/50 hover:bg-surface-2"
              onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); run(e.dataTransfer.files?.[0]) }}>
              {busy ? <Loader2 className="animate-spin text-brand" size={28} /> : <Upload className="text-brand" size={28} />}
              <span className="font-medium text-sm">Drop a file or click to choose</span>
              <span className="text-xs text-muted">PDF · DOCX · TXT · MD · CSV · XLSX · HTML · JSON · images</span>
              <input type="file" className="hidden" onChange={e => { run(e.target.files?.[0]); e.target.value = '' }} />
            </label>
            <div className="space-y-3 mt-4">
              <Field label="Also grade against an assignment rubric"><select className="input" value={rubric} onChange={e => setRubric(e.target.value)}><option value="auto">No — auto-detect best match</option>{ASSIGNMENTS.map(x => <option key={x.id} value={x.id}>{x.title}</option>)}</select></Field>
              <Field label="What do you want feedback on? (for Claude)"><input className="input" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Will this proposal win a dentist client?" /></Field>
            </div>
            {!key && <div className="mt-3"><Callout tone="info">Built-in analysis runs now. Add a Claude key in <Link to="/settings" className="underline">Settings</Link> for deeper feedback and image analysis.</Callout></div>}
            {err && <div className="mt-3"><Callout tone="warn">{err}</Callout></div>}
          </Card>
          <Card title="History" subtitle={`${state.analyses.length} files analysed`}>
            {state.analyses.length ? (
              <>
                <BarChart labels={state.analyses.slice(-10).map(x => x.name.slice(0, 12))} datasets={[{ label: 'Score', data: state.analyses.slice(-10).map(x => x.score ?? 0) }]} height={150} legend={false} />
                <ul className="mt-3 space-y-1.5 max-h-72 overflow-y-auto">{[...state.analyses].reverse().map(x => (
                  <li key={x.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${current === x.id ? 'bg-brand/10' : 'hover:bg-surface-2'}`} onClick={() => setCurrent(x.id)}>
                    <span className="flex-1 min-w-0"><span className="block text-sm font-medium truncate">{x.name}</span><span className="text-xs text-muted">{KIND_LABEL[x.kind]} · {new Date(x.date).toLocaleDateString()}</span></span>
                    {x.score !== null && <Badge tone={x.score >= 75 ? 'ok' : x.score >= 50 ? 'warn' : 'bad'}>{x.score}</Badge>}
                    <button aria-label="Delete" className="text-faint hover:text-bad" onClick={(e) => { e.stopPropagation(); update(s => { s.analyses = s.analyses.filter(y => y.id !== x.id) }) }}><Trash2 size={14} /></button>
                  </li>
                ))}</ul>
              </>
            ) : <p className="text-sm text-muted">No files yet.</p>}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {!a ? <div className="card"><Empty icon={FileSearch} title="Upload a file to get feedback" text="Try your agency website's HTML, your Y1 budget spreadsheet, a proposal or an offer sheet." /></div> : (
            <>
              <div className="card p-5 flex flex-col sm:flex-row gap-5 items-center">
                {a.score !== null ? <Ring value={a.score} label={a.score} sub="/100" color={a.score >= 75 ? 'var(--success)' : a.score >= 50 ? 'var(--warning)' : 'var(--danger)'} /> : <div className="w-[120px] h-[120px] rounded-full bg-surface-2 grid place-items-center text-xs text-muted">No score</div>}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start"><Badge tone="brand">{KIND_LABEL[a.kind]}</Badge>{a.pages && <Badge>{a.pages} pages</Badge>}<Badge>{(a.size / 1024).toFixed(0)} KB</Badge></div>
                  <h2 className="text-lg font-bold mt-1 truncate">{a.name}</h2>
                  <div className="text-sm text-muted">{a.title} — {a.summary}</div>
                  {key && !a.ai && <button className="btn btn-accent btn-sm mt-3" disabled={aiBusy} onClick={() => runAI(a)}>{aiBusy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}Get Claude analysis</button>}
                </div>
              </div>
              {a.image && <img src={a.image} alt={a.name} className="max-h-72 rounded-xl border border-line" />}
              <Card title="Findings" subtitle="Green = good, amber = improve, red = fix now">
                <ul className="space-y-3">{a.findings.map((x, i) => (
                  <li key={i} className="flex gap-3">{icon[x.score]}<div className="min-w-0 text-sm"><div className="font-semibold">{x.title}</div>{x.detail && <div className="text-muted text-xs break-words">{x.detail}</div>}{x.fix && <div className="mt-1 flex gap-1.5"><Lightbulb size={14} className="text-accent shrink-0 mt-0.5" /><span>{x.fix}</span></div>}</div></li>
                ))}</ul>
              </Card>
              {aiBusy && <Callout tone="info"><span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" />Claude is analysing…</span></Callout>}
              {a.ai && <AIFeedback ai={a.ai} />}
              {a.rubric && <div><h3 className="font-semibold mb-2">Rubric: {assignmentById[a.rubric.id]?.title}</h3><RubricFeedback grade={a.rubric.grade} alignment={a.rubric.alignment} /></div>}
              {a.preview && (
                <Collapse title="Spreadsheet preview (first sheet)"><div className="scroll-x"><table className="table text-xs"><tbody>{a.preview.map((r, i) => <tr key={i}>{r.slice(0, 14).map((c, j) => <td key={j} className={typeof c === 'number' ? 'num' : ''}>{typeof c === 'number' ? c.toLocaleString() : String(c)}</td>)}</tr>)}</tbody></table></div></Collapse>
              )}
              {a.excerpt && <Collapse title="Extracted text"><pre className="whitespace-pre-wrap text-xs font-mono max-h-80 overflow-y-auto">{a.excerpt}{a.excerpt.length >= 3000 ? '\n…' : ''}</pre></Collapse>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
