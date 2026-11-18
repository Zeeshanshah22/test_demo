import { useState } from 'react'
import { Settings as Cog, KeyRound, Palette, Database, User, Download, Upload, RotateCcw, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { useStore, DEFAULT_BRAND } from '../store'
import { PageHeader, Card, Field, Callout } from '../components/ui'

export default function Settings() {
  const { state, update, reset, replace, notify } = useStore()
  const [show, setShow] = useState(false)
  const p = state.profile, s = state.settings
  const setP = (k, v) => update(x => { x.profile[k] = v })
  const setS = (k, v) => update(x => { x.settings[k] = v })
  const setBrand = (k, v) => update(x => { x.settings.brandColors[k] = v })

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ ...state, settings: { ...state.settings, apiKey: '' } }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `digital-empire-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click()
  }
  const importData = async (f) => {
    if (!f) return
    try { const d = JSON.parse(await f.text()); if (!d.profile) throw new Error('Not a backup file'); replace({ ...d, settings: { ...d.settings, apiKey: state.settings.apiKey } }); notify('Backup restored') } catch (e) { notify(`Import failed: ${e.message}`, 'error') }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader icon={Cog} title="Settings" subtitle="Profile, AI, appearance and your data." />
      <div className="space-y-5">
        <Card title={<span className="flex items-center gap-2"><User size={17} />Profile</span>}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><input className="input" value={p.name} onChange={e => setP('name', e.target.value)} /></Field>
            <Field label="Start date (Day 1)"><input type="date" className="input" value={p.startDate} onChange={e => setP('startDate', e.target.value)} /></Field>
            <Field label="Niche"><input className="input" value={p.niche} onChange={e => setP('niche', e.target.value)} placeholder="e.g. Plumbers" /></Field>
            <Field label="City"><input className="input" value={p.city} onChange={e => setP('city', e.target.value)} /></Field>
            <Field label="Level"><select className="input" value={p.experience} onChange={e => setP('experience', e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></Field>
            <Field label="Scenario"><select className="input" value={p.scenario} onChange={e => setP('scenario', e.target.value)}><option value="conservative">Conservative</option><option value="base">Base</option><option value="aggressive">Aggressive</option></select></Field>
            <Field label="Hours per day"><input type="number" className="input" value={p.hoursPerDay} onChange={e => setP('hoursPerDay', +e.target.value)} /></Field>
            <Field label="Goal"><input className="input" value={p.goal} onChange={e => setP('goal', e.target.value)} /></Field>
          </div>
        </Card>

        <Card title={<span className="flex items-center gap-2"><KeyRound size={17} />AI (Claude) — optional</span>} subtitle="Unlocks AI review of assignments and files, image analysis, AI-generated questions with web research, and the full AI Coach.">
          <Field label="Anthropic API key" hint="Get one at console.anthropic.com. Stored only in this browser and sent only to api.anthropic.com.">
            <div className="flex gap-2"><input type={show ? 'text' : 'password'} className="input font-mono" value={s.apiKey} onChange={e => setS('apiKey', e.target.value)} placeholder="sk-ant-…" autoComplete="off" /><button className="btn btn-ghost" onClick={() => setShow(!show)} aria-label="Show key">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          </Field>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <Field label="Model"><select className="input" value={s.model} onChange={e => setS('model', e.target.value)}><option value="claude-opus-5-5">Claude Opus 5.5 (default, best quality)</option><option value="claude-sonnet-5-5">Claude Sonnet 5.5 (faster, cheaper)</option><option value="claude-haiku-5-5">Claude Haiku 5.5 (fastest, cheapest)</option></select></Field>
            <label className="flex items-center gap-2 text-sm mt-6"><input type="checkbox" checked={s.webResearch} onChange={e => setS('webResearch', e.target.checked)} />Use web research by default when generating questions</label>
          </div>
          <div className="mt-3"><Callout tone="warn"><span className="flex gap-1"><ShieldAlert size={15} className="shrink-0 mt-0.5" />Anyone using this browser profile can read a key stored here. Use a key with a spending limit, and remove it on shared computers. Requests use refusal fallbacks so a declined request is retried on a fallback model.</span></Callout></div>
        </Card>

        <Card title={<span className="flex items-center gap-2"><Palette size={17} />Appearance</span>} subtitle="Defaults use a SEBT NEXT-style navy, electric blue and orange palette. Paste exact brand hex codes here.">
          <div className="grid sm:grid-cols-4 gap-3">
            <Field label="Theme"><select className="input" value={s.theme} onChange={e => setS('theme', e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></Field>
            {[['brand', 'Primary'], ['accent', 'Accent'], ['navy', 'Navy / sidebar']].map(([k, l]) => (
              <Field key={k} label={l}><div className="flex gap-2"><input type="color" className="h-10 w-12 rounded-lg border border-line bg-surface" value={s.brandColors[k]} onChange={e => setBrand(k, e.target.value)} aria-label={l} /><input className="input font-mono" value={s.brandColors[k]} onChange={e => /^#[0-9a-f]{6}$/i.test(e.target.value) ? setBrand(k, e.target.value) : null} /></div></Field>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm mt-3" onClick={() => update(x => { x.settings.brandColors = { ...DEFAULT_BRAND } })}>Reset colours</button>
        </Card>

        <Card title={<span className="flex items-center gap-2"><Database size={17} />Your data</span>} subtitle="Everything is saved in this browser. Export a backup regularly or to move to another device.">
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={exportData}><Download size={15} />Export backup (JSON)</button>
            <label className="btn btn-ghost cursor-pointer"><Upload size={15} />Import backup<input type="file" accept="application/json" className="hidden" onChange={e => importData(e.target.files?.[0])} /></label>
            <button className="btn btn-ghost text-bad" onClick={() => { if (confirm('Delete ALL progress, submissions and financial data? This cannot be undone.')) reset() }}><RotateCcw size={15} />Reset everything</button>
          </div>
          <p className="text-xs text-muted mt-3">Backups never include your API key.</p>
        </Card>
      </div>
    </div>
  )
}
