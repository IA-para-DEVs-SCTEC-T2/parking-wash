/**
 * Tests for PricingService
 * Validates progressive parking fee calculations
 */

import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const hourlyRate = 10.00;
  const dailyRate = 60.00;

  describe('calculateProgressiveFee', () => {
    // RULE 1: 0-6 hours - charge by hour
    describe('Rule 1: Up to 6 hours - charge by hour', () => {
      it('should charge 1 hour for 30 minutes', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-01T10:30:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        expect(fee).toBe(10.00); // 1 hour * R$ 10
      });

      it('should charge 2 hours for 1 hour 30 minutes', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-01T11:30:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        expect(fee).toBe(20.00); // 2 hours * R$ 10
      });

      it('should charge 6 hours for exactly 6 hours', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-01T16:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        expect(fee).toBe(60.00); // 6 hours * R$ 10
      });

      it('should charge 1 hour minimum for 1 minute', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-01T10:01:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        expect(fee).toBe(10.00); // 1 hour minimum * R$ 10
      });
    });

    // RULE 2: >6 hours to 24 hours - charge 1 daily rate
    describe('Rule 2: More than 6 hours up to 24 hours - charge 1 daily rate', () => {
      it('should charge 1 daily rate for 7 hours', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-01T17:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        expect(fee).toBe(60.00); // 1 daily rate
      });

      it('should charge 1 daily rate for 12 hours', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-01T22:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        expect(fee).toBe(60.00); // 1 daily rate
      });

      it('should charge 1 daily rate for exactly 24 hours', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-02T10:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        expect(fee).toBe(60.00); // 1 daily rate
      });
    });

    // RULE 3: >24 hours - charge multiple daily rates + fractional hours
    describe('Rule 3: More than 24 hours - charge multiple daily rates + fractional hours', () => {
      it('should charge 2 daily rates for 25 hours (1 day + 1 hour)', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-02T11:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        // 1 full day (24h) = R$ 60 + 1 hour = R$ 10 = R$ 70
        expect(fee).toBe(70.00);
      });

      it('should charge 2 daily rates for 28 hours (1 day + 4 hours)', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-02T14:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        // 1 full day (24h) = R$ 60 + 4 hours = R$ 40 = R$ 100
        expect(fee).toBe(100.00);
      });

      it('should charge 2 daily rates for 31 hours (1 day + 7 hours > 6h)', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-02T17:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        // 1 full day (24h) = R$ 60 + 7 hours > 6h = 1 more daily rate = R$ 120
        expect(fee).toBe(120.00);
      });

      it('should charge 3 daily rates for 48 hours (2 days)', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-03T10:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        // 2 full days (48h) = R$ 120
        expect(fee).toBe(120.00);
      });

      it('should charge 3 daily rates for 49 hours (2 days + 1 hour)', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-03T11:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        // 2 full days (48h) = R$ 120 + 1 hour = R$ 10 = R$ 130
        expect(fee).toBe(130.00);
      });

      it('should charge 4 daily rates for 55 hours (2 days + 7 hours > 6h)', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-03T17:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        // 2 full days (48h) = R$ 120 + 7 hours > 6h = 1 more daily rate = R$ 180
        expect(fee).toBe(180.00);
      });

      it('should charge 3 daily rates for 52 hours (2 days + 4 hours ≤ 6h)', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-03T14:00:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        // 2 full days (48h) = R$ 120 + 4 hours = R$ 40 = R$ 160
        expect(fee).toBe(160.00);
      });
    });

    describe('Edge cases', () => {
      it('should handle string timestamps', () => {
        const entry = '2024-01-01T10:00:00Z';
        const exit = '2024-01-01T11:30:00Z';
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        expect(fee).toBe(20.00); // 2 hours * R$ 10
      });

      it('should format result to 2 decimal places', () => {
        const entry = new Date('2024-01-01T10:00:00Z');
        const exit = new Date('2024-01-01T10:15:00Z');
        const fee = PricingService.calculateProgressiveFee(entry, exit, hourlyRate, dailyRate);
        expect(fee).toBe(10.00);
        expect(fee.toString().split('.')[1].length).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('calculateHourlyFee', () => {
    it('should calculate hourly fee correctly', () => {
      const entry = new Date('2024-01-01T10:00:00Z');
      const exit = new Date('2024-01-01T12:30:00Z');
      const fee = PricingService.calculateHourlyFee(entry, exit, hourlyRate);
      expect(fee).toBe(30.00); // 3 hours * R$ 10
    });
  });

  describe('calculateDailyFee', () => {
    it('should return daily rate', () => {
      const fee = PricingService.calculateDailyFee(dailyRate);
      expect(fee).toBe(60.00);
    });
  });

  describe('compareRates', () => {
    it('should compare hourly vs daily rates', () => {
      const result = PricingService.compareRates(hourlyRate, dailyRate);
      expect(result.hourly24h).toBe(240.00); // 24 * R$ 10
      expect(result.dailyRate).toBe(60.00);
    });
  });

  describe('selectBestRate', () => {
    it('should select hourly rate when cheaper', () => {
      const entry = new Date('2024-01-01T10:00:00Z');
      const exit = new Date('2024-01-01T12:00:00Z');
      const result = PricingService.selectBestRate(entry, exit, hourlyRate, dailyRate, false);
      expect(result.selectedRate).toBe('hourly');
      expect(result.amount).toBe(20.00);
    });

    it('should select daily rate when forced', () => {
      const entry = new Date('2024-01-01T10:00:00Z');
      const exit = new Date('2024-01-01T12:00:00Z');
      const result = PricingService.selectBestRate(entry, exit, hourlyRate, dailyRate, true);
      expect(result.selectedRate).toBe('daily');
      expect(result.amount).toBe(60.00);
    });
  });
});
