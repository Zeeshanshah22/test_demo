import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { PageHeader, Card, Tabs, Badge, Callout } from '../components/ui'
import { DonutChart, BarChart } from '../components/charts'
import { PHASES, PRICING, CHANNELS, TOOLS, BUDGET, PROFIT_FIRST, GUARDRAILS, RISKS, EXIT_OPTIONS, FX, fmtA } from '../data/plan'
import { PLAYBOOK } from '../data/curriculum'

export default function PlanLibrary() {
  const [tab, setTab] = useState('model')
  return (
    <div>
      <PageHeader icon={BookOpen} title="Plan Library" subtitle="Reference tables from the Digital Empire Business Plan: business model, offers & pricing, channels, tools, capital, risks and exit options." />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'model', label: 'Model' }, { id: 'pricing', label: 'Offers & pricing' }, { id: 'channels', label: 'Acquisition' }, { id: 'tools', label: 'Tools stack' }, { id: 'capital', label: 'Capital' }, { id: 'risks', label: 'Risks' }, { id: 'exit', label: 'Exit' }, { id: 'chapters', label: 'All chapters' }]} />
      {tab === 'model' && (
        <div className="space-y-5">
          <Card title="The flywheel: Agency → Recurring → Assets/SaaS → Authority">
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">{PHASES.map(p => <div key={p.phase} className="p-4 rounded-xl border border-line"><div className="flex justify-between"><span className="font-semibold">{p.phase}</span><Badge tone="brand">{p.years}</Badge></div><div className="text-sm mt-2">{p.engine}</div><div className="text-xs text-muted mt-1">{p.does}</div></div>)}</div>
          </Card>
          <Callout tone="info" title="Key assumptions">AUD/USD {FX.AUD_USD} · {FX.PKR_PER_AUD} PKR per A$ · tax simplified to 25% of positive profit · all projections are planning scenarios, not forecasts. Course success claims are iSkills' own marketing statements. Get advice from an accountant and a registered migration agent before acting.</Callout>
        </div>
      )}
      {tab === 'pricing' && (
        <Card title="Offers and pricing" subtitle="Price in A$ for Australian clients and in US$ for global clients">
          <div className="scroll-x"><table className="table"><thead><tr><th>Offer</th><th>Starter</th><th>Growth</th><th>Premium</th><th>Model price path</th></tr></thead><tbody>{PRICING.map(p => <tr key={p.offer}><td className="font-medium">{p.offer}</td><td>{p.starter}</td><td>{p.growth}</td><td>{p.premium}</td><td className="text-xs text-muted">{p.path}</td></tr>)}</tbody></table></div>
          <ul className="mt-4 text-sm space-y-1.5 list-disc pl-5">
            <li><b>Productise:</b> fixed scope, price, timeline and named outcome.</li>
            <li><b>Risk reversal:</b> 30-day opt-out for the first 3 months; "go-live or refund" on automation; performance bonuses, not performance-only pricing.</li>
            <li><b>Ladder:</b> audit → project → retainer → ads/AI agent upsell → annual prepay (2 months free).</li>
            <li><b>Terms:</b> 3-month minimum, then month-to-month; direct debit in advance (Stripe/GoCardless).</li>
            <li><b>Benchmarks:</b> most common SEO retainer US$501–1,000/mo; local SEO average ≈US$1,557; SMB automation setup US$1,500–5,000 + US$500–1,500/mo.</li>
          </ul>
        </Card>
      )}
      {tab === 'channels' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card title="Channel mix (share of acquisition effort)"><BarChart pct labels={CHANNELS.map(c => c.name.split(' (')[0])} datasets={[{ label: 'Y1', data: CHANNELS.map(c => c.y1), colorIndex: 0 }, { label: 'Y2', data: CHANNELS.map(c => c.y2), colorIndex: 1 }, { label: 'Y3+', data: CHANNELS.map(c => c.y3), colorIndex: 2 }]} height={300} /></Card>
          <Card title="Channel notes"><ul className="space-y-2 text-sm">{CHANNELS.map(c => <li key={c.name}><b>{c.name}:</b> <span className="text-muted">{c.note}</span></li>)}</ul>
            <h4 className="font-semibold text-sm mt-4">Ideal clients (priority order)</h4>
            <ol className="text-sm list-decimal pl-5 space-y-1 mt-1"><li>AU local services with A$500k–10m turnover (trades, dental, physio, law, accounting, real estate, cosmetic clinics)</li><li>AU/NZ SMBs with manual admin (5–50 staff; Xero/HubSpot/ServiceM8)</li><li>Agencies buying white-label AEO, links or automation</li><li>Shopify/WooCommerce stores doing A$1m+ (from Y2)</li><li>Global marketplace buyers (Years 1–2)</li></ol>
          </Card>
        </div>
      )}
      {tab === 'tools' && (
        <Card title="Year-1 essentials (≈US$486/mo ≈ A$721/mo)" subtitle="Rule: a tool stays only if it saves more than 3x its cost or is billed to a client">
          <div className="scroll-x"><table className="table"><thead><tr><th>Priority</th><th>Tool</th><th className="num">US$/mo</th><th>Why</th></tr></thead><tbody>{TOOLS.map(t => <tr key={t.name}><td><Badge tone={t.p === 'Must' ? 'brand' : 'muted'}>{t.p}</Badge></td><td className="font-medium">{t.name}</td><td className="num">{t.usd}</td><td className="text-muted">{t.why}</td></tr>)}</tbody></table></div>
          <p className="text-sm text-muted mt-3">Year 2 (≈A$18.6k/yr): Make, Lovable/Bolt, Apollo, ClickUp, Screaming Frog, Surfer/Frase, ElevenLabs, Sales Navigator, GoHighLevel, Loom, Vapi/Retell. Year 3 (≈A$37.3k/yr): Semrush Pro+, Ahrefs Standard, Clay, Slack. Year 4 (≈A$43.5k/yr): Ahrefs Brand Radar, HubSpot. Prices marked "approx — verify" should be checked before buying.</p>
        </Card>
      )}
      {tab === 'capital' && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card title="How to use your A$20,000"><DonutChart money labels={BUDGET.map(b => b.item.split(' (')[0])} data={BUDGET.map(b => b.aud)} height={260} /><div className="scroll-x mt-3"><table className="table"><tbody>{BUDGET.map(b => <tr key={b.item}><td>{b.item}</td><td className="num">{fmtA(b.aud)}</td><td className="num">{(b.aud / 200).toFixed(1)}%</td></tr>)}</tbody></table></div></Card>
          <div className="space-y-5">
            <Card title="Profit First allocation"><div className="scroll-x"><table className="table"><thead><tr><th>Account</th><th className="num">Y1</th><th className="num">Y2</th><th className="num">Y3+</th></tr></thead><tbody>{PROFIT_FIRST.map(p => <tr key={p.account}><td>{p.account}</td><td className="num">{p.y1}%</td><td className="num">{p.y2}%</td><td className="num">{p.y3}%</td></tr>)}</tbody></table></div></Card>
            <Card title="Spending guardrails"><ol className="list-decimal pl-5 space-y-1.5 text-sm">{GUARDRAILS.map(g => <li key={g}>{g}</li>)}</ol></Card>
          </div>
        </div>
      )}
      {tab === 'risks' && (
        <Card title="Risks and mitigations">
          <div className="scroll-x"><table className="table"><thead><tr><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Mitigation</th></tr></thead><tbody>{RISKS.map(r => <tr key={r.risk}><td className="font-medium">{r.risk}</td><td><Badge tone={r.l.startsWith('High') ? 'bad' : r.l.startsWith('Medium') ? 'warn' : 'muted'}>{r.l}</Badge></td><td><Badge tone={r.i === 'High' ? 'bad' : 'warn'}>{r.i}</Badge></td><td className="text-sm text-muted">{r.m}</td></tr>)}</tbody></table></div>
          <div className="mt-4"><Callout tone="warn" title="Legal, tax & visa">General information only: sole trader with ABN first, Pty Ltd at ≈A$5–8k/month; GST at A$75k; a US LLC does not reduce Australian tax for an AU resident; the 485 visa is temporary — plan your next step early. Get professional advice.</Callout></div>
        </Card>
      )}
      {tab === 'exit' && <div className="grid md:grid-cols-2 gap-5">{EXIT_OPTIONS.map(e => <Card key={e.name} title={e.name}><p className="text-sm">{e.text}</p></Card>)}</div>}
      {tab === 'chapters' && (
        <div className="grid md:grid-cols-2 gap-4">{PLAYBOOK.map((p, i) => <Card key={p.id} title={`${i + 1}. ${p.name}`}><ul className="space-y-1.5 text-sm">{p.lessons[0].points.map(pt => <li key={pt} className="flex gap-2"><span className="text-brand">•</span>{pt}</li>)}</ul></Card>)}</div>
      )}
    </div>
  )
}
