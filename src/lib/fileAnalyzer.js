// Extract text/data from any uploaded file and run built-in analysis.
import { planAlignment, textStats, bestRubricMatch } from './grader'
import { ASSIGNMENTS } from '../data/assignments'
import { Y1, sum } from '../data/plan'

const MAX_CHARS = 400000

export async function extractFile(file) {
  const name = file.name.toLowerCase()
  const ext = name.split('.').pop()
  const out = { name: file.name, size: file.size, type: file.type, ext, text: '', sheets: null, image: null, kind: 'text' }
  if (file.type.startsWith('image/')) {
    out.kind = 'image'
    out.image = await toBase64(file)
    out.text = ''
    return out
  }
  if (ext === 'pdf') {
    const pdfjs = await import('pdfjs-dist')
    const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    pdfjs.GlobalWorkerOptions.workerSrc = worker
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
    const pages = []
    for (let i = 1; i <= doc.numPages; i++) {
      const p = await doc.getPage(i)
      const tc = await p.getTextContent()
      pages.push(tc.items.map(it => it.str + (it.hasEOL ? '\n' : ' ')).join(''))
    }
    out.text = pages.join('\n\n')
    out.pages = doc.numPages
    out.kind = 'document'
  } else if (ext === 'docx') {
    const mammoth = (await import('mammoth')).default
    const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    out.text = r.value
    out.kind = 'document'
  } else if (['xlsx', 'xls', 'csv', 'ods'].includes(ext)) {
    const XLSX = await import('xlsx')
    const wb = ext === 'csv' ? XLSX.read(await file.text(), { type: 'string' }) : XLSX.read(await file.arrayBuffer(), { type: 'array' })
    out.sheets = wb.SheetNames.map(n => ({ name: n, rows: XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '' }) }))
    out.text = out.sheets.map(s => `# ${s.name}\n` + s.rows.map(r => r.join('\t')).join('\n')).join('\n\n')
    out.kind = 'spreadsheet'
  } else if (['html', 'htm'].includes(ext)) {
    out.text = await file.text()
    out.kind = 'html'
  } else if (ext === 'json') {
    out.text = await file.text()
    out.kind = 'json'
  } else {
    out.text = await file.text()
    out.kind = /<html|<head|<title/i.test(out.text.slice(0, 2000)) ? 'html' : 'document'
  }
  out.truncated = out.text.length > MAX_CHARS
  return out
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => { const s = String(r.result); resolve({ mediaType: file.type, data: s.split(',')[1], url: s }) }
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

const f = (score, title, detail, fix) => ({ score, title, detail, fix })

export function analyzeHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const findings = []
  const title = doc.querySelector('title')?.textContent?.trim() || ''
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
  const h1s = doc.querySelectorAll('h1').length
  const imgs = [...doc.querySelectorAll('img')]
  const noAlt = imgs.filter(i => !i.getAttribute('alt')).length
  const ld = [...doc.querySelectorAll('script[type="application/ld+json"]')]
  const canonical = doc.querySelector('link[rel="canonical"]')
  const viewport = doc.querySelector('meta[name="viewport"]')
  const text = doc.body?.textContent?.replace(/\s+/g, ' ').trim() || ''
  const words = text.split(' ').filter(Boolean).length
  const tel = doc.querySelector('a[href^="tel:"]')
  const faq = /faq|frequently asked/i.test(text)
  let types = []
  ld.forEach(s => { try { const j = JSON.parse(s.textContent); const arr = Array.isArray(j) ? j : j['@graph'] || [j]; arr.forEach(x => x['@type'] && types.push([].concat(x['@type']).join('/'))) } catch { types.push('INVALID JSON-LD') } })

  findings.push(title ? (title.length >= 30 && title.length <= 60 ? f('good', 'Title tag', `"${title}" (${title.length} chars)`) : f('warn', 'Title tag length', `${title.length} chars: "${title}"`, 'Keep titles 30–60 characters with service + location.')) : f('bad', 'Missing title tag', 'No <title> found', 'Add a unique title: "Emergency Plumber Parramatta | Smith Plumbing".'))
  findings.push(desc ? (desc.length >= 70 && desc.length <= 160 ? f('good', 'Meta description', `${desc.length} chars`) : f('warn', 'Meta description length', `${desc.length} chars`, 'Aim for 70–160 characters with a call to action.')) : f('bad', 'Missing meta description', 'None found', 'Write a 140-character description with service, suburb and CTA.'))
  findings.push(h1s === 1 ? f('good', 'One H1', 'Exactly one H1 heading') : f(h1s ? 'warn' : 'bad', 'H1 headings', `${h1s} H1 tags found`, 'Use exactly one H1 that names the main service and location.'))
  findings.push(noAlt === 0 ? f('good', 'Image alt text', `${imgs.length} images, all have alt text`) : f('warn', 'Images missing alt text', `${noAlt} of ${imgs.length} images`, 'Add descriptive alt text to every image.'))
  findings.push(ld.length ? (types.includes('INVALID JSON-LD') ? f('bad', 'Structured data', 'JSON-LD present but invalid', 'Fix JSON syntax — validate at validator.schema.org.') : f('good', 'Structured data', `Types: ${types.join(', ')}`)) : f('bad', 'No structured data', 'No JSON-LD schema', 'Add LocalBusiness + FAQPage schema — key for AEO.'))
  findings.push(types.some(t => /LocalBusiness|Plumber|Dentist|Electrician|Service|Organization/i.test(t)) ? f('good', 'Entity schema', 'Business entity defined') : f('warn', 'Entity schema', 'No LocalBusiness/Organization type', 'Define the business entity so AI engines can identify it.'))
  findings.push(faq ? f('good', 'FAQ / answer content', 'FAQ section detected') : f('warn', 'No FAQ section', 'No question-led content found', 'Add an FAQ with 40–60 word direct answers for AI answers.'))
  findings.push(canonical ? f('good', 'Canonical tag', canonical.getAttribute('href')) : f('warn', 'No canonical tag', '', 'Add <link rel="canonical"> to avoid duplicate URLs.'))
  findings.push(viewport ? f('good', 'Mobile viewport', 'Viewport meta present') : f('bad', 'No mobile viewport', '', 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.'))
  findings.push(tel ? f('good', 'Click-to-call', 'tel: link present') : f('warn', 'No click-to-call link', '', 'Add a tel: link — local buyers call from mobile.'))
  findings.push(words >= 300 ? f('good', 'Content depth', `${words} words`) : f('warn', 'Thin content', `${words} words`, 'Add 300+ words of useful, local, first-hand content.'))
  const pts = { good: 1, warn: 0.5, bad: 0 }
  const score = Math.round(findings.reduce((a, x) => a + pts[x.score], 0) / findings.length * 100)
  return { title: 'On-page SEO & AEO audit', score, findings, summary: `${findings.filter(x => x.score === 'good').length} checks passed, ${findings.filter(x => x.score !== 'good').length} to fix.`, plainText: text }
}

const KEYMAP = [
  { k: 'revenue', re: /revenue|income|sales|turnover/i },
  { k: 'costs', re: /total cost|expenses?|costs?/i },
  { k: 'payroll', re: /payroll|salar|wages|team/i },
  { k: 'tools', re: /tools?|software|subscription/i },
  { k: 'cash', re: /cash|balance|bank/i },
  { k: 'net', re: /net|profit/i },
]
export function analyzeSpreadsheet(sheets) {
  const found = {}
  sheets.forEach(s => s.rows.forEach(r => {
    const label = String(r[0] ?? '') + ' ' + String(r[1] ?? '')
    const nums = r.map(v => typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ''))).filter(v => !isNaN(v) && v !== 0)
    if (!nums.length) return
    KEYMAP.forEach(m => { if (m.re.test(label) && !found[m.k]) found[m.k] = { label: label.trim(), values: nums.slice(0, 60) } })
  }))
  const findings = []
  const rows = sheets.reduce((a, s) => a + s.rows.length, 0)
  findings.push(f('good', 'Sheets read', `${sheets.length} sheet(s), ${rows} rows`))
  let score = 50
  if (found.revenue) {
    const v = found.revenue.values.slice(0, 12)
    const planSlice = Y1.totalRevenue.slice(0, v.length)
    const tot = sum(v), planTot = sum(planSlice)
    const ratio = planTot ? tot / planTot : 1
    findings.push(f(ratio >= 0.95 ? 'good' : ratio >= 0.7 ? 'warn' : 'bad', 'Revenue vs Y1 plan', `"${found.revenue.label}": A$${Math.round(tot).toLocaleString()} over ${v.length} periods vs plan A$${Math.round(planTot).toLocaleString()} (${(ratio * 100).toFixed(0)}%)`, ratio < 0.95 ? 'Increase outreach volume (30 emails, 10 proposals, 5 Looms/day) and push audits → retainers.' : null))
    score += ratio >= 0.95 ? 20 : ratio >= 0.7 ? 8 : 0
  } else findings.push(f('warn', 'No revenue row detected', 'Label a row "Revenue"', 'Add a clearly labelled revenue row by month.'))
  if (found.costs) {
    const v = found.costs.values.slice(0, 12)
    const ratio = sum(v) / sum(Y1.totalCosts.slice(0, v.length))
    findings.push(f(ratio <= 1.05 ? 'good' : 'warn', 'Costs vs Y1 plan', `"${found.costs.label}": ${(ratio * 100).toFixed(0)}% of planned costs`, ratio > 1.05 ? 'Review tools (3x rule) and hiring guardrail (recurring ≥ 2× salary).' : null))
    score += ratio <= 1.05 ? 15 : 5
  } else findings.push(f('warn', 'No cost row detected', '', 'Add a "Total costs" row.'))
  if (found.payroll && found.revenue) {
    const pr = sum(found.payroll.values.slice(0, 12)) / Math.max(1, sum(found.revenue.values.slice(0, 12)))
    findings.push(f(pr <= 0.3 ? 'good' : pr <= 0.6 ? 'warn' : 'bad', 'Payroll share of revenue', `${(pr * 100).toFixed(0)}%`, pr > 0.3 ? 'Plan target: payroll below 30% of revenue from Year 3 (Y1 is higher while you build).' : null))
  }
  if (found.cash) {
    const low = Math.min(...found.cash.values)
    findings.push(f(low > 0 ? (low > 3000 ? 'good' : 'warn') : 'bad', 'Lowest cash balance', `A$${Math.round(low).toLocaleString()} (plan low A$1,142)`, low <= 3000 ? 'Keep a reserve; delay hires or asset spend if cash dips below plan.' : null))
    score += low > 0 ? 15 : 0
  }
  return { title: 'Financial sheet vs Digital Empire model', score: Math.min(100, score), findings, summary: `Detected: ${Object.keys(found).join(', ') || 'no labelled rows'}.`, found }
}

export function analyzeDocument(text) {
  const stats = textStats(text)
  const align = planAlignment(text)
  const match = bestRubricMatch(ASSIGNMENTS, text)
  const findings = []
  findings.push(f('good', 'Document read', `${stats.words.toLocaleString()} words, ${stats.sentences} sentences`))
  findings.push(f(align.pct >= 60 ? 'good' : align.pct >= 30 ? 'warn' : 'bad', 'Plan alignment', `${align.pct}% of core plan concepts: ${align.hits.filter(h => h.hit).map(h => h.concept).join(', ') || 'none'}`, align.pct < 60 ? `Missing: ${align.hits.filter(h => !h.hit).map(h => h.concept).join(', ')}` : null))
  align.flags.forEach(fl => findings.push(f('bad', 'Red flag', fl.msg, 'Remove or rewrite this part.')))
  findings.push(f(stats.avgSentence <= 22 ? 'good' : 'warn', 'Readability', `Average sentence ${stats.avgSentence.toFixed(0)} words`, stats.avgSentence > 22 ? 'Shorten sentences to under 20 words.' : null))
  findings.push(f(stats.numbers >= 3 ? 'good' : 'warn', 'Specific numbers', `${stats.numbers} figures`, stats.numbers < 3 ? 'Add prices, targets and dates.' : null))
  findings.push(f(stats.listItems >= 3 ? 'good' : 'warn', 'Scannable structure', `${stats.listItems} list items`, stats.listItems < 3 ? 'Use bullets or numbered steps.' : null))
  if (match && match.grade.score >= 35) findings.push(f(match.grade.score >= 70 ? 'good' : 'warn', `Closest assignment: ${match.assignment.title}`, `Rubric score ${match.grade.score}/100`, match.grade.mistakes[0]?.fix))
  const pts = { good: 1, warn: 0.5, bad: 0 }
  const score = Math.round(findings.reduce((a, x) => a + pts[x.score], 0) / findings.length * 100)
  return { title: 'Document review', score, findings, summary: `Plan alignment ${align.pct}%. ${align.flags.length ? align.flags.length + ' red flag(s).' : 'No red flags.'}`, match }
}

export function analyzeJSON(text) {
  try {
    const j = JSON.parse(text)
    const isLD = JSON.stringify(j).includes('schema.org')
    return { title: isLD ? 'JSON-LD schema check' : 'JSON file', score: isLD ? 85 : 70, findings: [f('good', 'Valid JSON', 'Parsed successfully'), isLD ? f('good', 'schema.org context', 'Structured data detected') : f('warn', 'Not schema.org', 'No schema.org context', null)], summary: 'JSON is valid.' }
  } catch (e) {
    return { title: 'JSON file', score: 0, findings: [f('bad', 'Invalid JSON', e.message, 'Fix syntax errors (commas, quotes, brackets).')], summary: 'JSON did not parse.' }
  }
}

export function analyzeExtracted(ex) {
  if (ex.kind === 'html') return analyzeHTML(ex.text)
  if (ex.kind === 'spreadsheet') return analyzeSpreadsheet(ex.sheets)
  if (ex.kind === 'json') return analyzeJSON(ex.text)
  if (ex.kind === 'image') return { title: 'Image', score: null, findings: [f('warn', 'Image uploaded', `${(ex.size / 1024).toFixed(0)} KB`, 'Built-in analysis cannot read images. Add a Claude API key in Settings for visual feedback (e.g. ad creatives, website screenshots, GBP listings).')], summary: 'Image preview only without AI.' }
  return analyzeDocument(ex.text)
}
