import { WashOrder, WashOrderStatus } from '../../types/washOrders';
import { WashOrderCard } from './WashOrderCard';

interface StatusColumnProps {
  status: WashOrderStatus;
  orders: WashOrder[];
  onOrderUpdated: () => void;
}

const STATUS_LABELS: Record<WashOrderStatus, string> = {
  Waiting: 'Aguardando',
  InProgress: 'Em Progresso',
  Completed: 'Concluído',
};

const STATUS_COLORS: Record<WashOrderStatus, string> = {
  Waiting: '#ffc107',
  InProgress: '#17a2b8',
  Completed: '#28a745',
};

export function StatusColumn({ status, orders, onOrderUpdated }: StatusColumnProps): JSX.Element {
  return (
    <div
      style={{
        flex: 1,
        minWidth: '300px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        marginRight: '15px',
      }}
    >
      <h3
        style={{
          backgroundColor: STATUS_COLORS[status],
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          marginTop: 0,
          marginBottom: '15px',
        }}
      >
        {STATUS_LABELS[status]} ({orders.length})
      </h3>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          Nenhuma ordem
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <WashOrderCard
              key={order.id}
              order={order}
              onStatusUpdated={onOrderUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
