import type { ChartDataPoint, BuyerMixDataPoint } from "./types";

// Note: INITIAL_LISTINGS, INITIAL_QUOTES, INITIAL_CONTRACTS, INITIAL_DELIVERIES, 
// INITIAL_PAYMENTS, INITIAL_DISPUTES removed - now using entity API hooks

// Chart Data
export const MONTHLY_REVENUE_DATA: ChartDataPoint[] = [
    { month: "Jun", revenue: 15000 },
    { month: "Jul", revenue: 18000 },
    { month: "Aug", revenue: 22000 },
    { month: "Sep", revenue: 19000 },
    { month: "Oct", revenue: 25000 },
    { month: "Nov", revenue: 21250 },
];

export const BUYER_MIX_DATA: BuyerMixDataPoint[] = [
    { name: "GrainCo Ltd", value: 8750, color: "#3BA55D" },
    { name: "FoodHub Inc", value: 12500, color: "#4A90E2" },
    { name: "AgriBusiness Co", value: 6600, color: "#F4C542" },
    { name: "Others", value: 3400, color: "#8B7355" },
];

// Select Options
export const SEASON_OPTIONS = [
    { value: "all", label: "All Seasons" },
    { value: "Rice Season 2025", label: "Rice Season 2025" },
    { value: "Corn Season 2025", label: "Corn Season 2025" },
    { value: "Wheat Season 2025", label: "Wheat Season 2025" },
];

export const GRADE_OPTIONS = [
    { value: "Premium", label: "Premium" },
    { value: "A", label: "Grade A" },
    { value: "B", label: "Grade B" },
    { value: "C", label: "Grade C" },
];

// Status Badge Colors
export const GRADE_COLORS: Record<string, string> = {
    Premium: "bg-[#3BA55D]/10 text-[#3BA55D] border-[#3BA55D]/20",
    A: "bg-[#4A90E2]/10 text-[#4A90E2] border-[#4A90E2]/20",
    B: "bg-[#F4C542]/10 text-[#333333] border-[#F4C542]/20",
    C: "bg-[#8B7355]/10 text-[#8B7355] border-[#8B7355]/20",
};
















