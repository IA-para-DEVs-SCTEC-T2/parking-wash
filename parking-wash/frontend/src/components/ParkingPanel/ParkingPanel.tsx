import { useState, useEffect } from 'react'
import { listParking } from '../../api/parking'
import { ParkingRecord } from '../../types/parking'
import CheckInForm from './CheckInForm'
import VehicleCard from './VehicleCard'
import CheckoutModal from './CheckoutModal'
import CurrentVehiclesPanel from './CurrentVehiclesPanel'
import './ParkingPanel.css'

export default function ParkingPanel() {
  const [vehicles, setVehicles] = useState<ParkingRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchVehicles = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await listParking('Parked')
      setVehicles(data)
    } catch (err: unknown) {
      let errorMsg = 'Erro ao carregar veículos'
      
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

  useEffect(() => {
    fetchVehicles()
    const interval = setInterval(fetchVehicles, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="parking-panel">
      <CheckInForm onSuccess={fetchVehicles} />

      <CurrentVehiclesPanel />

      {error && <div className="error-message">{error}</div>}

      <div className="vehicles-section">
        <h2>Veículos Estacionados ({vehicles.length})</h2>

        {loading && <div className="loading">Carregando...</div>}

        {!loading && vehicles.length === 0 && (
          <div className="empty-state">
            <p>Nenhum veículo estacionado no momento</p>
          </div>
        )}

        {!loading && vehicles.length > 0 && (
          <div className="vehicles-list">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                record={vehicle}
                onCheckout={setSelectedRecord}
              />
            ))}
          </div>
        )}
      </div>

      <CheckoutModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onSuccess={fetchVehicles}
      />
    </div>
  )
}
