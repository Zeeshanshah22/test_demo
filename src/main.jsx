import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { StoreProvider } from './store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

const Learn = lazy(() => import('./pages/Learn'))
const ModulePage = lazy(() => import('./pages/ModulePage'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Assignments = lazy(() => import('./pages/Assignments'))
const AssignmentDetail = lazy(() => import('./pages/AssignmentDetail'))
const Analyzer = lazy(() => import('./pages/Analyzer'))
const Financials = lazy(() => import('./pages/Financials'))
const Milestones = lazy(() => import('./pages/Milestones'))
const Workflow = lazy(() => import('./pages/Workflow'))
const KPIs = lazy(() => import('./pages/KPIs'))
const Tools = lazy(() => import('./pages/Tools'))
const Performance = lazy(() => import('./pages/Performance'))
const Coach = lazy(() => import('./pages/Coach'))
const PlanLibrary = lazy(() => import('./pages/PlanLibrary'))
const Settings = lazy(() => import('./pages/Settings'))

const Loading = () => <div className="py-20 text-center text-muted text-sm">Loading…</div>

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/:id" element={<ModulePage />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="assignments/:id" element={<AssignmentDetail />} />
              <Route path="analyzer" element={<Analyzer />} />
              <Route path="financials" element={<Financials />} />
              <Route path="milestones" element={<Milestones />} />
              <Route path="workflow" element={<Workflow />} />
              <Route path="kpis" element={<KPIs />} />
              <Route path="tools" element={<Tools />} />
              <Route path="performance" element={<Performance />} />
              <Route path="coach" element={<Coach />} />
              <Route path="plan" element={<PlanLibrary />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </StoreProvider>
  </StrictMode>
)
