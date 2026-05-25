import { useState } from 'react'
import { WashOrder, WashOrderStatus } from '../../types/washOrders'
import { updateWashOrderStatus } from '../../api/washOrders'
import './WashOrderCard.css'

interface WashOrderCardProps {
  order: WashOrder
  onStatusUpdated: () => void
}

export default function WashOrderCard({ order, onStatusUpdated }: WashOrderCardProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getNextStatus = (): WashOrderStatus | null => {
    if (order.status === 'Waiting') return 'InProgress'
    if (order.status === 'InProgress') return 'Completed'
    return null
  }

  const getButtonLabel = (): string => {
    if (order.status === 'Waiting') return 'Iniciar'
    if (order.status === 'InProgress') return 'Concluir'
    return 'Concluído'
  }

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus()
    if (!nextStatus) return

    setLoading(true)
    setError(null)

    try {
      await updateWashOrderStatus(order.id, nextStatus)
      onStatusUpdated()
    } catch (err: unknown) {
      let errorMsg = 'Erro inesperado. Tente novamente.'
      
      if (err instanceof Error) {
        errorMsg = err.message
      } else if (err && typeof err === 'object' && 'error' in err) {
        errorMsg = (err as { error: string }).error
      }
      
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const isButtonDisabled = order.status === 'Completed' || loading

  return (
    <div className="wash-order-card">
      <div className="order-info">
        <div className="info-row">
          <strong>Placa:</strong> <span className="plate">{order.licensePlate}</span>
        </div>
        <div className="info-row">
          <strong>Serviço:</strong> {order.washService.name} - R$ {order.washService.price.toFixed(2)}
        </div>
        <div className="info-row">
          <strong>Status:</strong> <span className="status">{order.status}</span>
        </div>
        <div className="info-row">
          <strong>Criado em:</strong> {new Date(order.createdAt).toLocaleString('pt-BR')}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleStatusUpdate}
        disabled={isButtonDisabled}
        className="action-button"
      >
        {loading ? 'Atualizando...' : getButtonLabel()}
      </button>
    </div>
  )
}
