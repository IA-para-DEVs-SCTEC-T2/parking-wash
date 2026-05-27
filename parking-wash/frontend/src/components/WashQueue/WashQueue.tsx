import { useState, useCallback } from 'react'
import { WashOrder } from '../../types/washOrders'
import { listWashOrders } from '../../api/washOrders'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { NewOrderForm } from './NewOrderForm'
import { StatusColumn } from './StatusColumn'
import './WashQueue.css'

export function WashQueue(): JSX.Element {
  const [orders, setOrders] = useState<WashOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listWashOrders()
      setOrders(data)
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

  // Auto-refresh every 30 seconds
  useAutoRefresh(fetchOrders, 30000)

  const handleOrderCreated = () => {
    fetchOrders()
  }

  const handleOrderUpdated = () => {
    fetchOrders()
  }

  // Group orders by status
  const waitingOrders = orders.filter((o) => o.status === 'Waiting')
  const inProgressOrders = orders.filter((o) => o.status === 'InProgress')
  const completedOrders = orders.filter((o) => o.status === 'Completed')

  return (
    <div className="wash-queue">
      <h1>Fila de Lavagem</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

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
    </div>
  )
}
