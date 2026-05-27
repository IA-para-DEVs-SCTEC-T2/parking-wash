import { useState, useEffect } from 'react'
import { checkOut } from '../../api/parking'
import { ParkingRecord } from '../../types/parking'
import { calculatePricing, type PricingCalculation } from '../../utils/pricing'
import PricingCalculationComponent from './PricingCalculation'
import CheckoutReceipt from './CheckoutReceipt'
import './CheckoutModal.css'

interface CheckoutModalProps {
  record: ParkingRecord | null
  onClose: () => void
  onSuccess: () => void
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

const PAYMENT_METHODS = [
  { id: 'credit_card', label: 'Cartão de Crédito' },
  { id: 'debit_card', label: 'Cartão de Débito' },
  { id: 'cash', label: 'Dinheiro' },
  { id: 'pix', label: 'PIX' },
]

interface ReceiptInfo {
  licensePlate: string
  entryTime: string
  exitTime: string
  durationMinutes: number
  totalAmount: number
  paymentMethod: string
  rateDescription: string
}

export default function CheckoutModal({ record, onClose, onSuccess, onToast }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [duration, setDuration] = useState<string>('')
  const [pricing, setPricing] = useState<PricingCalculation | null>(null)
  const [receipt, setReceipt] = useState<ReceiptInfo | null>(null)

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

      // Calculate pricing with new rules
      const calculation = calculatePricing(record.entryTime)
      setPricing(calculation)
    }

    updateDuration()
    const interval = setInterval(updateDuration, 1000)
    return () => clearInterval(interval)
  }, [record])

  if (!record || !pricing) return null

  // Show receipt after successful checkout
  if (receipt) {
    return (
      <CheckoutReceipt
        data={receipt}
        onClose={() => {
          setReceipt(null)
          onClose()
        }}
      />
    )
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await checkOut(record.id, {
        applyDailyRate: pricing.rateType === 'daily' || pricing.rateType === 'mixed',
        paymentMethodId: paymentMethod,
      })

      // Show toast
      onToast?.(`Checkout de ${record.licensePlate} realizado! Valor: R$ ${(result.totalAmount || 0).toFixed(2)}`, 'success')

      // Show receipt
      setReceipt({
        licensePlate: record.licensePlate,
        entryTime: record.entryTime,
        exitTime: result.exitTime || new Date().toISOString(),
        durationMinutes: result.durationMinutes || 0,
        totalAmount: result.totalAmount || 0,
        paymentMethod,
        rateDescription: pricing.description,
      })

      onSuccess()
    } catch (err: unknown) {
      let errorMsg = 'Erro ao fazer checkout'

      if (err instanceof Error) {
        errorMsg = err.message
      } else if (err && typeof err === 'object' && 'error' in err) {
        errorMsg = (err as { error: string }).error
      }

      setError(errorMsg)
      onToast?.(errorMsg, 'error')
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

        {/* Pricing Calculation - automatic rules */}
        <PricingCalculationComponent calculation={pricing} />

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
            {loading ? 'Processando...' : `Pagar R$ ${pricing.totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
