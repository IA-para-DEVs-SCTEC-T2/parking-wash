/**
 * Pricing service for parking fee calculations
 * Handles rate selection and fee computation based on vehicle type and duration
 */

export interface RateSelection {
  amount: number;
  selectedRate: 'hourly' | 'daily';
}

export class PricingService {
  /**
   * Select the best rate for a parking session
   * @param entryTime - When the vehicle entered
   * @param exitTime - When the vehicle is leaving
   * @param hourlyRate - Hourly rate in BRL
   * @param dailyRate - Daily rate cap in BRL
   * @param preferDaily - Whether the user explicitly chose daily rate
   * @returns The calculated amount and which rate was applied
   */
  static selectBestRate(
    entryTime: Date,
    exitTime: Date,
    hourlyRate: number,
    dailyRate: number,
    preferDaily: boolean = false
  ): RateSelection {
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationMinutes = Math.max(1, Math.floor(durationMs / 60000));
    const hours = Math.ceil(durationMinutes / 60);
    const hourlyTotal = hours * hourlyRate;

    // If user explicitly chose daily rate, apply it
    if (preferDaily) {
      return { amount: dailyRate, selectedRate: 'daily' };
    }

    // Otherwise, pick the cheaper option
    if (hourlyTotal <= dailyRate) {
      return { amount: hourlyTotal, selectedRate: 'hourly' };
    }

    return { amount: dailyRate, selectedRate: 'daily' };
  }
}
