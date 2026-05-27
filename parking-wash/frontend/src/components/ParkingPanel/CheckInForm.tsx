import { useState, useEffect } from 'react'
import { checkIn, getFipeData } from '../../api/parking'
import './CheckInForm.css'

interface CheckInFormProps {
  onSuccess: () => void
}

interface VehicleInfo {
  brand: string
  model: string
  year: number
  fuel: string
  fipeValue: number
  vehicleType: string
  retrievedAt: string
}

const PLATE_REGEX = /^([A-Z]{3}-\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/

export default function CheckInForm({ onSuccess }: CheckInFormProps) {
  const [plate, setPlate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fipeData, setFipeData] = useState<VehicleInfo | null>(null)
  const [fipeLoading, setFipeLoading] = useState(false)

  const isValid = PLATE_REGEX.test(plate)

  // Buscar dados do Fipe quando a placa mudar
  useEffect(() => {
    if (isValid && plate) {
      setFipeLoading(true)
      getFipeData(plate)
        .then(data => {
          setFipeData(data)
          setError('')
        })
        .catch(err => {
          console.error('Erro ao buscar dados do Fipe:', err)
          setFipeData(null)
          // Não mostrar erro, apenas continuar sem dados do Fipe
        })
        .finally(() => setFipeLoading(false))
    } else {
      setFipeData(null)
    }
  }, [plate, isValid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError('')

    try {
      await checkIn(plate)
      setPlate('')
      setFipeData(null)
      onSuccess()
    } catch (err: unknown) {
      let errorMsg = 'Erro ao fazer check-in'
      
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
    <form className="checkin-form" onSubmit={handleSubmit}>
      <h2>Check-in de Veículo</h2>

      <div className="form-group">
        <label htmlFor="plate">Placa do Veículo</label>
        <input
          id="plate"
          type="text"
          placeholder="ABC-1234 ou ABC1D23"
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          disabled={loading}
        />
        <small>Formato: ABC-1234 (legado) ou ABC1D23 (Mercosul)</small>
      </div>

      {fipeLoading && <div className="info-message">Buscando dados do veículo...</div>}

      {fipeData && (
        <div className="fipe-data">
          <h3>Informações do Veículo (FIPE)</h3>
          <div className="fipe-grid">
            <div className="fipe-item">
              <span className="label">Marca:</span>
              <span className="value">{fipeData.brand}</span>
            </div>
            <div className="fipe-item">
              <span className="label">Modelo:</span>
              <span className="value">{fipeData.model}</span>
            </div>
            <div className="fipe-item">
              <span className="label">Ano:</span>
              <span className="value">{fipeData.year}</span>
            </div>
            <div className="fipe-item">
              <span className="label">Combustível:</span>
              <span className="value">{fipeData.fuel}</span>
            </div>
            <div className="fipe-item">
              <span className="label">Tipo:</span>
              <span className="value">{fipeData.vehicleType}</span>
            </div>
            <div className="fipe-item">
              <span className="label">Valor FIPE:</span>
              <span className="value">R$ {fipeData.fipeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={!isValid || loading} className="submit-button">
        {loading ? 'Processando...' : 'Check-in'}
      </button>
    </form>
  )
}
