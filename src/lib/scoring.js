import { ALL_LESSONS, ALL_MODULES, SKILLS, moduleById } from '../data/curriculum'
import { QUESTIONS } from '../data/questions'
import { ASSIGNMENTS } from '../data/assignments'
import { MILESTONES } from '../data/milestones'
import { Y1, FIVE_YEAR, SCENARIOS, ENGINES, sum } from '../data/plan'

export const LEVELS = [
  { name: 'Apprentice', min: 0 },
  { name: 'Freelancer', min: 300 },
  { name: 'Specialist', min: 800 },
  { name: 'Agency Builder', min: 1600 },
  { name: 'Agency Owner', min: 3000 },
  { name: 'Empire Founder', min: 5000 },
]

export function levelFor(xp) {
  let i = 0
  LEVELS.forEach((l, k) => { if (xp >= l.min) i = k })
  const cur = LEVELS[i], next = LEVELS[i + 1]
  const pct = next ? (xp - cur.min) / (next.min - cur.min) * 100 : 100
  return { ...cur, index: i, next, pct }
}

export const dayNumber = (startDate) => {
  const s = new Date(startDate + 'T00:00:00')
  return Math.max(1, Math.floor((Date.now() - s.getTime()) / 86400000) + 1)
}
export const planMonth = (startDate) => Math.min(60, Math.max(1, Math.ceil(dayNumber(startDate) / 30.44)))

export const allQuestions = (state) => [...QUESTIONS, ...(state.customQuestions || [])]

export function totalXP(state) { return sum(state.xpLog.map(x => x.xp)) }

export function streak(state) {
  let s = 0
  const d = new Date()
  for (;;) {
    const k = d.toISOString().slice(0, 10)
    if (state.activity[k]) { s++; d.setDate(d.getDate() - 1) } else break
  }
  return s
}

// Per-topic quiz accuracy (all attempts, recent answers weigh more)
export function topicAccuracy(state) {
  const acc = {}
  const items = state.quizAttempts.flatMap(a => a.items)
  items.forEach((it, idx) => {
    const w = 1 + idx / Math.max(1, items.length)
    acc[it.topic] ??= { c: 0, t: 0, n: 0 }
    acc[it.topic].c += it.ok ? w : 0
    acc[it.topic].t += w
    acc[it.topic].n += 1
  })
  return Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, { pct: v.t ? v.c / v.t * 100 : 0, n: v.n }]))
}

export function lessonProgress(state) {
  const done = ALL_LESSONS.filter(l => state.lessons[l.id]).length
  const byModule = Object.fromEntries(ALL_MODULES.map(m => {
    const d = m.lessons.filter(l => state.lessons[l.id]).length
    return [m.id, { done: d, total: m.lessons.length, pct: d / m.lessons.length * 100 }]
  }))
  const tierPct = (t) => {
    const ls = ALL_LESSONS.filter(l => l.tier === t)
    return ls.length ? ls.filter(l => state.lessons[l.id]).length / ls.length * 100 : 0
  }
  return { done, total: ALL_LESSONS.length, pct: done / ALL_LESSONS.length * 100, byModule, tier1: tierPct(1), playbook: tierPct(0) }
}

export function bestSubmission(state, aid) {
  const subs = state.submissions.filter(s => s.assignmentId === aid)
  if (!subs.length) return null
  return subs.reduce((a, b) => (b.score > a.score ? b : a))
}

export function assignmentStats(state) {
  const best = ASSIGNMENTS.map(a => bestSubmission(state, a.id)).filter(Boolean)
  const avg = best.length ? sum(best.map(b => b.score)) / best.length : 0
  return { submitted: best.length, total: ASSIGNMENTS.length, avg, completionPct: best.length / ASSIGNMENTS.length * 100 }
}

// Aggregated actuals to date
export function actualTotals(state) {
  const months = Object.keys(state.actuals).map(Number).sort((a, b) => a - b)
  const rev = {}, cost = {}
  let revenue = 0, costs = 0, lastCash = null
  const latestVol = {}
  months.forEach(m => {
    const a = state.actuals[m]
    Object.entries(a.revenue || {}).forEach(([k, v]) => { rev[k] = (rev[k] || 0) + (+v || 0); revenue += +v || 0 })
    Object.entries(a.costs || {}).forEach(([k, v]) => { cost[k] = (cost[k] || 0) + (+v || 0); costs += +v || 0 })
    Object.entries(a.volume || {}).forEach(([k, v]) => { if (v !== '' && v !== undefined) latestVol[k] = +v })
    if (a.cash !== undefined && a.cash !== '') lastCash = +a.cash
  })
  const last = months.length ? state.actuals[months[months.length - 1]] : null
  const lastRevenue = last ? sum(Object.values(last.revenue || {})) : 0
  return { months, rev, cost, revenue, costs, net: revenue - costs, lastCash, latestVol, lastRevenue, lastMonth: months[months.length - 1] }
}

// Plan totals through month m (Y1 monthly; later years pro-rated from 5-year plan)
export function planMonthValue(series, m) {
  if (m <= 12) return Y1[series][m - 1]
  const y = Math.ceil(m / 12) - 1
  if (series === 'totalRevenue') return FIVE_YEAR.revenue[y] / 12
  if (series === 'totalCosts') return FIVE_YEAR.totalCosts[y] / 12
  return 0
}
export function planToDate(series, m) { let t = 0; for (let i = 1; i <= m; i++) t += planMonthValue(series, i); return t }

export function scenarioFactor(scenario) {
  return SCENARIOS[scenario].y1 / SCENARIOS.base.y1
}

export function metricValue(state, metric) {
  const t = actualTotals(state)
  const lp = lessonProgress(state)
  switch (metric) {
    case 'retainers': return t.latestVol.retainers || 0
    case 'automationProjects': return sumVol(state, 'automationProjects')
    case 'webProjects': return sumVol(state, 'webProjects')
    case 'assetsLive': return t.latestVol.assetsLive || 0
    case 'clients': return (t.latestVol.retainers || 0) + sumVol(state, 'automationProjects') + sumVol(state, 'webProjects')
    case 'mrr': return t.lastRevenue
    case 'tier1Pct': return lp.tier1
    case 'outreachDays': return state.outreach.length
    default: return 0
  }
}
const sumVol = (state, k) => sum(Object.values(state.actuals).map(a => +(a.volume?.[k] || 0)))

export function milestoneStatus(state, m) {
  const day = dayNumber(state.profile.startDate)
  const rec = state.milestones[m.id]
  const autoMet = m.auto ? metricValue(state, m.auto.metric) >= m.auto.gte : false
  const done = !!rec?.done || autoMet
  if (done) {
    const start = new Date(state.profile.startDate + 'T00:00:00').getTime()
    const doneDay = rec?.date ? Math.floor((new Date(rec.date).getTime() - start) / 86400000) + 1 : day
    return { key: 'done', label: doneDay <= m.due ? 'Done on time' : 'Done late', onTime: doneDay <= m.due, done: true, auto: autoMet && !rec?.done }
  }
  if (day > m.due) return { key: 'overdue', label: `Overdue ${day - m.due}d`, done: false }
  if (m.due - day <= 14) return { key: 'due', label: `Due in ${m.due - day}d`, done: false }
  return { key: 'upcoming', label: `Day ${m.due}`, done: false }
}

export function milestoneStats(state) {
  const day = dayNumber(state.profile.startDate)
  const st = MILESTONES.map(m => ({ m, s: milestoneStatus(state, m) }))
  const due = st.filter(x => x.m.due <= day)
  const doneDue = due.filter(x => x.s.done)
  const onTime = st.filter(x => x.s.done && x.s.onTime).length
  return {
    total: MILESTONES.length, done: st.filter(x => x.s.done).length,
    dueCount: due.length, doneDue: doneDue.length, overdue: st.filter(x => x.s.key === 'overdue').length,
    onTrackPct: due.length ? doneDue.length / due.length * 100 : 100, onTime, list: st,
  }
}

export function financialHealth(state) {
  const t = actualTotals(state)
  if (!t.months.length) return { pct: null, revenueVsPlan: null, planRev: 0, actualRev: 0 }
  const planRev = sum(t.months.map(m => planMonthValue('totalRevenue', m))) * scenarioFactor(state.profile.scenario)
  const ratio = planRev ? t.revenue / planRev : 1
  return { pct: Math.min(120, ratio * 100), revenueVsPlan: ratio, planRev, actualRev: t.revenue }
}

export function quizStats(state) {
  const items = state.quizAttempts.flatMap(a => a.items)
  const recent = items.slice(-60)
  const pct = recent.length ? recent.filter(i => i.ok).length / recent.length * 100 : 0
  return { answered: items.length, attempts: state.quizAttempts.length, pct, correct: items.filter(i => i.ok).length }
}

export function consistency(state) {
  const days = Object.keys(state.activity)
  const last30 = days.filter(d => (Date.now() - new Date(d).getTime()) / 86400000 <= 30).length
  return Math.min(100, last30 / 20 * 100)
}

// Area scores 0..100 used everywhere (dashboard, radar, strengths/lagging)
export function areaScores(state) {
  const lp = lessonProgress(state)
  const qs = quizStats(state)
  const as = assignmentStats(state)
  const ms = milestoneStats(state)
  const fh = financialHealth(state)
  const outreachDays = state.outreach.filter(o => (Date.now() - new Date(o.date).getTime()) / 86400000 <= 14)
  const outreachPct = Math.min(100, outreachDays.reduce((a, o) => a + Math.min(1, ((+o.emails || 0) / 30 + (+o.proposals || 0) / 10 + (+o.looms || 0) / 5) / 3), 0) / 10 * 100)
  return [
    { key: 'learning', name: 'Learning', value: lp.pct, hint: `${lp.done}/${lp.total} lessons` },
    { key: 'knowledge', name: 'Knowledge', value: qs.answered ? qs.pct : 0, hint: qs.answered ? `${qs.pct.toFixed(0)}% recent accuracy` : 'Take a quiz' },
    { key: 'assignments', name: 'Assignments', value: as.submitted ? as.avg * (0.5 + 0.5 * as.completionPct / 100) : 0, hint: `${as.submitted}/${as.total} submitted, avg ${as.avg.toFixed(0)}` },
    { key: 'execution', name: 'Milestones', value: ms.dueCount ? ms.onTrackPct : (ms.done ? 100 : 50), hint: `${ms.doneDue}/${ms.dueCount} due milestones done` },
    { key: 'financial', name: 'Financials', value: fh.pct ?? 0, hint: fh.pct === null ? 'Log your actuals' : `${(fh.revenueVsPlan * 100).toFixed(0)}% of plan revenue` },
    { key: 'outreach', name: 'Outreach', value: outreachPct, hint: `${outreachDays.length} days logged (14d)` },
    { key: 'consistency', name: 'Consistency', value: consistency(state), hint: `${streak(state)}-day streak` },
  ]
}

export function empireScore(state) {
  const a = areaScores(state)
  const w = { learning: 0.15, knowledge: 0.15, assignments: 0.15, execution: 0.2, financial: 0.15, outreach: 0.1, consistency: 0.1 }
  return Math.round(a.reduce((t, x) => t + Math.min(100, x.value) * w[x.key], 0) * 10)
}

// Expected pace for a peer on plan at this day -> used for a simulated benchmark cohort.
export function expectedPace(state) {
  const day = dayNumber(state.profile.startDate)
  const f = Math.min(1, day / 365)
  return {
    learning: Math.min(100, 20 + f * 80), knowledge: 55 + f * 20, assignments: 40 + f * 35, execution: 70,
    financial: 75, outreach: 55, consistency: 60,
  }
}
const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y }
export const percentile = (v, mean, sd = 18) => Math.round(Math.max(1, Math.min(99, 50 * (1 + erf((v - mean) / (sd * Math.SQRT2))))))

export function peerComparison(state) {
  const pace = expectedPace(state)
  return areaScores(state).map(a => ({ ...a, peer: pace[a.key], top: Math.min(100, pace[a.key] + 22), percentile: percentile(a.value, pace[a.key]) }))
}

export function strengthsAndGaps(state) {
  const areas = peerComparison(state)
  const topics = Object.entries(topicAccuracy(state)).filter(([, v]) => v.n >= 2).map(([k, v]) => ({ key: k, name: moduleById[k]?.name || k, value: v.pct, n: v.n }))
  const strong = [...areas.filter(a => a.value >= a.peer).map(a => ({ name: a.name, value: a.value, why: a.hint })), ...topics.filter(t => t.value >= 75).map(t => ({ name: t.name, value: t.value, why: `${t.value.toFixed(0)}% quiz accuracy` }))]
  const weak = [...areas.filter(a => a.value < a.peer).map(a => ({ name: a.name, value: a.value, gap: a.peer - a.value, why: a.hint, key: a.key })), ...topics.filter(t => t.value < 60).map(t => ({ name: t.name, value: t.value, gap: 60 - t.value, why: `${t.value.toFixed(0)}% quiz accuracy`, topic: t.key }))]
  weak.sort((a, b) => b.gap - a.gap)
  return { strong, weak }
}

export function recommendations(state) {
  const recs = []
  const lp = lessonProgress(state)
  const qs = quizStats(state)
  const ms = milestoneStats(state)
  const t = actualTotals(state)
  const { weak } = strengthsAndGaps(state)
  const nextSkill = ['aeo', 'localseo', 'automation', 'vibe', 'agents', 'techseo', 'pm'].find(id => lp.byModule[id].pct < 100)
  if (nextSkill) recs.push({ to: `/learn/${nextSkill}`, title: `Continue ${moduleById[nextSkill].name}`, why: 'Next in your 120-day learning order (AEO → Local SEO → Automation → Vibe Coding → Agents → Tech SEO → PM).', kind: 'learn' })
  if (!qs.answered) recs.push({ to: '/quiz?mode=placement', title: 'Take the placement test', why: 'It sets your starting level and finds weak topics.', kind: 'quiz' })
  weak.filter(w => w.topic).slice(0, 2).forEach(w => recs.push({ to: `/quiz?topic=${w.topic}`, title: `Drill: ${w.name}`, why: `Your accuracy is ${w.value.toFixed(0)}%. Aim for 75%+.`, kind: 'quiz' }))
  const overdue = ms.list.filter(x => x.s.key === 'overdue').slice(0, 2)
  overdue.forEach(x => recs.push({ to: '/milestones', title: x.m.title, why: `Milestone is ${x.s.label.toLowerCase()}.`, kind: 'milestone' }))
  const nextAs = ASSIGNMENTS.find(a => !bestSubmission(state, a.id))
  if (nextAs) recs.push({ to: `/assignments/${nextAs.id}`, title: `Submit: ${nextAs.title}`, why: 'Assignments turn lessons into sellable assets.', kind: 'assignment' })
  if (!t.months.length) recs.push({ to: '/financials?tab=log', title: 'Log your first month of actuals', why: 'Needed to compare you with the financial model.', kind: 'finance' })
  if (!state.outreach.length) recs.push({ to: '/workflow?tab=outreach', title: 'Log today\'s outreach', why: 'Target: 30 emails, 10 proposals, 5 Loom audits a day.', kind: 'outreach' })
  return recs.slice(0, 6)
}

export function scenarioTracking(state) {
  // Compare retainers at month 6 / 12 with scenario triggers
  const m = planMonth(state.profile.startDate)
  const ret = metricValue(state, 'retainers')
  const planRet = Y1.volume.retainers[Math.min(11, m - 1)]
  let label = 'Base', tone = 'info'
  if (m >= 6 && ret < 2) { label = 'Conservative'; tone = 'danger' } else if (ret > planRet * 1.3 && ret >= 2) { label = 'Aggressive'; tone = 'success' } else if (ret < planRet) { label = 'Below base'; tone = 'warning' }
  return { label, tone, ret, planRet, month: m }
}

export { SKILLS, ENGINES }
