import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export function PageHeader({ title, subtitle, actions, icon: Icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
      <div className="flex items-start gap-3">
        {Icon && <div className="hidden sm:grid place-items-center w-11 h-11 rounded-xl bg-brand/10 text-brand shrink-0"><Icon size={22} /></div>}
        <div>
          <h1 className="text-2xl sm:text-[1.7rem] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-muted text-sm mt-1 max-w-3xl">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, subtitle, action, children, className = '', pad = true }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4">
          <div className="min-w-0">
            {title && <h2 className="font-semibold text-[1rem] leading-snug">{title}</h2>}
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={pad ? 'p-4 sm:p-5' : ''}>{children}</div>
    </section>
  )
}

export function Stat({ label, value, sub, tone, icon: Icon, to }) {
  const toneCls = { ok: 'text-ok', warn: 'text-warn', bad: 'text-bad', brand: 'text-brand' }[tone] || ''
  const body = (
    <div className="card p-4 h-full hover:border-brand/40 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={16} className="text-faint" />}
      </div>
      <div className={`text-2xl font-bold mt-1 font-display tabular-nums ${toneCls}`}>{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  )
  return to ? <Link to={to} className="block">{body}</Link> : body
}

export function Progress({ value, tone = 'brand', size = 'md', label }) {
  const v = Math.max(0, Math.min(100, value || 0))
  const col = { brand: 'var(--brand)', accent: 'var(--accent)', ok: 'var(--success)', warn: 'var(--warning)', bad: 'var(--danger)' }[tone]
  return (
    <div className="w-full" role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`w-full rounded-full bg-surface-2 overflow-hidden ${size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'}`}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${v}%`, background: col }} />
      </div>
    </div>
  )
}

export function Ring({ value, size = 120, stroke = 10, label, sub, color = 'var(--brand)', max = 100 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value / max))
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity=".15" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset .6s' }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-display font-bold text-2xl leading-none tabular-nums">{label}</div>
        {sub && <div className="text-[10px] uppercase tracking-wide opacity-75 mt-1">{sub}</div>}
      </div>
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="scroll-x -mx-1 px-1 mb-4">
      <div className="inline-flex gap-1 p-1 rounded-xl bg-surface-2 border border-line min-w-max" role="tablist">
        {tabs.map(t => (
          <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${value === t.id ? 'bg-surface text-brand shadow-sm' : 'text-muted hover:text-ink'}`}>
            {t.icon && <t.icon size={15} />}{t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Badge({ tone = 'muted', children, className = '' }) {
  return <span className={`chip chip-${tone} ${className}`}>{children}</span>
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className={`card w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-2xl fade-in`} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between px-5 pt-4 sticky top-0 bg-surface z-10 pb-2">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}

export function Empty({ icon: Icon = Info, title, text, action }) {
  return (
    <div className="text-center py-8 px-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-surface-2 grid place-items-center text-faint mb-3"><Icon size={22} /></div>
      <div className="font-semibold">{title}</div>
      {text && <p className="text-sm text-muted mt-1 max-w-md mx-auto">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Callout({ tone = 'info', title, children }) {
  const map = { info: ['bg-brand/8 border-brand/25', Info, 'text-brand'], ok: ['bg-ok/10 border-ok/30', CheckCircle2, 'text-ok'], warn: ['bg-warn/10 border-warn/30', AlertTriangle, 'text-warn'], bad: ['bg-bad/10 border-bad/30', XCircle, 'text-bad'] }
  const [cls, Icon, ic] = map[tone]
  return (
    <div className={`rounded-xl border p-3 text-sm flex gap-2.5 ${cls}`}>
      <Icon size={18} className={`shrink-0 mt-0.5 ${ic}`} />
      <div className="min-w-0">{title && <div className="font-semibold mb-0.5">{title}</div>}<div className="text-ink/90">{children}</div></div>
    </div>
  )
}

export function Field({ label, children, hint }) {
  return <label className="block min-w-0"><span className="label">{label}</span>{children}{hint && <span className="text-xs text-faint mt-1 block">{hint}</span>}</label>
}

export function NumberInput({ value, onChange, prefix, suffix, step = 'any', min, ...rest }) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm">{prefix}</span>}
      <input type="number" inputMode="decimal" step={step} min={min} className={`input tabular-nums ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-10' : ''}`} value={value ?? ''} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} {...rest} />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-faint text-sm">{suffix}</span>}
    </div>
  )
}

export function StatusDot({ tone }) {
  const c = { ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', brand: 'bg-brand', muted: 'bg-faint' }[tone]
  return <span className={`inline-block w-2 h-2 rounded-full ${c}`} />
}

export function Collapse({ title, children, defaultOpen = false, right }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-line rounded-xl">
      <button className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="font-semibold text-sm">{title}</span>
        <span className="flex items-center gap-2">{right}<span className={`transition-transform text-faint ${open ? 'rotate-90' : ''}`}>›</span></span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export const toneForScore = (s) => (s >= 80 ? 'ok' : s >= 60 ? 'warn' : 'bad')
