import { ParkingRecord } from '../../types/parking'
import './CheckoutReceiptModal.css'

interface CheckoutReceiptModalProps {
  record: ParkingRecord
  onClose: () => void
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  pix: 'PIX',
}

export default function CheckoutReceiptModal({ record, onClose }: CheckoutReceiptModalProps) {
  if (!record.exitTime || record.totalAmount === undefined) return null

  const entryTime = new Date(record.entryTime)
  const exitTime = new Date(record.exitTime)
  const paymentMethodLabel = PAYMENT_METHOD_LABELS[record.paymentMethodId || 'cash'] || record.paymentMethodId || 'Não informado'

  const formatTime = (date: Date) => date.toLocaleString('pt-BR')
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header">
          <h2>✓ Checkout Realizado com Sucesso</h2>
          <p className="receipt-subtitle">Recibo de Estacionamento</p>
        </div>

        <div className="receipt-body">
          <div className="receipt-section">
            <h3>Informações do Veículo</h3>
            <div className="receipt-row">
              <span className="label">Placa:</span>
              <span className="value">{record.licensePlate}</span>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Período de Estacionamento</h3>
            <div className="receipt-row">
              <span className="label">Entrada:</span>
              <span className="value">{formatTime(entryTime)}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Saída:</span>
              <span className="value">{formatTime(exitTime)}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Duração:</span>
              <span className="value">{formatDuration(record.durationMinutes || 0)}</span>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Valores</h3>
            <div className="receipt-row total">
              <span className="label">Total a Pagar:</span>
              <span className="value amount">R$ {record.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Pagamento</h3>
            <div className="receipt-row">
              <span className="label">Método:</span>
              <span className="value">{paymentMethodLabel}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Status:</span>
              <span className="value status-pending">Pendente</span>
            </div>
          </div>

          <div className="receipt-footer">
            <p className="receipt-note">Obrigado por usar nosso serviço de estacionamento!</p>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="button confirm-button"
            onClick={onClose}
          >
            Voltar à Lista
          </button>
        </div>
      </div>
    </div>
  )
}
