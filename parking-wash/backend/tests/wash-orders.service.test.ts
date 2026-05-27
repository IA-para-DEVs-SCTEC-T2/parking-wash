import { WashOrderService } from '../src/modules/wash-orders/wash-orders.service';
import { supabase } from '../src/db/supabase';
import {
  ValidationError,
  NotFoundError,
  ServiceUnavailableError,
} from '../src/middleware/errors';
import * as fc from 'fast-check';

// Mock Supabase
jest.mock('../src/db/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe('WashOrderService', () => {
  let service: WashOrderService;
  let mockSupabase: any;

  beforeEach(() => {
    service = new WashOrderService();
    mockSupabase = supabase as jest.Mocked<typeof supabase>;
    jest.clearAllMocks();
  });

  // ============================================================================
  // Arbitraries for Property-Based Testing
  // ============================================================================

  const validPlateArb = fc.oneof(
    // Legacy format: AAA-9999
    fc.tuple(
      fc.stringMatching(/^[A-Z]{3}$/),
      fc.stringMatching(/^\d{4}$/)
    ).map(([letters, digits]) => `${letters}-${digits}`),
    // Mercosul format: AAA9A99
    fc.stringMatching(/^[A-Z]{3}\d[A-Z]\d{2}$/)
  );

  const uuidArb = fc.uuid();

  const washServiceArb = fc.record({
    id: uuidArb,
    name: fc.string({ minLength: 1, maxLength: 100 }),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }),
    duration_estimate: fc.integer({ min: 0, max: 480 }),
    is_active: fc.boolean(),
  });

  const washOrderArb = fc.record({
    id: uuidArb,
    license_plate: validPlateArb,
    wash_service_id: uuidArb,
    status: fc.constantFrom('Waiting', 'InProgress', 'Completed'),
    created_at: fc.date().map(d => d.toISOString()),
    started_at: fc.oneof(
      fc.constant(null),
      fc.date().map(d => d.toISOString())
    ),
    completed_at: fc.oneof(
      fc.constant(null),
      fc.date().map(d => d.toISOString())
    ),
  });

  // ============================================================================
  // createOrder Tests
  // ============================================================================

  describe('createOrder', () => {
    it('Property 6: creates valid wash order for any valid plate and active service', async () => {
      await fc.assert(
        fc.asyncProperty(validPlateArb, uuidArb, washServiceArb, async (plate, serviceId, washSvc) => {
          // Arrange
          const activeService = { ...washSvc, is_active: true };
          const createdOrder = {
            id: fc.sample(uuidArb, 1)[0],
            license_plate: plate,
            wash_service_id: serviceId,
            status: 'Waiting',
            created_at: new Date().toISOString(),
            started_at: null,
            completed_at: null,
          };

          mockSupabase.from.mockReturnThis();
          mockSupabase.select.mockReturnThis();
          mockSupabase.eq.mockReturnThis();
          mockSupabase.single.mockResolvedValueOnce({
            data: activeService,
            error: null,
          });
          mockSupabase.insert.mockReturnThis();
          mockSupabase.single.mockResolvedValueOnce({
            data: createdOrder,
            error: null,
          });

          // Act & Assert
          const result = await service.createOrder(plate, serviceId);
          expect(result.licensePlate).toBe(plate);
          expect(result.status).toBe('Waiting');
          expect(result.createdAt).toBeDefined();
          expect(result.startedAt).toBeNull();
          expect(result.completedAt).toBeNull();
          expect(result.washService).toEqual({
            id: activeService.id,
            name: activeService.name,
            price: activeService.price,
          });
        }),
        { numRuns: 50 }
      );
    });

    it('Example: throws ValidationError when service not found', async () => {
      // Arrange
      const plate = 'ABC-1234';
      const serviceId = fc.sample(uuidArb, 1)[0];

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      // Act & Assert
      await expect(service.createOrder(plate, serviceId)).rejects.toThrow(
        'Serviço de lavagem não encontrado'
      );
    });

    it('Example: throws ValidationError when service is inactive', async () => {
      // Arrange
      const plate = 'ABC-1234';
      const serviceId = fc.sample(uuidArb, 1)[0];
      const inactiveService = {
        id: serviceId,
        name: 'Lavagem Simples',
        price: 50.0,
        duration_estimate: 30,
        is_active: false,
      };

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: inactiveService,
        error: null,
      });

      // Act & Assert
      await expect(service.createOrder(plate, serviceId)).rejects.toThrow(
        'Serviço de lavagem não está disponível'
      );
    });

    it('Example: throws ServiceUnavailableError on database error', async () => {
      // Arrange
      const plate = 'ABC-1234';
      const serviceId = fc.sample(uuidArb, 1)[0];
      const activeService = {
        id: serviceId,
        name: 'Lavagem Simples',
        price: 50.0,
        duration_estimate: 30,
        is_active: true,
      };

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValueOnce({
        data: activeService,
        error: null,
      });
      mockSupabase.insert.mockReturnThis();
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      // Act & Assert
      await expect(service.createOrder(plate, serviceId)).rejects.toThrow(
        ServiceUnavailableError
      );
    });
  });

  // ============================================================================
  // advanceStatus Tests
  // ============================================================================

  describe('advanceStatus', () => {
    it('Property 7: Waiting→InProgress transition sets started_at in ISO 8601', async () => {
      await fc.assert(
        fc.asyncProperty(validPlateArb, uuidArb, async (plate, serviceId) => {
          // Arrange
          const orderId = fc.sample(uuidArb, 1)[0];
          const currentOrder = {
            id: orderId,
            license_plate: plate,
            wash_service_id: serviceId,
            status: 'Waiting',
            created_at: new Date().toISOString(),
            started_at: null,
            completed_at: null,
          };
          const updatedOrder = {
            ...currentOrder,
            status: 'InProgress',
            started_at: new Date().toISOString(),
          };
          const washSvc = {
            id: serviceId,
            name: 'Lavagem Simples',
            price: 50.0,
            duration_estimate: 30,
            is_active: true,
          };

          mockSupabase.from.mockReturnThis();
          mockSupabase.select.mockReturnThis();
          mockSupabase.eq.mockReturnThis();
          mockSupabase.single.mockResolvedValueOnce({
            data: currentOrder,
            error: null,
          });
          mockSupabase.update.mockReturnThis();
          mockSupabase.single.mockResolvedValueOnce({
            data: updatedOrder,
            error: null,
          });
          mockSupabase.single.mockResolvedValueOnce({
            data: washSvc,
            error: null,
          });

          // Act & Assert
          const result = await service.advanceStatus(orderId, 'InProgress');
          expect(result.status).toBe('InProgress');
          expect(result.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        }),
        { numRuns: 50 }
      );
    });

    it('Property 7: InProgress→Completed transition sets completed_at in ISO 8601', async () => {
      await fc.assert(
        fc.asyncProperty(validPlateArb, uuidArb, async (plate, serviceId) => {
          // Arrange
          const orderId = fc.sample(uuidArb, 1)[0];
          const currentOrder = {
            id: orderId,
            license_plate: plate,
            wash_service_id: serviceId,
            status: 'InProgress',
            created_at: new Date().toISOString(),
            started_at: new Date().toISOString(),
            completed_at: null,
          };
          const updatedOrder = {
            ...currentOrder,
            status: 'Completed',
            completed_at: new Date().toISOString(),
          };
          const washSvc = {
            id: serviceId,
            name: 'Lavagem Simples',
            price: 50.0,
            duration_estimate: 30,
            is_active: true,
          };

          mockSupabase.from.mockReturnThis();
          mockSupabase.select.mockReturnThis();
          mockSupabase.eq.mockReturnThis();
          mockSupabase.single.mockResolvedValueOnce({
            data: currentOrder,
            error: null,
          });
          mockSupabase.update.mockReturnThis();
          mockSupabase.single.mockResolvedValueOnce({
            data: updatedOrder,
            error: null,
          });
          mockSupabase.single.mockResolvedValueOnce({
            data: washSvc,
            error: null,
          });

          // Act & Assert
          const result = await service.advanceStatus(orderId, 'Completed');
          expect(result.status).toBe('Completed');
          expect(result.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        }),
        { numRuns: 50 }
      );
    });

    it('Property 8: invalid transitions are always rejected', async () => {
      await fc.assert(
        fc.asyncProperty(validPlateArb, uuidArb, async (plate, serviceId) => {
          // Arrange
          const orderId = fc.sample(uuidArb, 1)[0];
          const currentOrder = {
            id: orderId,
            license_plate: plate,
            wash_service_id: serviceId,
            status: 'Waiting',
            created_at: new Date().toISOString(),
            started_at: null,
            completed_at: null,
          };

          mockSupabase.from.mockReturnThis();
          mockSupabase.select.mockReturnThis();
          mockSupabase.eq.mockReturnThis();
          mockSupabase.single.mockResolvedValueOnce({
            data: currentOrder,
            error: null,
          });

          // Act & Assert - Waiting → Completed is invalid
          await expect(service.advanceStatus(orderId, 'Completed')).rejects.toThrow(
            ValidationError
          );
        }),
        { numRuns: 50 }
      );
    });

    it('Example: throws NotFoundError when order not found', async () => {
      // Arrange
      const orderId = fc.sample(uuidArb, 1)[0];

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      // Act & Assert
      await expect(service.advanceStatus(orderId, 'InProgress')).rejects.toThrow(
        'Ordem de lavagem não encontrada'
      );
    });

    it('Example: throws ValidationError for Completed→InProgress transition', async () => {
      // Arrange
      const orderId = fc.sample(uuidArb, 1)[0];
      const completedOrder = {
        id: orderId,
        license_plate: 'ABC-1234',
        wash_service_id: fc.sample(uuidArb, 1)[0],
        status: 'Completed',
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.single.mockResolvedValue({
        data: completedOrder,
        error: null,
      });

      // Act & Assert
      await expect(service.advanceStatus(orderId, 'InProgress')).rejects.toThrow(
        'Transição inválida'
      );
    });
  });

  // ============================================================================
  // listOrders Tests
  // ============================================================================

  describe('listOrders', () => {
    it('Property 9: filtering by status returns only matching orders', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('Waiting', 'InProgress', 'Completed'),
          async (statusFilter: string) => {
            // Arrange
            const orders = [
              {
                id: fc.sample(uuidArb, 1)[0],
                license_plate: 'ABC-1234',
                wash_service_id: fc.sample(uuidArb, 1)[0],
                status: statusFilter,
                created_at: new Date().toISOString(),
                started_at: null,
                completed_at: null,
                wash_services: {
                  id: fc.sample(uuidArb, 1)[0],
                  name: 'Lavagem Simples',
                  price: 50.0,
                },
              },
            ];

            jest.clearAllMocks();
            // Mock the entire chain to return the result
            const mockChain = {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockResolvedValue({
                data: orders,
                error: null,
              }),
            };
            mockSupabase.from.mockReturnValue(mockChain);

            // Act & Assert
            const result = await service.listOrders(statusFilter);
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe(statusFilter);
          }
        ),
        { numRuns: 30 }
      );
    }, 60000);

    it('Example: returns all orders when no status filter provided', async () => {
      // Arrange
      const orders = [
        {
          id: fc.sample(uuidArb, 1)[0],
          license_plate: 'ABC-1234',
          wash_service_id: fc.sample(uuidArb, 1)[0],
          status: 'Waiting',
          created_at: new Date().toISOString(),
          started_at: null,
          completed_at: null,
          wash_services: {
            id: fc.sample(uuidArb, 1)[0],
            name: 'Lavagem Simples',
            price: 50.0,
          },
        },
        {
          id: fc.sample(uuidArb, 1)[0],
          license_plate: 'XYZ-5678',
          wash_service_id: fc.sample(uuidArb, 1)[0],
          status: 'InProgress',
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          completed_at: null,
          wash_services: {
            id: fc.sample(uuidArb, 1)[0],
            name: 'Lavagem Completa',
            price: 100.0,
          },
        },
      ];

      jest.clearAllMocks();
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: orders,
          error: null,
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      // Act
      const result = await service.listOrders();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('Waiting');
      expect(result[1].status).toBe('InProgress');
    }, 60000);

    it('Example: throws ValidationError for invalid status filter', async () => {
      // Act & Assert
      await expect(service.listOrders('InvalidStatus')).rejects.toThrow(
        ValidationError
      );
      await expect(service.listOrders('InvalidStatus')).rejects.toThrow(
        'Status inválido'
      );
    });

    it('Example: returns empty array when no orders match filter', async () => {
      // Arrange
      jest.clearAllMocks();
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      // Act
      const result = await service.listOrders('Waiting');

      // Assert
      expect(result).toEqual([]);
    }, 60000);

    it('Example: throws ServiceUnavailableError on database error', async () => {
      // Arrange
      jest.clearAllMocks();
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };
      mockSupabase.from.mockReturnValue(mockChain);

      // Act & Assert
      await expect(service.listOrders()).rejects.toThrow(ServiceUnavailableError);
    }, 60000);
  });
});
