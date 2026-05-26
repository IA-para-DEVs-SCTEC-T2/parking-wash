import { useState, useEffect } from 'react'
import { listParking, getFipeData } from '../../api/parking'
import { ParkingRecord } from '../../types/parking'
import './CurrentVehiclesPanel.css'

interface VehicleWithFipe extends ParkingRecord {
  fipeData?: {
    brand: string
    model: string
    year: number
    fuel: string
    fipeValue: number
    vehicleType: string
  }
  duration?: string
}

export default function CurrentVehiclesPanel() {
  const [vehicles, setVehicles] = useState<VehicleWithFipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculateDuration = (entryTime: string): string => {
    const entry = new Date(entryTime)
    const now = new Date()
    const diffMs = now.getTime() - entry.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) {
      return `${diffMins}m`
    }
    
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  const fetchVehicles = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await listParking('Parked')
      
      // Buscar dados do Fipe para cada veículo
      const vehiclesWithFipe = await Promise.all(
        data.map(async (vehicle) => {
          try {
            const fipeData = await getFipeData(vehicle.licensePlate)
            return {
              ...vehicle,
              fipeData,
              duration: calculateDuration(vehicle.entryTime),
            }
          } catch (err) {
            console.error(`Erro ao buscar Fipe para ${vehicle.licensePlate}:`, err)
            return {
              ...vehicle,
              duration: calculateDuration(vehicle.entryTime),
            }
          }
        })
      )
      
      setVehicles(vehiclesWithFipe)
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

  // Atualizar duração a cada segundo
  useEffect(() => {
    fetchVehicles()
    
    const durationInterval = setInterval(() => {
      setVehicles(prev => 
        prev.map(v => ({
          ...v,
          duration: calculateDuration(v.entryTime),
        }))
      )
    }, 1000)

    // Recarregar lista a cada 30 segundos
    const fetchInterval = setInterval(fetchVehicles, 30000)

    return () => {
      clearInterval(durationInterval)
      clearInterval(fetchInterval)
    }
  }, [])

  return (
    <div className="current-vehicles-panel">
      <div className="panel-header">
        <h2>🚗 Veículos Estacionados Agora</h2>
        <span className="vehicle-count">{vehicles.length}</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && vehicles.length === 0 && (
        <div className="loading">Carregando veículos...</div>
      )}

      {!loading && vehicles.length === 0 && (
        <div className="empty-state">
          <p>✨ Nenhum veículo estacionado no momento</p>
        </div>
      )}

      {vehicles.length > 0 && (
        <div className="vehicles-grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="card-content">
                <div className="card-top">
                  <div className="plate-badge">{vehicle.licensePlate}</div>
                  <div className="duration-badge">{vehicle.duration}</div>
                </div>

                {vehicle.fipeData && (
                  <div className="fipe-info">
                    <div className="fipe-row">
                      <span className="label">Marca:</span>
                      <span className="value">{vehicle.fipeData.brand}</span>
                    </div>
                    <div className="fipe-row">
                      <span className="label">Modelo:</span>
                      <span className="value">{vehicle.fipeData.model}</span>
                    </div>
                    <div className="fipe-row">
                      <span className="label">Ano:</span>
                      <span className="value">{vehicle.fipeData.year}</span>
                    </div>
                    <div className="fipe-row">
                      <span className="label">Combustível:</span>
                      <span className="value">{vehicle.fipeData.fuel}</span>
                    </div>
                    <div className="fipe-row">
                      <span className="label">Tipo:</span>
                      <span className="value">{vehicle.fipeData.vehicleType}</span>
                    </div>
                    <div className="fipe-row highlight">
                      <span className="label">Valor FIPE:</span>
                      <span className="value">
                        R$ {vehicle.fipeData.fipeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {!vehicle.fipeData && (
                  <div className="no-fipe-info">
                    <p>Dados do veículo não disponíveis</p>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <small>Entrada: {new Date(vehicle.entryTime).toLocaleTimeString('pt-BR')}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
