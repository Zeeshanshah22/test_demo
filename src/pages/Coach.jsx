import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bot, Send, Loader2, Globe, Trash2, BookOpen, User } from 'lucide-react'
import { useStore } from '../store'
import { PageHeader, Callout, Badge } from '../components/ui'
import { aiCoach, hasKey } from '../lib/ai'
import { ALL_LESSONS } from '../data/curriculum'
import { areaScores, empireScore, actualTotals, milestoneStats, dayNumber } from '../lib/scoring'

const STARTERS = [
  'What should I focus on this week to stay on plan?',
  'Write a cold email for plumbers in my city using the plan structure.',
  'How do I handle the objection "Is your team overseas?"',
  'When can I afford to hire the SEO/AEO Specialist?',
  'Explain AEO vs classic SEO in simple terms.',
  'What are the latest Google Business Profile best practices?',
]

// Offline answer: search lessons for the best matching points
function offlineAnswer(q) {
  const words = q.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  const scored = ALL_LESSONS.map(l => {
    const hay = (l.title + ' ' + l.points.join(' ') + ' ' + l.moduleName).toLowerCase()
    return { l, s: words.reduce((a, w) => a + (hay.includes(w) ? 1 : 0), 0) }
  }).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3)
  if (!scored.length) return { text: "I couldn't find that in the course yet. Try different keywords, or add a Claude API key in Settings for a full answer.", refs: [] }
  return { text: scored.map(({ l }) => `**${l.moduleName} — ${l.title}**\n${l.points.map(p => '• ' + p).join('\n')}\n_Action:_ ${l.action}`).join('\n\n'), refs: scored.map(x => x.l) }
}

function Md({ text }) {
  // tiny markdown: bold, italics, bullets, headings, line breaks
  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/^### (.*)$/gm, '<h4>$1</h4>').replace(/^## (.*)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|\W)_(.+?)_(\W|$)/g, '$1<i>$2</i>$3').replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\s*[-*•] (.*)$/gm, '<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, '<br/><br/>').replace(/\n/g, '<br/>')
  return <div className="prose-sm text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
}

export default function Coach() {
  const { state, update, addXP } = useStore()
  const [params] = useSearchParams()
  const [input, setInput] = useState(params.get('q') || '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [web, setWeb] = useState(false)
  const end = useRef()
  const key = hasKey(state.settings)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [state.coach.length, busy])

  const send = async (text = input) => {
    const q = text.trim(); if (!q || busy) return
    setInput(''); setErr('')
    update(s => { s.coach.push({ role: 'user', text: q, date: new Date().toISOString() }) })
    if (!key) {
      const a = offlineAnswer(q)
      update(s => { s.coach.push({ role: 'assistant', text: a.text, offline: true }) })
      return
    }
    setBusy(true)
    try {
      const t = actualTotals(state), ms = milestoneStats(state)
      const snapshot = `Day ${dayNumber(state.profile.startDate)}; empire score ${empireScore(state)}/1000; areas ${areaScores(state).map(a => `${a.name} ${Math.round(a.value)}`).join(', ')}; revenue logged A$${Math.round(t.revenue)} over ${t.months.length} months; latest retainers ${t.latestVol.retainers || 0}; milestones ${ms.done}/${ms.total}, ${ms.overdue} overdue.`
      const res = await aiCoach(state.settings, { question: q, history: state.coach, profile: state.profile, snapshot, webSearch: web })
      update(s => { s.coach.push({ role: 'assistant', text: res.text + (res.truncated ? '\n\n_(answer cut short)_' : ''), sources: res.sources }) })
      if (state.coach.filter(m => m.role === 'user').length % 5 === 0) addXP(10, 'Coaching session')
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-9rem)]">
      <PageHeader icon={Bot} title="AI Coach" subtitle="Ask anything about the course, the business plan, the financial model or your progress." actions={state.coach.length > 0 && <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm('Clear the conversation?')) update(s => { s.coach = [] }) }}><Trash2 size={14} />Clear</button>} />
      {!key && <div className="mb-4"><Callout tone="info" title="Offline mode">Answers come from the built-in course content. Add a Claude API key in <Link to="/settings" className="underline">Settings</Link> for full answers, personalised advice and web research.</Callout></div>}
      <div className="flex-1 space-y-4 mb-4">
        {!state.coach.length && (
          <div className="grid sm:grid-cols-2 gap-2">{STARTERS.map(s => <button key={s} className="card p-3 text-left text-sm hover:border-brand/40" onClick={() => send(s)}>{s}</button>)}</div>
        )}
        {state.coach.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${m.role === 'user' ? 'bg-brand text-white' : 'bg-accent text-white'}`}>{m.role === 'user' ? <User size={15} /> : <Bot size={15} />}</div>
            <div className={`card px-4 py-3 max-w-[85%] ${m.role === 'user' ? 'bg-brand/5' : ''}`}>
              {m.offline && <Badge className="mb-2"><BookOpen size={11} />From the course</Badge>}
              <Md text={m.text} />
              {m.sources?.length > 0 && <div className="mt-2 pt-2 border-t border-line text-xs"><b>Sources:</b> {m.sources.map((s, k) => <a key={k} href={s.url} target="_blank" rel="noreferrer" className="text-brand underline mr-2">{s.title || new URL(s.url).hostname}</a>)}</div>}
            </div>
          </div>
        ))}
        {busy && <div className="flex gap-3"><div className="w-8 h-8 rounded-full grid place-items-center bg-accent text-white"><Bot size={15} /></div><div className="card px-4 py-3 text-sm text-muted flex items-center gap-2"><Loader2 size={14} className="animate-spin" />{web ? 'Researching…' : 'Thinking…'}</div></div>}
        {err && <Callout tone="bad">{err}</Callout>}
        <div ref={end} />
      </div>
      <div className="sticky bottom-20 lg:bottom-4 card p-2">
        <div className="flex gap-2 items-end">
          <textarea rows={1} className="input resize-none min-h-[44px] max-h-40" placeholder="Ask your coach…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
          <button className="btn btn-primary h-[44px]" onClick={() => send()} disabled={!input.trim() || busy} aria-label="Send"><Send size={16} /></button>
        </div>
        {key && <label className="flex items-center gap-2 text-xs text-muted mt-1.5 px-1"><input type="checkbox" checked={web} onChange={e => setWeb(e.target.checked)} /><Globe size={13} />Search the web for current information</label>}
      </div>
    </div>
  )
}
