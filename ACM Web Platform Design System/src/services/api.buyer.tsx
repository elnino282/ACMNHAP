// Buyer API Service
// Note: Most buyer functionality is now in FSD entities:
// - Sales: @/entities/sale (useBuyerSales)
// - Reports: @/entities/report (useReports, useReportById)
// - AI Q&A: @/entities/ai (useAiQa)

// Re-export from entities for backward compatibility
export { saleApi, useBuyerSales } from '@/entities/sale';
export { reportApi, useReports, useReportById } from '@/entities/report';
export { aiApi, useAiQa } from '@/entities/ai';

// Legacy placeholder exports (for existing code that may import these)
export const listingsApi = {
  // Listings are accessed via the sale entity
  // See: useBuyerSales from @/entities/sale
};

export const ordersApi = {
  // Orders/Sales are managed via the sale entity
  // See: useBuyerSales from @/entities/sale
};

export const paymentsApi = {
  // Payment processing to be implemented when backend ready
};
