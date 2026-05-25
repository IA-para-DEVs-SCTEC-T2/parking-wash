import { useState } from 'react';
import { WashOrder, WashOrderStatus } from '../../types/washOrders';
import { updateWashOrderStatus } from '../../api/washOrders';

interface WashOrderCardProps {
  order: WashOrder;
  onStatusUpdated: () => void;
}

export function WashOrderCard({ order, onStatusUpdated }: WashOrderCardProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNextStatus = (): WashOrderStatus | null => {
    if (order.status === 'Waiting') return 'InProgress';
    if (order.status === 'InProgress') return 'Completed';
    return null;
  };

  const getButtonLabel = (): string => {
    if (order.status === 'Waiting') return 'Iniciar';
    if (order.status === 'InProgress') return 'Concluir';
    return 'Concluído';
  };

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return;

    setLoading(true);
    setError(null);

    try {
      await updateWashOrderStatus(order.id, nextStatus);
      onStatusUpdated();
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'error' in err
        ? (err as { error: string }).error
        : 'Erro inesperado. Tente novamente.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = order.status === 'Completed' || loading;

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '10px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <strong>Placa:</strong> {order.licensePlate}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Serviço:</strong> {order.washService.name} - R$ {order.washService.price.toFixed(2)}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Status:</strong> {order.status}
      </div>
      <div style={{ marginBottom: '12px' }}>
        <strong>Criado em:</strong> {new Date(order.createdAt).toLocaleString('pt-BR')}
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '0.9em' }}>{error}</div>}

      <button
        onClick={handleStatusUpdate}
        disabled={isButtonDisabled}
        style={{
          padding: '6px 12px',
          backgroundColor: isButtonDisabled ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
          fontSize: '0.9em',
        }}
      >
        {loading ? 'Atualizando...' : getButtonLabel()}
      </button>
    </div>
  );
}
