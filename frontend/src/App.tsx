import { useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import ParkingPanel from './components/ParkingPanel/ParkingPanel'
import { WashQueue } from './components/WashQueue/WashQueue'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState<'parking' | 'wash'>('parking')

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>🅿️ ParkingWash</h1>
          <p>Sistema de Estacionamento e Lavagem de Veículos</p>
        </header>

        <nav className="app-nav">
          <button
            className={`nav-button ${activeTab === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveTab('parking')}
          >
            Estacionamento
          </button>
          <button
            className={`nav-button ${activeTab === 'wash' ? 'active' : ''}`}
            onClick={() => setActiveTab('wash')}
          >
            Fila de Lavagem
          </button>
        </nav>

        <main className="app-content">
          {activeTab === 'parking' && <ParkingPanel />}
          {activeTab === 'wash' && <WashQueue />}
        </main>
      </div>
    </ErrorBoundary>
  )
}
