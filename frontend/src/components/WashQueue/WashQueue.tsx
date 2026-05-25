import { useState, useCallback } from 'react';
import { WashOrder } from '../../types/washOrders';
import { listWashOrders } from '../../api/washOrders';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { NewOrderForm } from './NewOrderForm';
import { StatusColumn } from './StatusColumn';

export function WashQueue(): JSX.Element {
  const [orders, setOrders] = useState<WashOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listWashOrders();
      setOrders(data);
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'error' in err
        ? (err as { error: string }).error
        : 'Erro ao carregar ordens';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useAutoRefresh(fetchOrders, 30000);

  const handleOrderCreated = () => {
    fetchOrders();
  };

  const handleOrderUpdated = () => {
    fetchOrders();
  };

  // Group orders by status
  const waitingOrders = orders.filter((o) => o.status === 'Waiting');
  const inProgressOrders = orders.filter((o) => o.status === 'InProgress');
  const completedOrders = orders.filter((o) => o.status === 'Completed');

  return (
    <div style={{ padding: '20px' }}>
      <h1>Fila de Lavagem</h1>

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <NewOrderForm onOrderCreated={handleOrderCreated} />

      {loading && <div style={{ textAlign: 'center', color: '#666' }}>Carregando...</div>}

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <StatusColumn
          status="Waiting"
          orders={waitingOrders}
          onOrderUpdated={handleOrderUpdated}
        />
        <StatusColumn
          status="InProgress"
          orders={inProgressOrders}
          onOrderUpdated={handleOrderUpdated}
        />
        <StatusColumn
          status="Completed"
          orders={completedOrders}
          onOrderUpdated={handleOrderUpdated}
        />
      </div>
    </div>
  );
}
