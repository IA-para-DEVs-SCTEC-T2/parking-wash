/**
 * Tests for VehicleTypeService
 * Tests listActive(), getById(), and updateRates() methods
 */

// Mock Supabase BEFORE importing the service
jest.mock('../src/db/supabase', () => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  return {
    supabase: {
      from: jest.fn().mockReturnValue(mockChain),
    },
  };
});

import { VehicleTypeService } from '../src/modules/vehicle-types/vehicle-type.service';
import { supabase } from '../src/db/supabase';
import {
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
} from '../src/middleware/errors';

describe('VehicleTypeService', () => {
  let vehicleTypeService: VehicleTypeService;

  beforeEach(() => {
    jest.clearAllMocks();
    vehicleTypeService = new VehicleTypeService();
  });

  // ========================================================================
  // listActive Tests
  // ========================================================================

  describe('listActive', () => {
    it('should return array of active vehicle types', async () => {
      const mockVehicleTypes = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Motorcycle',
          code: 'MOTO',
          hourly_rate: 5.0,
          daily_rate: 30.0,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Car',
          code: 'CAR',
          hourly_rate: 10.0,
          daily_rate: 60.0,
        },
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockVehicleTypes,
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await vehicleTypeService.listActive();

      expect(result).toEqual(mockVehicleTypes);
      expect(result.length).toBe(2);
      expect(supabase.from).toHaveBeenCalledWith('vehicle_types');
      expect(mockChain.select).toHaveBeenCalledWith(
        'id, name, code, hourly_rate, daily_rate'
      );
      expect(mockChain.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('should return empty array when no active vehicle types exist', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await vehicleTypeService.listActive();

      expect(result).toEqual([]);
    });

    it('should throw ServiceUnavailableError on database error', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST500', message: 'Internal server error' },
        }),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(vehicleTypeService.listActive()).rejects.toThrow(
        ServiceUnavailableError
      );
    });
  });

  // ========================================================================
  // getById Tests
  // ========================================================================

  describe('getById', () => {
    it('should return vehicle type by id', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';
      const mockVehicleType = {
        id: vehicleTypeId,
        name: 'Car',
        code: 'CAR',
        hourly_rate: 10.0,
        daily_rate: 60.0,
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockVehicleType,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await vehicleTypeService.getById(vehicleTypeId);

      expect(result).toEqual(mockVehicleType);
      expect(supabase.from).toHaveBeenCalledWith('vehicle_types');
      expect(mockChain.select).toHaveBeenCalledWith(
        'id, name, code, hourly_rate, daily_rate'
      );
      expect(mockChain.eq).toHaveBeenCalledWith('id', vehicleTypeId);
    });

    it('should throw NotFoundError when vehicle type does not exist', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(vehicleTypeService.getById(vehicleTypeId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw ServiceUnavailableError on database error', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST500', message: 'Internal server error' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(vehicleTypeService.getById(vehicleTypeId)).rejects.toThrow(
        ServiceUnavailableError
      );
    });
  });

  // ========================================================================
  // updateRates Tests
  // ========================================================================

  describe('updateRates', () => {
    it('should update rates with valid values', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';
      const newHourlyRate = 12.5;
      const newDailyRate = 75.0;

      const mockUpdatedVehicleType = {
        id: vehicleTypeId,
        name: 'Car',
        code: 'CAR',
        hourly_rate: newHourlyRate,
        daily_rate: newDailyRate,
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedVehicleType,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await vehicleTypeService.updateRates(
        vehicleTypeId,
        newHourlyRate,
        newDailyRate
      );

      expect(result).toEqual(mockUpdatedVehicleType);
      expect(supabase.from).toHaveBeenCalledWith('vehicle_types');
      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          hourly_rate: newHourlyRate,
          daily_rate: newDailyRate,
        })
      );
      expect(mockChain.eq).toHaveBeenCalledWith('id', vehicleTypeId);
    });

    it('should reject hourly_rate < 0.01', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(
        vehicleTypeService.updateRates(vehicleTypeId, 0.009, 30.0)
      ).rejects.toThrow(ValidationError);
    });

    it('should reject daily_rate < 0.01', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(
        vehicleTypeService.updateRates(vehicleTypeId, 10.0, 0.005)
      ).rejects.toThrow(ValidationError);
    });

    it('should reject both rates < 0.01', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(
        vehicleTypeService.updateRates(vehicleTypeId, 0.0, 0.0)
      ).rejects.toThrow(ValidationError);
    });

    it('should accept hourly_rate = 0.01 (minimum valid)', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';
      const mockUpdatedVehicleType = {
        id: vehicleTypeId,
        name: 'Car',
        code: 'CAR',
        hourly_rate: 0.01,
        daily_rate: 0.01,
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedVehicleType,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      const result = await vehicleTypeService.updateRates(
        vehicleTypeId,
        0.01,
        0.01
      );

      expect(result).toEqual(mockUpdatedVehicleType);
    });

    it('should throw NotFoundError when vehicle type does not exist', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(
        vehicleTypeService.updateRates(vehicleTypeId, 10.0, 60.0)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ServiceUnavailableError on database error', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST500', message: 'Internal server error' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(
        vehicleTypeService.updateRates(vehicleTypeId, 10.0, 60.0)
      ).rejects.toThrow(ServiceUnavailableError);
    });

    it('should update updated_at timestamp', async () => {
      const vehicleTypeId = '550e8400-e29b-41d4-a716-446655440000';
      const mockUpdatedVehicleType = {
        id: vehicleTypeId,
        name: 'Car',
        code: 'CAR',
        hourly_rate: 12.5,
        daily_rate: 75.0,
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedVehicleType,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await vehicleTypeService.updateRates(vehicleTypeId, 12.5, 75.0);

      // Verify that update was called with updated_at
      const updateCall = mockChain.update.mock.calls[0][0];
      expect(updateCall).toHaveProperty('updated_at');
      expect(typeof updateCall.updated_at).toBe('string');
    });
  });
});
