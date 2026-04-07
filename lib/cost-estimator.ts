import type { CustomTripStop } from '@/types'

export type VehicleType = 'small-car' | 'suv' | '4wd' | 'campervan'
export type AccomType = 'camping' | 'guesthouse' | 'hotel' | 'luxury'
export type FoodBudget = 'self-catering' | 'mixed' | 'restaurants'

export interface CostPrefs {
  vehicle: VehicleType
  accommodation: AccomType
  food: FoodBudget
}

export interface TripCostBreakdown {
  fuel: number
  accommodation: number
  food: number
  activities: number
  total: number
  nights: number
  totalKm: number
}

// Litres per 100km
const CONSUMPTION: Record<VehicleType, number> = {
  'small-car': 7,
  suv: 9,
  '4wd': 12,
  campervan: 14,
}

const FUEL_EUR = 2.1 // EUR per litre (Iceland ~2024)

const ACCOM_NIGHT: Record<AccomType, number> = {
  camping: 18,
  guesthouse: 95,
  hotel: 155,
  luxury: 280,
}

const FOOD_DAY: Record<FoodBudget, number> = {
  'self-catering': 25,
  mixed: 55,
  restaurants: 110,
}

const ACTIVITY_DAY = 15 // avg entry fees per day

export function estimateCost(stops: CustomTripStop[], prefs: CostPrefs): TripCostBreakdown {
  const totalKm = stops.reduce((s, stop) => s + (stop.driveFromPrev?.km ?? 0), 0)
  const dayNums = Array.from(new Set(stops.map((s) => s.day)))
  const nights = Math.max(dayNums.length - 1, 1)
  const days = nights + 1

  const fuel = Math.round((totalKm / 100) * CONSUMPTION[prefs.vehicle] * FUEL_EUR)
  const accommodation = Math.round(ACCOM_NIGHT[prefs.accommodation] * nights)
  const food = Math.round(FOOD_DAY[prefs.food] * days)
  const activities = Math.round(ACTIVITY_DAY * days)
  const total = fuel + accommodation + food + activities

  return { fuel, accommodation, food, activities, total, nights, totalKm }
}
