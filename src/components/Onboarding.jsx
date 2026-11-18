import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket } from 'lucide-react'
import { useStore } from '../store'
import { Field } from './ui'

const NICHES = ['Plumbers', 'Electricians', 'Builders', 'Solar / HVAC', 'Dentists', 'Physio & allied health', 'Lawyers', 'Accountants', 'Real estate agents', 'Cosmetic clinics', 'Other']

export default function Onboarding() {
  const { state, update, addXP } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [p, setP] = useState({ ...state.profile })
  const set = (k, v) => setP(x => ({ ...x, [k]: v }))

  const finish = (go) => {
    update(s => { s.profile = { ...p, onboarded: true } })
    addXP(50, 'Profile set up')
    if (go) nav('/quiz?mode=placement')
  }

  return (
    <div className="fixed inset-0 z-[70] bg-navy/80 backdrop-blur-sm grid place-items-center p-4">
      <div className="card w-full max-w-lg overflow-hidden fade-in">
        <div className="hero-grad p-6">
          <div className="flex items-center gap-2 text-accent font-semibold text-sm"><Rocket size={16} />Welcome to Digital Empire Academy</div>
          <h2 className="text-2xl font-bold mt-2">Let's set up your empire</h2>
          <p className="text-white/80 text-sm mt-1">Your answers tailor quizzes, targets and feedback to the Digital Empire business plan and financial model.</p>
          <div className="flex gap-1.5 mt-4">{[0, 1, 2].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-white/20'}`} />)}</div>
        </div>
        <div className="p-6 space-y-4">
          {step === 0 && <>
            <Field label="Your name"><input className="input" value={p.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Alex" /></Field>
            <Field label="Business start date (Day 1 of the plan)" hint="Milestones and the Year-1 model are timed from this date."><input type="date" className="input" value={p.startDate} onChange={e => set('startDate', e.target.value)} /></Field>
            <Field label="Current skill level">
              <select className="input" value={p.experience} onChange={e => set('experience', e.target.value)}>
                <option value="beginner">Beginner — new to SEO/automation</option>
                <option value="intermediate">Intermediate — some SEBT modules done</option>
                <option value="advanced">Advanced — already delivering for clients</option>
              </select>
            </Field>
          </>}
          {step === 1 && <>
            <Field label="Target niche (plan: Australian local services)">
              <select className="input" value={p.niche} onChange={e => set('niche', e.target.value)}>
                <option value="">Choose…</option>{NICHES.map(n => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Target city"><input className="input" value={p.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Parramatta, Sydney" /></Field>
            <Field label="Study / work hours per day"><input type="number" min="1" max="12" className="input" value={p.hoursPerDay} onChange={e => set('hoursPerDay', Number(e.target.value))} /></Field>
          </>}
          {step === 2 && <>
            <Field label="Scenario you are planning for">
              <select className="input" value={p.scenario} onChange={e => set('scenario', e.target.value)}>
                <option value="conservative">Conservative — A$27.8k Year-1 revenue</option>
                <option value="base">Base — A$55.0k Year-1 revenue</option>
                <option value="aggressive">Aggressive — A$88.9k Year-1 revenue</option>
              </select>
            </Field>
            <Field label="Your main goal"><input className="input" value={p.goal} onChange={e => set('goal', e.target.value)} /></Field>
            <p className="text-sm text-muted">Next, take a 12-question placement test so the app can find your level and weak topics.</p>
          </>}
          <div className="flex justify-between gap-2 pt-2">
            {step > 0 ? <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button> : <button className="btn btn-ghost" onClick={() => finish(false)}>Skip</button>}
            {step < 2 ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue</button> : (
              <div className="flex gap-2"><button className="btn btn-ghost" onClick={() => finish(false)}>Later</button><button className="btn btn-accent" onClick={() => finish(true)}>Start placement test</button></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
