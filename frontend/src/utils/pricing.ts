/**
 * Pricing calculation utilities
 * Handles all pricing calculations for parking
 */

export interface PricingCalculation {
  durationMinutes: number
  hoursCharged: number
  hourlyRate: number
  dailyRate: number
  hourlyTotal: number
  dailyTotal: number
  selectedRate: 'hourly' | 'daily'
  selectedTotal: number
  isBetterOption: 'hourly' | 'daily'
}

/**
 * Calculate pricing based on entry time and rates
 * @param entryTime - ISO 8601 timestamp of entry
 * @param hourlyRate - Hourly rate in Brazilian Real (default: 10)
 * @param dailyRate - Daily rate in Brazilian Real (default: 60)
 * @returns Pricing calculation object
 */
export function calculatePricing(
  entryTime: string,
  hourlyRate: number = 10,
  dailyRate: number = 60
): PricingCalculation {
  const entry = new Date(entryTime)
  const now = new Date()
  const diffMs = now.getTime() - entry.getTime()
  const durationMinutes = Math.floor(diffMs / 60000)

  // Round up to next hour
  const hoursCharged = Math.ceil(durationMinutes / 60)

  // Calculate totals
  const hourlyTotal = hoursCharged * hourlyRate
  const dailyTotal = dailyRate

  // Determine better option
  const isBetterOption = hourlyTotal <= dailyTotal ? 'hourly' : 'daily'

  // Selected rate (default: better option)
  const selectedRate = isBetterOption
  const selectedTotal = selectedRate === 'hourly' ? hourlyTotal : dailyTotal

  return {
    durationMinutes,
    hoursCharged,
    hourlyRate,
    dailyRate,
    hourlyTotal,
    dailyTotal,
    selectedRate,
    selectedTotal,
    isBetterOption,
  }
}

/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "2h 15m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

/**
 * Format duration with seconds
 * @param minutes - Duration in minutes
 * @param seconds - Duration in seconds (0-59)
 * @returns Formatted string (e.g., "2h 15m 30s")
 */
export function formatDurationWithSeconds(minutes: number, seconds: number = 0): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m ${seconds}s`
}

/**
 * Get pricing message based on calculation
 * @param calculation - Pricing calculation object
 * @returns Human-readable message
 */
export function getPricingMessage(calculation: PricingCalculation): string {
  const { hoursCharged, hourlyRate, hourlyTotal, dailyTotal, isBetterOption } = calculation

  const hourlyMsg = `${hoursCharged}h × R$ ${hourlyRate.toFixed(2)} = R$ ${hourlyTotal.toFixed(2)}`
  const dailyMsg = `R$ ${dailyTotal.toFixed(2)}`

  if (isBetterOption === 'hourly') {
    return `${hourlyMsg} (melhor que diária: ${dailyMsg})`
  } else {
    return `${dailyMsg} (melhor que horária: ${hourlyMsg})`
  }
}
