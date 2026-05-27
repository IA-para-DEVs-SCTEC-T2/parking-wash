import { useState } from 'react'
import { checkOut } from '../../api/parking'
import { ParkingRecord } from '../../types/parking'
import './CheckoutModal.css'

interface CheckoutModalProps {
  record: ParkingRecord | null
  onClose: () => void
  onSuccess: () => void
}

export default function CheckoutModal({ record, onClose, onSuccess }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!record) return null

  const handleConfirm = async () => {
    setLoading(true)
    setError('')

    try {
      await checkOut(record.id)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      let errorMsg = 'Erro ao fazer checkout'
      
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Confirmar Checkout</h2>

        <div className="checkout-info">
          <div className="info-row">
            <span className="label">Placa:</span>
            <span className="value">{record.licensePlate}</span>
          </div>
          <div className="info-row">
            <span className="label">Entrada:</span>
            <span className="value">{new Date(record.entryTime).toLocaleString('pt-BR')}</span>
          </div>
          {record.totalAmount && (
            <div className="info-row highlight">
              <span className="label">Valor a Pagar:</span>
              <span className="value">R$ {record.totalAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-actions">
          <button
            className="button cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="button confirm-button"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
