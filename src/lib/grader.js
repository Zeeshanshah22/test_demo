// Built-in rubric grader: scores text against an assignment's criteria, finds mistakes,
// and writes feedback, suggestions and plan-alignment notes. Works fully offline.

const norm = (t) => (t || '').toLowerCase().replace(/[’']/g, "'")

export function textStats(text) {
  const words = (text.match(/\b[\w'’$.,-]+\b/g) || []).length
  const sentences = Math.max(1, (text.match(/[.!?](\s|$)/g) || []).length)
  const lineItems = (text.match(/^\s*(?:[-*•]|\d+[.)]|[a-z][.)])\s+/gim) || []).length
  const inlineItems = (text.match(/(?:^|\s)\d{1,2}[.)]\s+[A-Za-z]/g) || []).length
  const listItems = Math.max(lineItems, inlineItems)
  const questions = (text.match(/\?/g) || []).length
  const numbers = (text.match(/(?:a\$|us\$|\$|pkr|rs\.?)?\s?\d[\d,]*(?:\.\d+)?\s?(?:k|m|%|x)?/gi) || []).filter(s => /\d/.test(s)).length
  const currency = (text.match(/(?:a\$|us\$|\$|aud|usd|pkr|rs\.?)\s?\d[\d,]*/gi) || []).length
  const headings = (text.match(/^(#{1,6}\s|[A-Z][A-Za-z ]{2,40}:\s*$)/gm) || []).length
  const longSentences = text.split(/[.!?]\s/).filter(s => s.split(/\s+/).length > 32).length
  const passive = (text.match(/\b(?:is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length
  return { words, sentences, avgSentence: words / sentences, listItems, questions, numbers, currency, headings, longSentences, passive }
}

function checkCriterion(c, text, stats, ctx = {}) {
  const t = norm(text)
  switch (c.type) {
    case 'terms': {
      const extra = c.useProfile ? [ctx.city, ctx.niche].filter(Boolean).flatMap(v => norm(v).split(/[,/]+/).map(x => x.trim().replace(/s$/, ''))).filter(x => x.length > 2) : []
      const found = [...new Set([...c.terms, ...extra])].filter(term => t.includes(term))
      const ratio = Math.min(1, found.length / c.min)
      return { ratio, evidence: found.length ? `Found: ${found.slice(0, 6).join(', ')}` : 'No matching terms found' }
    }
    case 'avoid': {
      const found = c.terms.filter(term => t.includes(term))
      return { ratio: found.length ? 0 : 1, evidence: found.length ? `Problem wording: ${found.join(', ')}` : 'No risky wording' }
    }
    case 'numbers': {
      const n = c.currency ? stats.currency : stats.numbers
      return { ratio: Math.min(1, n / c.min), evidence: `${n} ${c.currency ? 'currency amounts' : 'numbers'} found (need ${c.min})` }
    }
    case 'words': {
      let ratio = 1
      if (c.min && stats.words < c.min) ratio = stats.words / c.min
      if (c.max && stats.words > c.max) ratio = Math.max(0, 1 - (stats.words - c.max) / c.max)
      return { ratio, evidence: `${stats.words} words` }
    }
    case 'structure': {
      const n = c.kind === 'questions' ? stats.questions : c.kind === 'headings' ? stats.headings : stats.listItems
      return { ratio: Math.min(1, n / c.min), evidence: `${n} ${c.kind === 'questions' ? 'questions' : c.kind === 'headings' ? 'headings' : 'list items'} (need ${c.min})` }
    }
    case 'regex': {
      const ok = new RegExp(c.pattern, 'im').test(text)
      return { ratio: ok ? 1 : 0, evidence: ok ? 'Present' : 'Missing' }
    }
    case 'json': {
      const blocks = [...text.matchAll(/\{[\s\S]*\}/g)].map(m => m[0])
      if (!blocks.length) return { ratio: 0, evidence: 'No JSON block found' }
      // try the largest balanced candidate
      const start = text.indexOf('{'), end = text.lastIndexOf('}')
      try { JSON.parse(text.slice(start, end + 1)); return { ratio: 1, evidence: 'JSON parsed successfully' } } catch (e) { return { ratio: 0, evidence: `Parse error: ${e.message.slice(0, 80)}` } }
    }
    default: return { ratio: 0, evidence: '' }
  }
}

export function gradeAssignment(assignment, text, ctx = {}) {
  const stats = textStats(text)
  const results = assignment.criteria.map(c => {
    const r = checkCriterion(c, text, stats, ctx)
    const earned = Math.round(c.weight * r.ratio * 10) / 10
    return { label: c.label, weight: c.weight, earned, ratio: r.ratio, passed: r.ratio >= 0.999, partial: r.ratio > 0 && r.ratio < 0.999, evidence: r.evidence, fix: c.fix }
  })
  const totalW = results.reduce((a, r) => a + r.weight, 0)
  let score = results.reduce((a, r) => a + r.earned, 0) / totalW * 100

  const writing = []
  if (stats.words < 60) { writing.push('Very short submission — add detail so each rubric point is clearly covered.'); score *= 0.85 }
  if (stats.avgSentence > 26) writing.push(`Average sentence is ${stats.avgSentence.toFixed(0)} words. Aim for under 20 so clients can skim.`)
  if (stats.longSentences > 2) writing.push(`${stats.longSentences} sentences are over 32 words — split them.`)
  if (stats.passive > 4) writing.push(`${stats.passive} passive phrases found — use active voice ("we fix", not "will be fixed").`)
  if (!stats.listItems && stats.words > 150) writing.push('Use bullet points or numbered steps to make it easy to scan.')
  if (stats.numbers < 2) writing.push('Add numbers (prices, targets, timelines). Specific figures build trust and match the financial model.')

  score = Math.max(0, Math.min(100, Math.round(score)))
  const mistakes = results.filter(r => !r.passed).sort((a, b) => (b.weight - b.earned) - (a.weight - a.earned))
  const strengths = results.filter(r => r.passed).map(r => r.label)
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 55 ? 'D' : 'Needs rework'
  const summary = score >= 85
    ? 'Strong work — this is close to client-ready. Polish the remaining points and use it.'
    : score >= 65
      ? 'Good foundation. Fix the highlighted gaps to make it client-ready.'
      : 'Several key elements of the plan are missing. Use the fixes below and the model answer, then resubmit.'
  return { score, grade, summary, results, mistakes, strengths, writing, stats, engine: 'Built-in rubric' }
}

// Plan alignment: how many core Digital Empire concepts a document reflects
export const PLAN_CONCEPTS = [
  { k: 'AEO / AI visibility', terms: ['aeo', 'ai visibility', 'chatgpt', 'perplexity', 'ai overview', 'answer engine'] },
  { k: 'Local SEO / GBP', terms: ['local seo', 'google business profile', 'gbp', 'map pack', 'citations', 'reviews'] },
  { k: 'AI automation & agents', terms: ['n8n', 'make.com', 'automation', 'ai agent', 'receptionist', 'workflow'] },
  { k: 'Recurring revenue', terms: ['retainer', 'recurring', 'mrr', 'monthly', 'care plan', 'maintenance'] },
  { k: 'Australian market', terms: ['australia', 'australian', 'a$', 'aud', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'] },
  { k: 'Offshore team / PKR', terms: ['pkr', 'pakistan', 'offshore', 'team', 'contractor'] },
  { k: 'Pricing & ROI', terms: ['price', 'roi', 'a$', 'per month', 'setup', 'package'] },
  { k: 'Assets / SaaS / equity', terms: ['saas', 'micro-saas', 'asset', 'digital product', 'flip', 'exit'] },
  { k: 'KPIs & measurement', terms: ['kpi', 'churn', 'ltv', 'cac', 'conversion', 'margin', 'report'] },
  { k: 'Risk & compliance', terms: ['privacy', 'contract', 'insurance', 'gst', 'abn', 'white-hat'] },
]
export const RED_FLAGS = [
  { term: 'pbn', msg: 'PBNs carry Google-penalty risk — never use on client sites.' },
  { term: 'parasite', msg: 'Parasite SEO violates spam policy — the plan says "Avoid".' },
  { term: 'guaranteed #1', msg: '"Guaranteed #1" promises are unrealistic; sell named outcomes with risk reversal instead.' },
  { term: 'guarantee #1', msg: '"Guarantee #1" promises are unrealistic; sell named outcomes with risk reversal instead.' },
  { term: 'us llc', msg: 'A US LLC does not reduce Australian tax for an AU resident (plan §9). Get advice.' },
  { term: 'auto-blog', msg: 'Mass auto-blogging carries penalty risk.' },
  { term: 'spin', msg: 'Spun content is low quality and risky — write unique pages.' },
  { term: 'fake review', msg: 'Fake reviews breach ACCC rules and Google policy.' },
  { term: 'buy reviews', msg: 'Buying reviews breaches ACCC rules and Google policy.' },
]

export function planAlignment(text) {
  const t = norm(text)
  const hits = PLAN_CONCEPTS.map(c => ({ concept: c.k, hit: c.terms.some(x => t.includes(x)) }))
  const flags = RED_FLAGS.filter(f => t.includes(f.term))
  const pct = Math.round(hits.filter(h => h.hit).length / hits.length * 100)
  return { pct, hits, flags }
}

// Choose the assignment whose rubric best matches arbitrary text
export function bestRubricMatch(assignments, text, ctx = {}) {
  let best = null, bestScore = -1
  assignments.forEach(a => {
    const g = gradeAssignment(a, text, ctx)
    if (g.score > bestScore) { bestScore = g.score; best = { assignment: a, grade: g } }
  })
  return best
}
