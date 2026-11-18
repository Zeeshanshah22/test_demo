import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend } from 'chart.js'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend)

const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim()

// Re-render charts when theme changes so colours follow light/dark tokens.
export function useThemeTick() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const mo = new MutationObserver(() => setTick(t => t + 1))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const h = () => setTick(t => t + 1)
    mq.addEventListener('change', h)
    return () => { mo.disconnect(); mq.removeEventListener('change', h) }
  }, [])
  return tick
}

export const series = (i) => css(`--series-${(i % 8) + 1}`)
export const tok = css

function base({ money, pct, stacked, legend = true, yTitle }) {
  const text = css('--muted'), grid = css('--grid')
  const fmt = (v) => money ? (Math.abs(v) >= 1000 ? `A$${(v / 1000).toFixed(Math.abs(v) >= 100000 ? 0 : 1)}k` : `A$${Math.round(v)}`) : pct ? `${Math.round(v)}%` : v
  return {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: legend, position: 'bottom', labels: { color: text, boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 14, font: { size: 11 } } },
      tooltip: {
        backgroundColor: css('--surface'), titleColor: css('--text'), bodyColor: css('--text'), borderColor: css('--border'), borderWidth: 1, padding: 10, cornerRadius: 10,
        callbacks: { label: (c) => ` ${c.dataset.label}: ${money ? 'A$' + Math.round(c.parsed.y ?? c.parsed).toLocaleString() : pct ? (c.parsed.y ?? c.parsed).toFixed(1) + '%' : (c.parsed.y ?? c.parsed).toLocaleString()}` },
      },
    },
    scales: {
      x: { stacked, grid: { display: false }, ticks: { color: text, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 8 }, border: { color: grid } },
      y: { stacked, grid: { color: grid }, border: { display: false }, ticks: { color: text, font: { size: 11 }, callback: fmt }, title: yTitle ? { display: true, text: yTitle, color: text } : undefined },
    },
  }
}

export function LineChart({ labels, datasets, money, pct, height = 260, area }) {
  useThemeTick()
  const ds = datasets.map((d, i) => {
    const c = d.color || series(d.colorIndex ?? i)
    return { borderWidth: 2, pointRadius: d.points ?? 2.5, pointHoverRadius: 5, tension: 0.3, borderColor: c, backgroundColor: area ? c + '22' : c, fill: area && i === 0, borderDash: d.dashed ? [6, 4] : undefined, spanGaps: true, ...d, color: undefined }
  })
  return <div style={{ height }}><Line data={{ labels, datasets: ds }} options={base({ money, pct })} aria-label="Line chart" role="img" /></div>
}

export function BarChart({ labels, datasets, money, pct, stacked, height = 260, horizontal, legend = true }) {
  useThemeTick()
  const ds = datasets.map((d, i) => ({ borderRadius: 4, borderSkipped: false, maxBarThickness: 34, backgroundColor: d.color || series(d.colorIndex ?? i), borderColor: css('--surface'), borderWidth: stacked ? { top: 2 } : 0, ...d, color: undefined }))
  const opts = base({ money, pct, stacked, legend: legend && datasets.length > 1 })
  if (horizontal) { opts.indexAxis = 'y'; const x = opts.scales.x; opts.scales.x = { ...opts.scales.y, grid: { color: css('--grid') } }; opts.scales.y = { ...x, ticks: { ...x.ticks, autoSkip: false } } }
  return <div style={{ height }}><Bar data={{ labels, datasets: ds }} options={opts} aria-label="Bar chart" role="img" /></div>
}

export function DonutChart({ labels, data, money, height = 230, colors }) {
  useThemeTick()
  const opts = { responsive: true, maintainAspectRatio: false, cutout: '64%', plugins: { legend: { position: 'bottom', labels: { color: css('--muted'), boxWidth: 10, usePointStyle: true, font: { size: 11 }, padding: 10 } }, tooltip: { backgroundColor: css('--surface'), titleColor: css('--text'), bodyColor: css('--text'), borderColor: css('--border'), borderWidth: 1, callbacks: { label: (c) => ` ${c.label}: ${money ? 'A$' + Math.round(c.parsed).toLocaleString() : c.parsed}` } } } }
  return <div style={{ height }}><Doughnut data={{ labels, datasets: [{ data, backgroundColor: colors || labels.map((_, i) => series(i)), borderColor: css('--surface'), borderWidth: 2 }] }} options={opts} aria-label="Donut chart" role="img" /></div>
}

export function RadarChart({ labels, datasets, height = 300 }) {
  useThemeTick()
  const text = css('--muted'), grid = css('--grid')
  const ds = datasets.map((d, i) => { const c = d.color || series(d.colorIndex ?? i); return { borderColor: c, backgroundColor: c + '26', pointBackgroundColor: c, borderWidth: 2, pointRadius: 3, borderDash: d.dashed ? [5, 4] : undefined, ...d, color: undefined } })
  const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: text, usePointStyle: true, boxWidth: 10, font: { size: 11 } } }, tooltip: { backgroundColor: css('--surface'), titleColor: css('--text'), bodyColor: css('--text'), borderColor: css('--border'), borderWidth: 1 } }, scales: { r: { min: 0, max: 100, ticks: { display: false, stepSize: 25 }, grid: { color: grid }, angleLines: { color: grid }, pointLabels: { color: text, font: { size: 11, weight: '600' } } } } }
  return <div style={{ height }}><Radar data={{ labels, datasets: ds }} options={opts} aria-label="Radar chart" role="img" /></div>
}
