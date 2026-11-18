import { CheckCircle2, XCircle, AlertTriangle, Sparkles, Lightbulb, Wand2, Copy } from 'lucide-react'
import { Card, Ring, Badge, Callout, Collapse } from './ui'

const scoreColor = (s) => (s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--warning)' : 'var(--danger)')

export function RubricFeedback({ grade, alignment }) {
  return (
    <div className="space-y-4">
      <div className="card p-5 flex flex-col sm:flex-row items-center gap-5">
        <Ring value={grade.score} label={grade.score} sub="/100" color={scoreColor(grade.score)} />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start"><span className="text-xl font-bold">Grade {grade.grade}</span><Badge>{grade.engine}</Badge></div>
          <p className="text-sm text-muted mt-1">{grade.summary}</p>
          {alignment && <p className="text-sm mt-2">Plan alignment: <b>{alignment.pct}%</b></p>}
        </div>
      </div>

      {grade.mistakes.length > 0 && (
        <Card title={`Mistakes & gaps (${grade.mistakes.length})`} subtitle="Ordered by points lost">
          <ul className="space-y-3">
            {grade.mistakes.map((m, i) => (
              <li key={i} className="flex gap-3">
                {m.partial ? <AlertTriangle size={18} className="text-warn shrink-0 mt-0.5" /> : <XCircle size={18} className="text-bad shrink-0 mt-0.5" />}
                <div className="min-w-0 text-sm">
                  <div className="font-semibold">{m.label} <span className="text-muted font-normal">· {m.earned}/{m.weight} pts</span></div>
                  <div className="text-xs text-muted">{m.evidence}</div>
                  <div className="mt-1 flex gap-1.5"><Lightbulb size={14} className="text-accent shrink-0 mt-0.5" /><span><b>Fix:</b> {m.fix}</span></div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {grade.strengths.length > 0 && (
        <Card title="What you did well">
          <ul className="grid sm:grid-cols-2 gap-2">{grade.strengths.map((s, i) => <li key={i} className="flex gap-2 text-sm"><CheckCircle2 size={16} className="text-ok shrink-0 mt-0.5" />{s}</li>)}</ul>
        </Card>
      )}
      {grade.writing.length > 0 && (
        <Card title="Writing & presentation suggestions">
          <ul className="space-y-1.5 text-sm">{grade.writing.map((w, i) => <li key={i} className="flex gap-2"><Wand2 size={15} className="text-brand shrink-0 mt-0.5" />{w}</li>)}</ul>
        </Card>
      )}
      {alignment?.flags?.length > 0 && <Callout tone="bad" title="Red flags against the plan">{alignment.flags.map(f => <div key={f.term}>• {f.msg}</div>)}</Callout>}
      <Collapse title="Full rubric breakdown">
        <div className="scroll-x"><table className="table"><thead><tr><th>Criterion</th><th className="num">Points</th><th>Evidence</th></tr></thead><tbody>
          {grade.results.map((r, i) => <tr key={i}><td className="font-medium">{r.passed ? '✅' : r.partial ? '🟡' : '❌'} {r.label}</td><td className="num">{r.earned}/{r.weight}</td><td className="text-muted text-xs">{r.evidence}</td></tr>)}
        </tbody></table></div>
      </Collapse>
    </div>
  )
}

export function AIFeedback({ ai }) {
  if (!ai) return null
  return (
    <Card title={<span className="flex items-center gap-2"><Sparkles size={17} className="text-accent" />Claude's review</span>} subtitle={ai.summary}>
      <div className="flex items-center gap-3 mb-4"><Ring value={ai.score || 0} size={76} stroke={7} label={ai.score ?? '—'} color={scoreColor(ai.score || 0)} /><p className="text-sm text-muted flex-1">{ai.planAlignment}</p></div>
      {ai.strengths?.length > 0 && <><h4 className="font-semibold text-sm mb-1">Strengths</h4><ul className="text-sm space-y-1 mb-4">{ai.strengths.map((s, i) => <li key={i} className="flex gap-2"><CheckCircle2 size={15} className="text-ok shrink-0 mt-0.5" />{s}</li>)}</ul></>}
      {ai.mistakes?.length > 0 && <><h4 className="font-semibold text-sm mb-1">Mistakes</h4><ul className="space-y-2 mb-4">{ai.mistakes.map((m, i) => (
        <li key={i} className="text-sm p-3 rounded-xl bg-bad/5 border border-bad/20"><div className="font-semibold">{typeof m === 'string' ? m : m.issue}</div>{m.why && <div className="text-muted text-xs mt-0.5">Why it matters: {m.why}</div>}{m.fix && <div className="mt-1"><b>Fix:</b> {m.fix}</div>}</li>
      ))}</ul></>}
      {ai.suggestions?.length > 0 && <><h4 className="font-semibold text-sm mb-1">Suggestions to be more competitive</h4><ul className="text-sm space-y-1 mb-4">{ai.suggestions.map((s, i) => <li key={i} className="flex gap-2"><Lightbulb size={15} className="text-accent shrink-0 mt-0.5" />{s}</li>)}</ul></>}
      {ai.improvedVersion && <Collapse title="Improved version (solution)" right={<button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(ai.improvedVersion) }}><Copy size={13} /></button>}><pre className="whitespace-pre-wrap text-sm font-sans">{ai.improvedVersion}</pre></Collapse>}
    </Card>
  )
}
