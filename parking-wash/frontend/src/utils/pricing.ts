/**
 * Pricing calculation utilities for parking
 *
 * Rules:
 * 1. Up to 6 hours: charge per hour (R$ 10/h, rounded up)
 * 2. More than 6 hours in a single day: charge daily rate (R$ 60)
 * 3. Multiple days: charge full daily rates
 * 4. Remaining hours beyond full days: per hour (≤6h) or daily (>6h)
 *
 * Example: 2 days + 2 hours → 2×R$60 + 2×R$10 = R$140
 */

const DAILY_THRESHOLD_HOURS = 6
const MINUTES_PER_DAY = 1440

export interface PricingCalculation {
  durationMinutes: number
  totalHours: number
  hourlyRate: number
  dailyRate: number
  // Breakdown
  fullDays: number
  remainingHours: number
  dailyCharge: number
  hourlyCharge: number
  totalAmount: number
  description: string
  // For display
  rateType: 'hourly' | 'daily' | 'mixed'
}

/**
 * Calculate parking fee based on the defined rules
 */
export function calculatePricing(
  entryTime: string,
  hourlyRate: number = 10,
  dailyRate: number = 60
): PricingCalculation {
  const entry = new Date(entryTime)
  const now = new Date()
  const diffMs = now.getTime() - entry.getTime()
  const durationMinutes = Math.max(1, Math.floor(diffMs / 60000))
  const totalHours = Math.ceil(durationMinutes / 60)

  // Full days (24h blocks)
  const fullDays = Math.floor(durationMinutes / MINUTES_PER_DAY)
  const remainingMinutes = durationMinutes % MINUTES_PER_DAY
  const remainingHours = Math.ceil(remainingMinutes / 60)

  let dailyCharge = 0
  let hourlyCharge = 0
  let description = ''
  let rateType: 'hourly' | 'daily' | 'mixed' = 'hourly'

  if (fullDays === 0) {
    // Single day
    if (totalHours <= DAILY_THRESHOLD_HOURS) {
      // Rule 1: ≤ 6h, charge per hour
      hourlyCharge = totalHours * hourlyRate
      description = `${totalHours}h × R$ ${hourlyRate.toFixed(2)}`
      rateType = 'hourly'
    } else {
      // Rule 2: > 6h, charge daily
      dailyCharge = dailyRate
      description = `Diária (acima de ${DAILY_THRESHOLD_HOURS}h)`
      rateType = 'daily'
    }
  } else {
    // Multi-day
    dailyCharge = fullDays * dailyRate

    if (remainingHours > 0) {
      if (remainingHours <= DAILY_THRESHOLD_HOURS) {
        // Rule 4a: remaining ≤ 6h, charge per hour
        hourlyCharge = remainingHours * hourlyRate
        description = `${fullDays} diária${fullDays > 1 ? 's' : ''} + ${remainingHours}h × R$ ${hourlyRate.toFixed(2)}`
        rateType = 'mixed'
      } else {
        // Rule 4b: remaining > 6h, charge another daily
        dailyCharge += dailyRate
        description = `${fullDays + 1} diária${fullDays + 1 > 1 ? 's' : ''}`
        rateType = 'daily'
      }
    } else {
      description = `${fullDays} diária${fullDays > 1 ? 's' : ''}`
      rateType = 'daily'
    }
  }

  const totalAmount = Number((dailyCharge + hourlyCharge).toFixed(2))

  return {
    durationMinutes,
    totalHours,
    hourlyRate,
    dailyRate,
    fullDays,
    remainingHours,
    dailyCharge,
    hourlyCharge,
    totalAmount,
    description,
    rateType,
  }
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

/**
 * Format currency in BRL
 */
export function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2)}`
}
