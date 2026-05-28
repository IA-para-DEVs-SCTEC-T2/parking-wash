import { useState, useCallback } from 'react'
import { getDashboard, type DashboardMetrics } from '../../api/parking'
import { getWashDashboard, type WashDashboardMetrics } from '../../api/washOrders'
import { getSettings, type ParkingSettings } from '../../api/settings'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { formatBRL } from '../../utils/pricing'
import SettingsModal from './SettingsModal'
import './Dashboard.css'

function formatDuration(minutes: number): string {
  if (minutes === 0) return '—'
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const [parking, setParking] = useState<DashboardMetrics | null>(null)
  const [wash, setWash] = useState<WashDashboardMetrics | null>(null)
  const [settings, setSettings] = useState<ParkingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [parkingData, washData, settingsData] = await Promise.all([
        getDashboard(),
        getWashDashboard(),
        getSettings(),
      ])
      setParking(parkingData)
      setWash(washData)
      setSettings(settingsData)
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

  useAutoRefresh(fetchAll, 15000)

  if (loading && !parking) {
    return <div className="dashboard"><div className="loading">Carregando métricas...</div></div>
  }

  if (error && !parking) {
    return <div className="dashboard"><div className="error-message">{error}</div></div>
  }

  if (!parking || !wash) return null

  const now = new Date()
  const todayLabel = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const totalRevenue = parking.revenueToday + wash.revenueToday
  const totalVehicles = parking.entriesTotal + wash.totalOrders

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <div className="dashboard-header-right">
          <span className="dashboard-date">{todayLabel}</span>
          <button className="settings-btn" onClick={() => setShowSettings(true)}>⚙️ Configurações</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="summary-cards">
        <div className="summary-card total-revenue">
          <span className="summary-icon">💰</span>
          <div className="summary-info">
            <span className="summary-label">Faturamento Total</span>
            <span className="summary-value">{formatBRL(totalRevenue)}</span>
          </div>
        </div>
        <div className="summary-card total-vehicles">
          <span className="summary-icon">🚗</span>
          <div className="summary-info">
            <span className="summary-label">Veículos Hoje</span>
            <span className="summary-value">{totalVehicles}</span>
          </div>
        </div>
        <div className="summary-card avg-duration">
          <span className="summary-icon">⏱️</span>
          <div className="summary-info">
            <span className="summary-label">Permanência Média</span>
            <span className="summary-value">{formatDuration(parking.avgDurationMinutes)}</span>
          </div>
        </div>
      </div>

      {/* Two-column sections */}
      <div className="dashboard-sections">
        {/* Estacionamento */}
        <div className="dashboard-section parking-section">
          <h3>🅿️ Estacionamento</h3>
          <div className="section-metrics">
            <div className="metric-row">
              <span>Entradas hoje</span>
              <strong>{parking.entriesTotal}</strong>
            </div>
            <div className="metric-row">
              <span>Saídas hoje</span>
              <strong>{parking.checkoutsToday}</strong>
            </div>
            <div className="metric-row">
              <span>Ocupação atual</span>
              <strong>{parking.currentOccupancy}/{settings?.totalSpots || 30}</strong>
            </div>
            <div className="metric-row highlight">
              <span>Faturamento</span>
              <strong>{formatBRL(parking.revenueToday)}</strong>
            </div>
            <div className="metric-row">
              <span>Permanência média</span>
              <strong>{formatDuration(parking.avgDurationMinutes)}</strong>
            </div>
          </div>

          <h4>Últimos Checkouts</h4>
          {parking.recentCheckouts.length === 0 ? (
            <p className="empty-table">Nenhum checkout hoje</p>
          ) : (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Duração</th>
                  <th>Valor</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {parking.recentCheckouts.map(r => (
                  <tr key={r.id}>
                    <td className="plate">{r.licensePlate}</td>
                    <td>{formatDuration(r.durationMinutes)}</td>
                    <td className="amount">{formatBRL(r.totalAmount)}</td>
                    <td>{formatTime(r.exitTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Lavagem */}
        <div className="dashboard-section wash-section">
          <h3>🚿 Lavagem</h3>
          <div className="section-metrics">
            <div className="metric-row">
              <span>Ordens hoje</span>
              <strong>{wash.totalOrders}</strong>
            </div>
            <div className="metric-row">
              <span>Concluídas</span>
              <strong>{wash.completedToday}</strong>
            </div>
            <div className="metric-row">
              <span>Em andamento</span>
              <strong>{wash.inProgress}</strong>
            </div>
            <div className="metric-row">
              <span>Aguardando</span>
              <strong>{wash.waiting}</strong>
            </div>
            <div className="metric-row highlight">
              <span>Faturamento</span>
              <strong>{formatBRL(wash.revenueToday)}</strong>
            </div>
          </div>

          <h4>Últimas Lavagens</h4>
          {wash.recentCompleted.length === 0 ? (
            <p className="empty-table">Nenhuma lavagem concluída hoje</p>
          ) : (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Serviço</th>
                  <th>Valor</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {wash.recentCompleted.map(r => (
                  <tr key={r.id}>
                    <td className="plate">{r.licensePlate}</td>
                    <td>{r.serviceName}</td>
                    <td className="amount">{formatBRL(r.price)}</td>
                    <td>{formatTime(r.completedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSaved={() => fetchAll()}
        />
      )}
    </div>
  )
}
