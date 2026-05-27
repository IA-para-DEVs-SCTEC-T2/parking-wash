import { useState, useCallback } from 'react'
import { WashOrder } from '../../types/washOrders'
import { listWashOrders, listWashOrdersHistory } from '../../api/washOrders'
import { getSettings } from '../../api/settings'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { NewOrderForm } from './NewOrderForm'
import { StatusColumn } from './StatusColumn'
import OccupancyBar from '../Dashboard/OccupancyBar'
import './WashQueue.css'

export function WashQueue(): JSX.Element {
  const [orders, setOrders] = useState<WashOrder[]>([])
  const [historyOrders, setHistoryOrders] = useState<WashOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [searchPlate, setSearchPlate] = useState('')
  const [washSpots, setWashSpots] = useState(5)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [data, settings] = await Promise.all([
        listWashOrders(),
        getSettings(),
      ])
      setOrders(data)
      setWashSpots(settings.washSpots)
    } catch (err: unknown) {
      let errorMsg = 'Erro ao carregar ordens'
      
      if (err instanceof Error) {
        errorMsg = err.message
      } else if (err && typeof err === 'object' && 'error' in err) {
        errorMsg = (err as { error: string }).error
      }
      
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      const data = await listWashOrdersHistory(50)
      setHistoryOrders(data)
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
    }
  }, [])

  // Auto-refresh every 30 seconds
  useAutoRefresh(fetchOrders, 30000)

  const handleOrderCreated = () => {
    fetchOrders()
  }

  const handleOrderUpdated = () => {
    fetchOrders()
  }

  const handleToggleHistory = () => {
    if (!showHistory) {
      fetchHistory()
    }
    setShowHistory(!showHistory)
  }

  // Group orders by status
  const waitingOrders = orders.filter((o) => o.status === 'Waiting')
  const inProgressOrders = orders.filter((o) => o.status === 'InProgress')
  const completedOrders = orders.filter((o) => o.status === 'Completed')

  return (
    <div className="wash-queue">
      <div className="wash-queue-header">
        <h1>Fila de Lavagem</h1>
        <button
          className={`history-toggle-btn ${showHistory ? 'active' : ''}`}
          onClick={handleToggleHistory}
        >
          {showHistory ? '← Voltar à Fila' : '📋 Histórico'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!showHistory && (
        <OccupancyBar
          occupied={waitingOrders.length + inProgressOrders.length}
          total={washSpots}
        />
      )}

      {!showHistory ? (
        <>
          <NewOrderForm onOrderCreated={handleOrderCreated} />

          {loading && <div className="loading">Carregando...</div>}

          <div className="status-columns">
            <StatusColumn
              status="Waiting"
              orders={waitingOrders}
              onOrderUpdated={handleOrderUpdated}
            />
            <StatusColumn
              status="InProgress"
              orders={inProgressOrders}
              onOrderUpdated={handleOrderUpdated}
            />
            <StatusColumn
              status="Completed"
              orders={completedOrders}
              onOrderUpdated={handleOrderUpdated}
            />
          </div>
        </>
      ) : (
        <div className="wash-history">
          <h2>Histórico de Lavagens Concluídas</h2>
          <p className="history-subtitle">Últimas 50 lavagens realizadas (todos os dias)</p>

          <div className="history-search">
            <input
              type="text"
              placeholder="🔍 Buscar por placa (ex: ABC-1234)"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              className="search-input"
            />
            {searchPlate && (
              <button className="clear-search-btn" onClick={() => setSearchPlate('')}>✕</button>
            )}
          </div>
          
          {(() => {
            const filtered = searchPlate
              ? historyOrders.filter((o) =>
                  o.licensePlate.replace(/-/g, '').includes(searchPlate.replace(/-/g, ''))
                )
              : historyOrders;

            if (filtered.length === 0) {
              return (
                <div className="empty-history">
                  {searchPlate
                    ? `Nenhuma lavagem encontrada para a placa "${searchPlate}".`
                    : 'Nenhuma lavagem concluída encontrada.'}
                </div>
              );
            }

            return (
              <>
                {searchPlate && (
                  <p className="search-results-count">
                    {filtered.length} resultado{filtered.length > 1 ? 's' : ''} encontrado{filtered.length > 1 ? 's' : ''}
                  </p>
                )}
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Serviço</th>
                      <th>Tipo Veículo</th>
                      <th>Criado em</th>
                      <th>Concluído em</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id}>
                        <td className="plate-cell">{order.licensePlate}</td>
                        <td>{order.washService.name}</td>
                        <td>{order.vehicleType?.name || '—'}</td>
                        <td>{new Date(order.createdAt).toLocaleString('pt-BR')}</td>
                        <td>{order.completedAt ? new Date(order.completedAt).toLocaleString('pt-BR') : '—'}</td>
                        <td className="price-cell">R$ {order.washService.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            );
          })()}
        </div>
      )}
    </div>
  )
}
