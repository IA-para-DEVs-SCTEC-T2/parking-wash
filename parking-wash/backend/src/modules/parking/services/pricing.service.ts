/**
 * Pricing service for parking fee calculations
 *
 * Rules:
 * 1. Up to 6 hours: charge per hour (rounded up)
 * 2. More than 6 hours in a single day: charge daily rate
 * 3. Multiple days: charge full daily rates
 * 4. Remaining hours beyond full days: charge per hour (if ≤ 6h) or daily (if > 6h)
 *
 * Example: 2 days + 2 hours → 2 × daily + 2 × hourly = R$120 + R$20 = R$140
 */

export interface RateSelection {
  amount: number;
  selectedRate: 'hourly' | 'daily' | 'mixed';
}

export interface PricingBreakdown {
  durationMinutes: number;
  totalHours: number;
  fullDays: number;
  remainingHours: number;
  dailyCharge: number;
  hourlyCharge: number;
  totalAmount: number;
  description: string;
}

export class PricingService {
  /** Hours threshold: above this, daily rate applies */
  private static readonly DAILY_THRESHOLD_HOURS = 6;
  /** Minutes in a day */
  private static readonly MINUTES_PER_DAY = 1440;

  /**
   * Calculate duration in minutes between entry and exit
   */
  private static calculateDurationMinutes(entry: Date | string, exit: Date | string): number {
    const entryDate = typeof entry === 'string' ? new Date(entry) : entry;
    const exitDate = typeof exit === 'string' ? new Date(exit) : exit;
    const durationMs = exitDate.getTime() - entryDate.getTime();

    if (durationMs < 0) {
      throw new Error('Hora de saída não pode ser anterior à hora de entrada');
    }

    return Math.max(1, Math.floor(durationMs / (1000 * 60)));
  }

  /**
   * Calculate the parking fee using the defined rules:
   * 1. ≤ 6h: hourly rate × hours (rounded up)
   * 2. > 6h same day: daily rate
   * 3. Multiple days: full days × daily + remainder hours
   * 4. Remainder > 6h: add another daily
   */
  static calculateFee(
    entry: Date | string,
    exit: Date | string,
    hourlyRate: number = 10,
    dailyRate: number = 60
  ): PricingBreakdown {
    if (hourlyRate < 0) throw new Error('Taxa horária não pode ser negativa');
    if (dailyRate < 0) throw new Error('Taxa diária não pode ser negativa');

    const durationMinutes = this.calculateDurationMinutes(entry, exit);
    const totalHours = Math.ceil(durationMinutes / 60);

    // Full days (24h blocks)
    const fullDays = Math.floor(durationMinutes / this.MINUTES_PER_DAY);
    const remainingMinutes = durationMinutes % this.MINUTES_PER_DAY;
    const remainingHours = Math.ceil(remainingMinutes / 60);

    let dailyCharge = 0;
    let hourlyCharge = 0;
    let description = '';

    if (fullDays === 0) {
      // Single day stay
      if (totalHours <= this.DAILY_THRESHOLD_HOURS) {
        // Rule 1: ≤ 6h, charge per hour
        hourlyCharge = totalHours * hourlyRate;
        description = `${totalHours}h × R$ ${hourlyRate.toFixed(2)}`;
      } else {
        // Rule 2: > 6h, charge daily
        dailyCharge = dailyRate;
        description = `Diária (>${this.DAILY_THRESHOLD_HOURS}h)`;
      }
    } else {
      // Multi-day stay
      // Rule 3: full days at daily rate
      dailyCharge = fullDays * dailyRate;

      if (remainingHours > 0) {
        if (remainingHours <= this.DAILY_THRESHOLD_HOURS) {
          // Rule 4a: remaining ≤ 6h, charge per hour
          hourlyCharge = remainingHours * hourlyRate;
          description = `${fullDays} diária${fullDays > 1 ? 's' : ''} + ${remainingHours}h × R$ ${hourlyRate.toFixed(2)}`;
        } else {
          // Rule 4b: remaining > 6h, charge another daily
          dailyCharge += dailyRate;
          description = `${fullDays + 1} diária${fullDays + 1 > 1 ? 's' : ''} (restante >${this.DAILY_THRESHOLD_HOURS}h)`;
        }
      } else {
        description = `${fullDays} diária${fullDays > 1 ? 's' : ''}`;
      }
    }

    const totalAmount = Number((dailyCharge + hourlyCharge).toFixed(2));

    return {
      durationMinutes,
      totalHours,
      fullDays,
      remainingHours,
      dailyCharge: Number(dailyCharge.toFixed(2)),
      hourlyCharge: Number(hourlyCharge.toFixed(2)),
      totalAmount,
      description,
    };
  }

  /**
   * Select the best rate for a parking session (backward compatible)
   * Now uses the new rule-based calculation
   */
  static selectBestRate(
    entryTime: Date | string,
    exitTime: Date | string,
    hourlyRate: number = 10,
    dailyRate: number = 60,
    _preferDaily: boolean = false
  ): RateSelection {
    const breakdown = this.calculateFee(entryTime, exitTime, hourlyRate, dailyRate);

    let selectedRate: 'hourly' | 'daily' | 'mixed';
    if (breakdown.dailyCharge > 0 && breakdown.hourlyCharge > 0) {
      selectedRate = 'mixed';
    } else if (breakdown.dailyCharge > 0) {
      selectedRate = 'daily';
    } else {
      selectedRate = 'hourly';
    }

    return {
      amount: breakdown.totalAmount,
      selectedRate,
    };
  }
}
