import { supabase } from '../../db/supabase';
import {
  ValidationError,
  NotFoundError,
  ServiceUnavailableError,
} from '../../middleware/errors';
import { WashOrder, WashOrderResponse, WashOrderStatus } from './wash-orders.types';

export class WashOrderService {
  /**
   * Creates a new wash order for a vehicle
   * @param licensePlate - Vehicle license plate (validated format)
   * @param washServiceId - UUID of the wash service
   * @returns Promise<WashOrderResponse> - Created order with service details
   * @throws ValidationError if service not found or inactive
   * @throws ServiceUnavailableError if database error occurs
   */
  async createOrder(
    licensePlate: string,
    washServiceId: string
  ): Promise<WashOrderResponse> {
    // Query wash_services table for the service
    const { data: service, error: serviceError } = await supabase
      .from('wash_services')
      .select('*')
      .eq('id', washServiceId)
      .single();

    if (serviceError || !service) {
      throw new ValidationError('Serviço de lavagem não encontrado');
    }

    if (!service.is_active) {
      throw new ValidationError('Serviço de lavagem não está disponível');
    }

    try {
      // Get vehicle type from parking_records
      let vehicleTypeId: string | null = null;
      const { data: parkingRecord } = await supabase
        .from('parking_records')
        .select('vehicle_type_id')
        .eq('license_plate', licensePlate)
        .eq('status', 'Parked')
        .single();

      if (parkingRecord?.vehicle_type_id) {
        vehicleTypeId = parkingRecord.vehicle_type_id;
      }

      // Insert new WashOrder
      const { data: order, error: insertError } = await supabase
        .from('wash_orders')
        .insert({
          license_plate: licensePlate,
          wash_service_id: washServiceId,
          vehicle_type_id: vehicleTypeId,
          status: 'Waiting',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError || !order) {
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      // Return formatted response
      return this.formatWashOrderResponse(order, service, null);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ServiceUnavailableError) {
        throw error;
      }
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }
  }

  /**
   * Advances the status of a wash order
   * @param id - UUID of the wash order
   * @param newStatus - New status (InProgress or Completed)
   * @returns Promise<WashOrderResponse> - Updated order
   * @throws NotFoundError if order not found
   * @throws ValidationError if transition is invalid
   * @throws ServiceUnavailableError if database error occurs
   */
  async advanceStatus(id: string, newStatus: WashOrderStatus): Promise<WashOrderResponse> {
    // Query for the order
    const { data: order, error: queryError } = await supabase
      .from('wash_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (queryError || !order) {
      throw new NotFoundError('Ordem de lavagem não encontrada');
    }

    const currentStatus = order.status as WashOrderStatus;

    // Validate transition
    const validTransitions: Record<WashOrderStatus, WashOrderStatus[]> = {
      Waiting: ['InProgress'],
      InProgress: ['Completed'],
      Completed: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new ValidationError(
        `Transição inválida: ${currentStatus} → ${newStatus}. Permitido: Waiting→InProgress→Completed`
      );
    }

    try {
      // Prepare update data
      const updateData: Partial<WashOrder> = {
        status: newStatus,
      };

      if (newStatus === 'InProgress') {
        updateData.started_at = new Date().toISOString();
      } else if (newStatus === 'Completed') {
        updateData.completed_at = new Date().toISOString();
      }

      // Update the order
      const { data: updatedOrder, error: updateError } = await supabase
        .from('wash_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError || !updatedOrder) {
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      // Fetch the service details for the response
      const { data: service, error: serviceError } = await supabase
        .from('wash_services')
        .select('*')
        .eq('id', updatedOrder.wash_service_id)
        .single();

      if (serviceError || !service) {
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      // Fetch vehicle type if available
      let vehicleType = null;
      if (updatedOrder.vehicle_type_id) {
        const { data: vt } = await supabase
          .from('vehicle_types')
          .select('id, name, code')
          .eq('id', updatedOrder.vehicle_type_id)
          .single();
        vehicleType = vt;
      }

      return this.formatWashOrderResponse(updatedOrder, service, vehicleType);
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ServiceUnavailableError
      ) {
        throw error;
      }
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }
  }

  /**
   * Lists wash orders, optionally filtered by status
   * @param status - Optional status filter (Waiting, InProgress, or Completed)
   * @returns Promise<WashOrderResponse[]> - Array of orders with service details
   * @throws ValidationError if status is invalid
   * @throws ServiceUnavailableError if database error occurs
   */
  async listOrders(status?: string): Promise<WashOrderResponse[]> {
    // Validate status if provided
    if (status) {
      const validStatuses = ['Waiting', 'InProgress', 'Completed'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(
          'Status inválido. Valores aceitos: Waiting, InProgress, Completed'
        );
      }
    }

    try {
      // Build query - start with from and select
      let query: any = supabase
        .from('wash_orders')
        .select(
          `
          *,
          wash_services:wash_service_id (id, name, price),
          vehicle_types:vehicle_type_id (id, name, code)
        `
        );

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Apply ordering
      query = query.order('created_at', { ascending: true });

      const { data: orders, error } = await query;

      if (error) {
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      // Format and return responses
      return (orders || []).map((order: any) =>
        this.formatWashOrderResponseFromJoin(order)
      );
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ServiceUnavailableError) {
        throw error;
      }
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }
  }

  /**
   * Formats a WashOrder and WashService into WashOrderResponse
   * @private
   */
  private formatWashOrderResponse(
    order: WashOrder,
    service: any,
    vehicleType?: any
  ): WashOrderResponse {
    const response: WashOrderResponse = {
      id: order.id,
      licensePlate: order.license_plate,
      washService: {
        id: service.id,
        name: service.name,
        price: service.price,
      },
      status: order.status,
      createdAt: order.created_at,
      startedAt: order.started_at,
      completedAt: order.completed_at,
    };

    if (vehicleType) {
      response.vehicleType = {
        id: vehicleType.id,
        name: vehicleType.name,
        code: vehicleType.code,
      };
    }

    return response;
  }

  /**
   * Formats a WashOrder with joined WashService data into WashOrderResponse
   * @private
   */
  private formatWashOrderResponseFromJoin(order: any): WashOrderResponse {
    const service = Array.isArray(order.wash_services)
      ? order.wash_services[0]
      : order.wash_services;

    const response: WashOrderResponse = {
      id: order.id,
      licensePlate: order.license_plate,
      washService: {
        id: service.id,
        name: service.name,
        price: service.price,
      },
      status: order.status,
      createdAt: order.created_at,
      startedAt: order.started_at,
      completedAt: order.completed_at,
    };

    // Add vehicle type if available
    if (order.vehicle_types) {
      const vehicleType = Array.isArray(order.vehicle_types)
        ? order.vehicle_types[0]
        : order.vehicle_types;
      response.vehicleType = {
        id: vehicleType.id,
        name: vehicleType.name,
        code: vehicleType.code,
      };
    }

    return response;
  }
}
