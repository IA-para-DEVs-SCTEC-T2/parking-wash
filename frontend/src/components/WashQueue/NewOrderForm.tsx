import { useState, useEffect } from 'react';
import { WashService } from '../../types/washOrders';
import { listWashServices } from '../../api/washServices';
import { createWashOrder } from '../../api/washOrders';

interface NewOrderFormProps {
  onOrderCreated: () => void;
}

const LEGACY_PLATE_REGEX = /^[A-Z]{3}-\d{4}$/;
const MERCOSUL_PLATE_REGEX = /^[A-Z]{3}\d[A-Z]\d{2}$/;

function isValidLicensePlate(plate: string): boolean {
  return LEGACY_PLATE_REGEX.test(plate) || MERCOSUL_PLATE_REGEX.test(plate);
}

export function NewOrderForm({ onOrderCreated }: NewOrderFormProps): JSX.Element {
  const [licensePlate, setLicensePlate] = useState('');
  const [washServiceId, setWashServiceId] = useState('');
  const [services, setServices] = useState<WashService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await listWashServices();
        setServices(data);
        if (data.length > 0) {
          setWashServiceId(data[0].id);
        }
      } catch (err: unknown) {
        const errorMsg = err && typeof err === 'object' && 'error' in err
          ? (err as { error: string }).error
          : 'Erro ao carregar serviços';
        setError(errorMsg);
      }
    };

    fetchServices();
  }, []);

  const isFormValid = isValidLicensePlate(licensePlate) && washServiceId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createWashOrder(licensePlate, washServiceId);
      setLicensePlate('');
      setWashServiceId(services[0]?.id || '');
      onOrderCreated();
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'error' in err
        ? (err as { error: string }).error
        : 'Erro inesperado. Tente novamente.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h3>Nova Ordem de Lavagem</h3>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="licensePlate">Placa do Veículo:</label>
        <input
          id="licensePlate"
          type="text"
          placeholder="AAA-9999 ou AAA9A99"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
          style={{ marginLeft: '10px', padding: '5px' }}
        />
        {licensePlate && !isValidLicensePlate(licensePlate) && (
          <span style={{ color: 'red', marginLeft: '10px' }}>Placa inválida</span>
        )}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="washService">Serviço de Lavagem:</label>
        <select
          id="washService"
          value={washServiceId}
          onChange={(e) => setWashServiceId(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
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
        style={{
          padding: '8px 16px',
          backgroundColor: isFormValid && !loading ? '#007bff' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isFormValid && !loading ? 'pointer' : 'not-allowed',
        }}
      >
        {loading ? 'Criando...' : 'Nova Ordem'}
      </button>
    </form>
  );
}
