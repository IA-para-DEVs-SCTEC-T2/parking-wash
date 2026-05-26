import { type PricingCalculation } from '../../utils/pricing'
import { formatDuration } from '../../utils/pricing'
import './PricingCalculation.css'

interface PricingCalculationProps {
  calculation: PricingCalculation
  applyDailyRate: boolean
}

export default function PricingCalculationComponent({
  calculation,
  applyDailyRate,
}: PricingCalculationProps) {
  const selectedTotal = applyDailyRate
    ? calculation.dailyTotal
    : calculation.hourlyTotal

  return (
    <div className="pricing-calculation">
      <h3>📊 Cálculo do Valor</h3>

      <div className="calculation-details">
        <div className="detail-row">
          <span className="label">Duração:</span>
          <span className="value">
            {formatDuration(calculation.durationMinutes)}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Horas cobradas:</span>
          <span className="value">
            {calculation.hoursCharged}h (arredondado)
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Tarifa:</span>
          <span className="value">
            R$ {calculation.hourlyRate.toFixed(2)}/h
          </span>
        </div>

        <div className="detail-row highlight">
          <span className="label">Subtotal:</span>
          <span className="value">
            {calculation.hoursCharged} × R$ {calculation.hourlyRate.toFixed(2)} = R$ {calculation.hourlyTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="comparison">
        <h4>Comparação com Tarifa Diária</h4>
        <div className="comparison-row">
          <span>Taxa diária:</span>
          <span>R$ {calculation.dailyRate.toFixed(2)}</span>
        </div>
        <div className="comparison-row">
          <span>Melhor opção:</span>
          <span className="best-option">
            {calculation.isBetterOption === 'hourly' ? '✓ Taxa Horária' : '✓ Taxa Diária'}
          </span>
        </div>
      </div>

      <div className="final-total">
        <span className="label">Valor a Pagar:</span>
        <span className="value">R$ {selectedTotal.toFixed(2)}</span>
      </div>
    </div>
  )
}
