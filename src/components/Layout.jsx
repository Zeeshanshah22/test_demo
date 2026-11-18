import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, ListChecks, FileCheck2, FileSearch, Wallet, Flag, KanbanSquare, Gauge, Calculator, BarChart3, Bot, Settings, Menu, X, Search, Sun, Moon, Flame, Trophy, BookOpen } from 'lucide-react'
import { useStore } from '../store'
import { totalXP, levelFor, streak, empireScore } from '../lib/scoring'
import { ALL_LESSONS, ALL_MODULES } from '../data/curriculum'
import { ASSIGNMENTS } from '../data/assignments'
import { MILESTONES } from '../data/milestones'
import Onboarding from './Onboarding'

export const NAV = [
  { group: 'Overview', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/performance', label: 'Performance', icon: BarChart3 },
  ] },
  { group: 'Learn', items: [
    { to: '/learn', label: 'Course', icon: GraduationCap },
    { to: '/quiz', label: 'Quizzes & Tests', icon: ListChecks },
    { to: '/assignments', label: 'Assignments', icon: FileCheck2 },
    { to: '/analyzer', label: 'File Analyzer', icon: FileSearch },
    { to: '/coach', label: 'AI Coach', icon: Bot },
  ] },
  { group: 'Build the business', items: [
    { to: '/milestones', label: 'Milestones', icon: Flag },
    { to: '/workflow', label: 'Workflow', icon: KanbanSquare },
    { to: '/financials', label: 'Financials', icon: Wallet },
    { to: '/kpis', label: 'KPI Scorecard', icon: Gauge },
    { to: '/tools', label: 'Calculators', icon: Calculator },
    { to: '/plan', label: 'Plan Library', icon: BookOpen },
  ] },
]
const MOBILE = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/learn', label: 'Learn', icon: GraduationCap },
  { to: '/quiz', label: 'Quiz', icon: ListChecks },
  { to: '/financials', label: 'Money', icon: Wallet },
]

function applyTheme(settings) {
  const root = document.documentElement
  if (settings.theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', settings.theme)
  const b = settings.brandColors || {}
  if (b.brand) root.style.setProperty('--brand', b.brand)
  if (b.accent) root.style.setProperty('--accent', b.accent)
  if (b.navy) root.style.setProperty('--navy', b.navy)
}

export default function Layout() {
  const { state, update, toast } = useStore()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => { applyTheme(state.settings) }, [state.settings])
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  useEffect(() => {
    const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) } }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])

  const xp = totalXP(state)
  const lvl = levelFor(xp)
  const isDark = state.settings.theme === 'dark' || (state.settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const sidebar = (
    <div className="flex flex-col h-full text-[var(--sidebar-text)]">
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl grid place-items-center bg-brand shadow-lg"><svg viewBox="0 0 64 64" width="22" height="22"><path d="M10 46l12-26 9 16 7-9 16 19z" fill="var(--accent)" /></svg></div>
        <div className="leading-tight"><div className="font-display font-bold text-white text-[15px]">Digital Empire</div><div className="text-[11px] opacity-70">Academy · SEBT NEXT</div></div>
      </div>
      <div className="mx-4 mb-3 rounded-xl bg-white/5 p-3">
        <div className="flex items-center justify-between text-xs"><span className="font-semibold text-white flex items-center gap-1"><Trophy size={13} className="text-accent" />{lvl.name}</span><span>{xp.toLocaleString()} XP</span></div>
        <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${lvl.pct}%` }} /></div>
        <div className="flex justify-between text-[11px] mt-1.5 opacity-80"><span className="flex items-center gap-1"><Flame size={12} className="text-accent" />{streak(state)}-day streak</span><span>Score {empireScore(state)}</span></div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        {NAV.map(g => (
          <div key={g.group} className="mb-3">
            <div className="px-3 text-[10px] uppercase tracking-widest opacity-50 font-semibold mb-1">{g.group}</div>
            {g.items.map(it => (
              <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand text-white shadow' : 'hover:bg-white/8 hover:text-white'}`}>
                <it.icon size={17} />{it.label}
              </NavLink>
            ))}
          </div>
        ))}
        <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand text-white' : 'hover:bg-white/8 hover:text-white'}`}><Settings size={17} />Settings</NavLink>
      </nav>
    </div>
  )

  return (
    <div className="min-h-full lg:pl-64">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-[var(--sidebar)] z-30">{sidebar}</aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85%] bg-[var(--sidebar)] fade-in">
            <button className="absolute right-3 top-4 text-white/80 p-1" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur border-b border-line">
        <div className="flex items-center gap-2 px-4 sm:px-6 h-14">
          <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-2" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <button onClick={() => setSearchOpen(true)} className="flex-1 min-w-0 max-w-md flex items-center gap-2 h-9 px-3 rounded-lg border border-line bg-surface text-sm text-faint hover:border-brand/40">
            <Search size={15} /><span className="truncate">Search lessons, tools, milestones…</span><kbd className="ml-auto hidden sm:inline text-[10px] border border-line rounded px-1.5">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <span className="hidden sm:flex chip chip-accent"><Flame size={12} />{streak(state)}</span>
            <button className="p-2 rounded-lg hover:bg-surface-2" aria-label="Toggle theme" onClick={() => update(s => { s.settings.theme = isDark ? 'light' : 'dark' })}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <NavLink to="/settings" className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center text-sm font-bold" aria-label="Profile">{(state.profile.name || 'U').slice(0, 1).toUpperCase()}</NavLink>
          </div>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-5 pb-28 lg:pb-10 max-w-[1400px] mx-auto fade-in" key={loc.pathname + loc.search}>
        <Outlet />
      </main>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-line safe-bottom" aria-label="Quick">
        <div className="grid grid-cols-5">
          {MOBILE.map(it => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `flex flex-col items-center py-2 text-[11px] font-medium ${isActive ? 'text-brand' : 'text-muted'}`}><it.icon size={20} />{it.label}</NavLink>
          ))}
          <button onClick={() => setOpen(true)} className="flex flex-col items-center py-2 text-[11px] font-medium text-muted"><Menu size={20} />More</button>
        </div>
      </nav>
      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
      {!state.profile.onboarded && <Onboarding />}
      {toast && (
        <div className="fixed z-[60] bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 fade-in" role="status">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.kind === 'error' ? 'bg-bad' : 'bg-navy'}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  )
}

function SearchPalette({ onClose }) {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const items = useMemo(() => [
    ...NAV.flatMap(g => g.items.map(i => ({ type: 'Page', title: i.label, to: i.to }))),
    { type: 'Page', title: 'Settings', to: '/settings' },
    ...ALL_MODULES.map(m => ({ type: m.kind === 'skill' ? `Skill · Tier ${m.tier}` : 'Playbook', title: m.name, to: `/learn/${m.id}` })),
    ...ALL_LESSONS.map(l => ({ type: 'Lesson', title: l.title, sub: l.moduleName, to: `/learn/${l.moduleId}#${l.id}`, text: l.points.join(' ') })),
    ...ASSIGNMENTS.map(a => ({ type: 'Assignment', title: a.title, to: `/assignments/${a.id}`, text: a.brief })),
    ...MILESTONES.map(m => ({ type: 'Milestone', title: m.title, sub: m.phase, to: '/milestones' })),
    ...['Runway', 'Pricing & ROI', 'Salary converter', 'Profit First', 'Exit valuation', 'Skill scorer', 'Funnel predictor', 'LTV:CAC', 'Break-even', 'Hiring guardrail', 'Wealth predictor', 'Flip valuation', 'SaaS MRR', 'Tool ROI', 'GST threshold', 'Retainer MRR projector'].map(t => ({ type: 'Calculator', title: t, to: `/tools#${t.toLowerCase().replace(/[^a-z]+/g, '-')}` })),
  ], [])
  const res = q.trim() ? items.filter(i => (i.title + ' ' + (i.sub || '') + ' ' + (i.text || '')).toLowerCase().includes(q.toLowerCase())).slice(0, 30) : items.slice(0, 14)
  return (
    <div className="fixed inset-0 z-[55] bg-black/50 flex items-start justify-center p-4 pt-[10vh]" onClick={onClose}>
      <div className="card w-full max-w-xl overflow-hidden fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 border-b border-line"><Search size={18} className="text-faint" /><input autoFocus className="flex-1 h-12 bg-transparent outline-none text-sm" placeholder="Search everything…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && res[0]) { nav(res[0].to); onClose() } }} /></div>
        <ul className="max-h-[60vh] overflow-y-auto p-2">
          {res.map((r, i) => (
            <li key={i}><button className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 flex items-center justify-between gap-3" onClick={() => { nav(r.to); onClose() }}>
              <span className="min-w-0"><span className="block text-sm font-medium truncate">{r.title}</span>{r.sub && <span className="block text-xs text-muted truncate">{r.sub}</span>}</span>
              <span className="chip chip-muted shrink-0">{r.type}</span>
            </button></li>
          ))}
          {!res.length && <li className="p-6 text-center text-sm text-muted">No results</li>}
        </ul>
      </div>
    </div>
  )
}
