import { useState } from 'react'
import { checkIn } from '../../api/parking'
import './CheckInForm.css'

interface CheckInFormProps {
  onSuccess: () => void
}

const PLATE_REGEX = /^([A-Z]{3}-\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/

export default function CheckInForm({ onSuccess }: CheckInFormProps) {
  const [plate, setPlate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = PLATE_REGEX.test(plate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError('')

    try {
      await checkIn(plate)
      setPlate('')
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

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={!isValid || loading} className="submit-button">
        {loading ? 'Processando...' : 'Check-in'}
      </button>
    </form>
  )
}
