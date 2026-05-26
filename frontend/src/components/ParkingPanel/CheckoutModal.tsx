import { useState, useEffect } from 'react'
import { checkOut } from '../../api/parking'
import { ParkingRecord } from '../../types/parking'
import { calculatePricing, type PricingCalculation } from '../../utils/pricing'
import PricingCalculationComponent from './PricingCalculation'
import './CheckoutModal.css'

interface CheckoutModalProps {
  record: ParkingRecord | null
  onClose: () => void
  onSuccess: () => void
}

const PAYMENT_METHODS = [
  { id: 'credit_card', label: 'Cartão de Crédito' },
  { id: 'debit_card', label: 'Cartão de Débito' },
  { id: 'cash', label: 'Dinheiro' },
  { id: 'pix', label: 'PIX' },
]

export default function CheckoutModal({ record, onClose, onSuccess }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [applyDailyRate, setApplyDailyRate] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [duration, setDuration] = useState<string>('')
  const [pricing, setPricing] = useState<PricingCalculation | null>(null)

  // Update duration and pricing every second
  useEffect(() => {
    if (!record) return

    const updateDuration = () => {
      const entry = new Date(record.entryTime)
      const now = new Date()
      const diffMs = now.getTime() - entry.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      const seconds = Math.floor((diffMs % 60000) / 1000)

      setDuration(`${hours}h ${minutes}m ${seconds}s`)

      // Calculate pricing
      const calculation = calculatePricing(record.entryTime)
      setPricing(calculation)
    }

    updateDuration()
    const interval = setInterval(updateDuration, 1000)
    return () => clearInterval(interval)
  }, [record])

  if (!record || !pricing) return null

  const handleConfirm = async () => {
    setLoading(true)
    setError('')

    try {
      await checkOut(record.id, {
        applyDailyRate,
        paymentMethodId: paymentMethod,
      })
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

  const entryTime = new Date(record.entryTime)

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
            <span className="value">{entryTime.toLocaleString('pt-BR')}</span>
          </div>
          <div className="info-row">
            <span className="label">Duração:</span>
            <span className="value">{duration}</span>
          </div>
        </div>

        <div className="tariff-section">
          <h3>Selecione a Tarifa</h3>
          <div className="tariff-options">
            <label className={`tariff-option ${!applyDailyRate ? 'selected' : ''}`}>
              <input
                type="radio"
                name="tariff"
                checked={!applyDailyRate}
                onChange={() => setApplyDailyRate(false)}
                disabled={loading}
              />
              <span className="tariff-label">Taxa Horária</span>
              <span className="tariff-value">R$ 10.00/h</span>
            </label>
            <label className={`tariff-option ${applyDailyRate ? 'selected' : ''}`}>
              <input
                type="radio"
                name="tariff"
                checked={applyDailyRate}
                onChange={() => setApplyDailyRate(true)}
                disabled={loading}
              />
              <span className="tariff-label">Taxa Diária</span>
              <span className="tariff-value">R$ 60.00/dia</span>
            </label>
          </div>
        </div>

        {/* Pricing Calculation Component */}
        <PricingCalculationComponent calculation={pricing} applyDailyRate={applyDailyRate} />

        <div className="payment-section">
          <label htmlFor="payment-method">Método de Pagamento</label>
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={loading}
            className="payment-select"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label}
              </option>
            ))}
          </select>
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
