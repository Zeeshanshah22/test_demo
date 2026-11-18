import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'

const KEY = 'digital-empire-academy-v1'
const todayISO = () => new Date().toISOString().slice(0, 10)

export const DEFAULT_BRAND = { brand: '#1f5eff', accent: '#ff8a00', navy: '#0b1640' }

export const initialState = () => ({
  version: 1,
  profile: { name: '', startDate: todayISO(), niche: '', city: '', experience: 'beginner', hoursPerDay: 2, scenario: 'base', goal: 'Reach A$10k monthly revenue by Month 12', onboarded: false },
  settings: { apiKey: '', model: 'claude-opus-5-5', theme: 'system', brandColors: { ...DEFAULT_BRAND }, webResearch: true },
  lessons: {},            // lessonId -> ISO date completed
  lessonNotes: {},        // lessonId -> text
  quizAttempts: [],       // {id,date,mode,topic,total,correct,xp,items:[{qid,topic,ok,type,d}]}
  customQuestions: [],    // AI or user-generated questions
  submissions: [],        // assignment submissions
  analyses: [],           // file analyses
  milestones: {},         // id -> {done, date, note}
  actuals: {},            // monthIndex (1..60) -> {revenue:{}, costs:{}, volume:{}, cash}
  kpis: [],               // {id, week, values:{}}
  outreach: [],           // {date, emails, proposals, looms, linkedin, calls, deals}
  cards: [],              // workflow cards {id,title,col,board,priority,due,created}
  team: [],               // actual hires {id,name,role,pkr,startMonth,fte}
  xpLog: [],              // {date, xp, reason}
  activity: {},           // date -> count
  coach: [],              // chat history {role, text}
})

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw)
    const base = initialState()
    return { ...base, ...parsed, profile: { ...base.profile, ...parsed.profile }, settings: { ...base.settings, ...parsed.settings, brandColors: { ...DEFAULT_BRAND, ...(parsed.settings?.brandColors || {}) } } }
  } catch {
    return initialState()
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  const [toast, setToast] = useState(null)
  const timer = useRef()

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full or blocked */ }
  }, [state])

  const update = useCallback((fn) => {
    setState(prev => {
      const draft = structuredClone(prev)
      fn(draft)
      const d = todayISO()
      draft.activity[d] = (draft.activity[d] || 0) + 1
      return draft
    })
  }, [])

  const addXP = useCallback((xp, reason) => {
    if (!xp) return
    update(s => { s.xpLog.push({ date: new Date().toISOString(), xp: Math.round(xp), reason }) })
    notify(`+${Math.round(xp)} XP · ${reason}`)
  }, [update])

  const notify = useCallback((msg, kind = 'success') => {
    setToast({ msg, kind, id: Date.now() })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const reset = useCallback(() => setState(initialState()), [])
  const replace = useCallback((s) => setState({ ...initialState(), ...s }), [])

  const value = useMemo(() => ({ state, update, addXP, notify, toast, reset, replace }), [state, update, addXP, notify, toast, reset, replace])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
