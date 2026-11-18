// Optional Claude integration. The user's own API key is stored only in their browser
// (localStorage) and sent directly to the Anthropic API.
import Anthropic from '@anthropic-ai/sdk'
import { FIVE_YEAR, PRICING, Y1 } from '../data/plan'
import { SKILLS } from '../data/curriculum'

export const PLAN_CONTEXT = `You are the coach inside "Digital Empire Academy", an app that helps an Australia-based founder (485 visa, full work rights, A$20,000 starting capital) turn SEBT (iSkills, M Tanveer Nandla) skills into a remote agency.
The business plan: build one Australian-facing "AI Visibility + AI Automation" agency with a Pakistan-based team, then fund recurring assets (care plans, micro-SaaS, owned sites, digital products). Flywheel: Agency → Recurring → Assets/SaaS → Authority.
Base-case revenue (A$) Y1-Y5: ${FIVE_YEAR.revenue.join(', ')}. Net profit: ${FIVE_YEAR.netProfit.join(', ')}. Gross margin %: ${FIVE_YEAR.grossMargin.join(', ')}. Team FTE: ${FIVE_YEAR.teamFTE.join(', ')}. Founder draw: ${FIVE_YEAR.founderDraw.join(', ')}.
Year-1 monthly revenue plan M1-M12: ${Y1.totalRevenue.join(', ')}; cash low A$1,142 in M11; first positive month M5.
Skill tiers (rank: name score tier): ${SKILLS.slice(0, 14).map(s => `${s.rank}. ${s.name} ${s.score} T${s.tier}`).join('; ')}. Parasite SEO is "Avoid".
Pricing: ${PRICING.map(p => `${p.offer}: ${p.starter} / ${p.growth} / ${p.premium}`).join(' | ')}.
Outreach system: lists → 2-min Loom audit → short email ("[Business] is invisible in ChatGPT") → missed-call test → 20-min call → follow up days 3/7/14/30. Benchmarks: 1,000 emails → 2–4% replies → 8–15 calls → 2–4 clients; 10 Upwork proposals/day, 5–10% hire rate.
Team: Tech Lead PKR 250k (M1 half-time), SEO/AEO PKR 150k (M3), BD PKR 90k (M4 half-time), Web dev PKR 120k (M9). PKR 186.4 per A$, +12% loading.
Guardrails: hire only when recurring revenue covers 2x salary for 3 months; no client >15% of revenue from Y2; payroll <30% of revenue from Y3; Profit First Y1 85/10/5/0.
KPIs: MRR growth 10%+, GM 55%+ from Y3, churn <3%, CAC <1 month retainer, LTV:CAC ≥5x, recurring ≥65% from Y2.
White-hat only: never PBNs, Parasite SEO or fake reviews on client work. Legal/tax/visa points are general information; recommend an accountant or registered migration agent.
Use Australian English, A$ unless stated, and be specific and practical.`

export const hasKey = (settings) => !!settings?.apiKey?.trim()

function client(settings) {
  return new Anthropic({ apiKey: settings.apiKey.trim(), dangerouslyAllowBrowser: true, maxRetries: 2 })
}

function friendlyError(e) {
  if (e instanceof Anthropic.AuthenticationError) return 'Your API key was rejected. Check it in Settings.'
  if (e instanceof Anthropic.PermissionDeniedError) return 'This API key does not have access to that model or feature.'
  if (e instanceof Anthropic.RateLimitError) return 'Rate limit reached — wait a minute and try again.'
  if (e instanceof Anthropic.BadRequestError) return `Request rejected: ${e.message}`
  if (e instanceof Anthropic.APIConnectionError) return 'Could not reach the Anthropic API. Check your connection.'
  if (e instanceof Anthropic.APIError) return `Claude API error (${e.status ?? 'network'}): ${e.message}`
  return e?.message || 'Unknown error'
}

/**
 * Send a request to Claude. content may be a string or an array of content blocks.
 * webSearch adds Anthropic's server-side web search tool for researched answers.
 */
export async function askClaude(settings, { system = PLAN_CONTEXT, content, history = [], webSearch = false, maxTokens = 16000, effort = 'medium' }) {
  if (!hasKey(settings)) throw new Error('Add your Anthropic API key in Settings to use Claude.')
  const c = client(settings)
  const messages = [...history, { role: 'user', content }]
  const params = {
    model: settings.model || 'claude-opus-5-5',
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  }
  if (webSearch) params.tools = [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }]
  try {
    let msg = await c.beta.messages.stream(params).finalMessage()
    // Server tools can pause long turns; continue up to 3 times.
    let guard = 0
    while (msg.stop_reason === 'pause_turn' && guard++ < 3) {
      params.messages = [...params.messages, { role: 'assistant', content: msg.content }]
      msg = await c.beta.messages.stream(params).finalMessage()
    }
    if (msg.stop_reason === 'refusal') throw new Error('Claude declined this request. Try rephrasing it.')
    const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
    const sources = []
    msg.content.forEach(b => {
      if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) b.content.forEach(r => r.url && sources.push({ title: r.title, url: r.url }))
    })
    return { text, sources: dedupe(sources), truncated: msg.stop_reason === 'max_tokens' }
  } catch (e) {
    throw new Error(friendlyError(e))
  }
}
const dedupe = (arr) => arr.filter((x, i) => arr.findIndex(y => y.url === x.url) === i).slice(0, 10)

export function extractJSON(text) {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fence ? fence[1] : text
  const starts = [body.indexOf('['), body.indexOf('{')].filter(i => i >= 0)
  if (!starts.length) throw new Error('No JSON found in the response')
  const s = Math.min(...starts)
  const open = body[s], close = open === '[' ? ']' : '}'
  const e = body.lastIndexOf(close)
  return JSON.parse(body.slice(s, e + 1))
}

export async function aiReview(settings, { title, brief, text, rubric, image }) {
  const prompt = `Review this submission${title ? ` for the assignment "${title}"` : ''}.
${brief ? `Brief: ${brief}\n` : ''}${rubric ? `Rubric: ${rubric}\n` : ''}
Judge it against the Digital Empire business plan and financial model. Point out concrete mistakes (quote the wording), explain why each matters, and give a corrected version.
Reply with ONLY a JSON object:
{"score": 0-100, "summary": "2 sentences", "strengths": ["..."], "mistakes": [{"issue": "...", "why": "...", "fix": "..."}], "suggestions": ["..."], "planAlignment": "how well it matches the plan", "improvedVersion": "a rewritten, improved version (concise)"}

SUBMISSION:
${text || '(see attached image)'}`
  const content = image ? [{ type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } }, { type: 'text', text: prompt }] : prompt
  const res = await askClaude(settings, { content, effort: 'medium' })
  const json = extractJSON(res.text)
  return { ...json, engine: 'Claude' }
}

export async function aiGenerateQuestions(settings, { topicName, topicId, count = 8, difficulty = 'mixed', profile, notes, webSearch }) {
  const prompt = `Create ${count} assessment questions about "${topicName}" for a learner following the Digital Empire plan.
Learner: experience ${profile.experience}; niche ${profile.niche || 'not set'}; city ${profile.city || 'not set'}.
Difficulty: ${difficulty}. ${notes ? `Focus: ${notes}.` : ''}
${webSearch ? 'Research current (2026) best practice and facts on the web first, so questions reflect up-to-date information.' : ''}
Mix these types: "mcq" (4 options), "tf", "dropdown" (sentence with ___ blank and 4 options), "multi" (select all that apply), "numeric" (calculation).
Reply with ONLY a JSON array. Each item:
{"type":"mcq|tf|dropdown|multi|numeric","q":"question","options":["..."],"answer":index (mcq/tf/dropdown; tf options are ["True","False"]),"answers":[indexes] (multi only),"answer":number and "tol":number and "unit":"" (numeric),"d":1-3,"why":"short explanation"}`
  const res = await askClaude(settings, { content: prompt, webSearch, effort: 'medium' })
  const arr = extractJSON(res.text)
  const valid = (Array.isArray(arr) ? arr : []).map((q, i) => normaliseQuestion(q, topicId, i)).filter(Boolean)
  return { questions: valid, sources: res.sources }
}

function normaliseQuestion(q, topic, i) {
  if (!q || !q.q || !q.type) return null
  const base = { id: `ai-${Date.now().toString(36)}-${i}`, topic, d: Math.min(3, Math.max(1, +q.d || 2)), q: String(q.q), why: q.why || '', ai: true, type: q.type }
  if (q.type === 'tf') return { ...base, options: ['True', 'False'], answer: typeof q.answer === 'boolean' ? (q.answer ? 0 : 1) : +q.answer }
  if (q.type === 'numeric') { const a = +q.answer; return isNaN(a) ? null : { ...base, answer: a, tol: +q.tol || Math.abs(a) * 0.01, unit: q.unit || '' } }
  if (!Array.isArray(q.options) || q.options.length < 2) return null
  if (q.type === 'multi') return Array.isArray(q.answers) ? { ...base, options: q.options, answers: q.answers.map(Number) } : null
  const a = +q.answer
  return isNaN(a) || a < 0 || a >= q.options.length ? null : { ...base, type: ['mcq', 'dropdown'].includes(q.type) ? q.type : 'mcq', options: q.options, answer: a }
}

export async function aiCoach(settings, { question, history, profile, snapshot, webSearch }) {
  const sys = `${PLAN_CONTEXT}\n\nLearner profile: ${JSON.stringify(profile)}.\nCurrent progress snapshot: ${snapshot}`
  const hist = history.slice(-10).map(m => ({ role: m.role, content: m.text }))
  return askClaude(settings, { system: sys, content: question, history: hist, webSearch, maxTokens: 8000, effort: 'medium' })
}
