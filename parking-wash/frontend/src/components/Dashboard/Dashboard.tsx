import { useState, useCallback } from 'react'
import { getDashboard, type DashboardMetrics } from '../../api/parking'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { formatBRL } from '../../utils/pricing'
import './Dashboard.css'

function formatDuration(minutes: number): string {
  if (minutes === 0) return '—'
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await getDashboard()
      setMetrics(data)
      setError('')
    } catch (err: unknown) {
      let errorMsg = 'Erro ao carregar métricas'
      if (err instanceof Error) errorMsg = err.message
      else if (err && typeof err === 'object' && 'error' in err) {
        errorMsg = (err as { error: string }).error
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-refresh every 15 seconds
  useAutoRefresh(fetchMetrics, 15000)

  if (loading && !metrics) {
    return <div className="dashboard"><div className="loading">Carregando métricas...</div></div>
  }

  if (error && !metrics) {
    return <div className="dashboard"><div className="error-message">{error}</div></div>
  }

  if (!metrics) return null

  const now = new Date()
  const todayLabel = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <span className="dashboard-date">{todayLabel}</span>
      </div>

      <div className="metrics-grid">
        {/* Faturamento */}
        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <span className="metric-label">Faturamento Hoje</span>
            <span className="metric-value">{formatBRL(metrics.revenueToday)}</span>
          </div>
        </div>

        {/* Veículos atendidos */}
        <div className="metric-card checkouts">
          <div className="metric-icon">🚗</div>
          <div className="metric-content">
            <span className="metric-label">Checkouts Hoje</span>
            <span className="metric-value">{metrics.checkoutsToday}</span>
          </div>
        </div>

        {/* Entradas hoje */}
        <div className="metric-card entries">
          <div className="metric-icon">🅿️</div>
          <div className="metric-content">
            <span className="metric-label">Entradas Hoje</span>
            <span className="metric-value">{metrics.entriesTotal}</span>
          </div>
        </div>

        {/* Ocupação atual */}
        <div className="metric-card occupancy">
          <div className="metric-icon">📍</div>
          <div className="metric-content">
            <span className="metric-label">Ocupação Atual</span>
            <span className="metric-value">{metrics.currentOccupancy} veículos</span>
          </div>
        </div>

        {/* Média de permanência */}
        <div className="metric-card duration">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <span className="metric-label">Permanência Média</span>
            <span className="metric-value">{formatDuration(metrics.avgDurationMinutes)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
