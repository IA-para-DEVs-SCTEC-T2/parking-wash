import { useState, useEffect } from 'react'
import { WashService } from '../../types/washOrders'
import { listWashServices } from '../../api/washServices'
import { createWashOrder } from '../../api/washOrders'
import './NewOrderForm.css'

interface NewOrderFormProps {
  onOrderCreated: () => void
}

const LEGACY_PLATE_REGEX = /^[A-Z]{3}-\d{4}$/
const MERCOSUL_PLATE_REGEX = /^[A-Z]{3}\d[A-Z]\d{2}$/

function isValidLicensePlate(plate: string): boolean {
  return LEGACY_PLATE_REGEX.test(plate) || MERCOSUL_PLATE_REGEX.test(plate)
}

export default function NewOrderForm({ onOrderCreated }: NewOrderFormProps): JSX.Element {
  const [licensePlate, setLicensePlate] = useState('')
  const [washServiceId, setWashServiceId] = useState('')
  const [services, setServices] = useState<WashService[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await listWashServices()
        setServices(data)
        if (data.length > 0) {
          setWashServiceId(data[0].id)
        }
      } catch (err: unknown) {
        let errorMsg = 'Erro ao carregar serviços'
        
        if (err instanceof Error) {
          errorMsg = err.message
        } else if (err && typeof err === 'object' && 'error' in err) {
          errorMsg = (err as { error: string }).error
        }
        
        setError(errorMsg)
      }
    }

    fetchServices()
  }, [])

  const isFormValid = isValidLicensePlate(licensePlate) && washServiceId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await createWashOrder(licensePlate, washServiceId)
      setLicensePlate('')
      setWashServiceId(services[0]?.id || '')
      onOrderCreated()
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

  return (
    <form onSubmit={handleSubmit} className="new-order-form">
      <h2>Nova Ordem de Lavagem</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="licensePlate">Placa do Veículo</label>
        <input
          id="licensePlate"
          type="text"
          placeholder="ABC-1234 ou ABC1D23"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
        />
        {licensePlate && !isValidLicensePlate(licensePlate) && (
          <small style={{ color: '#c33' }}>Placa inválida</small>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="washService">Serviço de Lavagem</label>
        <select
          id="washService"
          value={washServiceId}
          onChange={(e) => setWashServiceId(e.target.value)}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - R$ {service.price.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={!isFormValid || loading}
        className="submit-button"
      >
        {loading ? 'Criando...' : 'Nova Ordem'}
      </button>
    </form>
  )
}
