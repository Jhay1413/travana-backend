import { z } from 'zod';


export const agentStatsQuerySchema = z.object({
  today_profit: z.number(),
  weekly_profit: z.number(),
  monthly_profit: z.number(),
  ppb: z.number().optional(),
  target_remaining: z.number(),
  daily_percentage: z.number(),
  weekly_percentage: z.number(),
  monthly_percentage: z.number(),
  averagePPU: z.number(),
  closure_rate: z.number(),
  target_deals: z.number(),
  monthly_target: z.number(),
});
export const booking = z.object({
  agentName: z.string(),
  clientName: z.string(),
  date_booked: z.date(),
  booking_id: z.string(),
  destination: z.string().nullable(),
  travel_date: z.string(),
  overall_commission: z.number(),
  overall_cost: z.number(),
});
export const clientStatsQuerySchema = z.object({
  ppb: z.number(),
  total_enquiries: z.number(),
  total_quotes: z.object({
    total_quotes: z.number(),
    destination: z.array(z.string()),
    last_quoted: z.date().nullable(),
  }),
  total_booking: z.object({
    total_booking: z.number(),
    destination: z.array(z.string()),
    last_booked: z.date().nullable(),
  }),
  live_quote: z.object({
    destination: z.array(z.string()),
    num_of_nights: z.number(),
    overall_cost: z.number(),
    date_quoted: z.date().nullable(),
  }),
  life_time_profit: z.number(),
  booking_percentage: z.string(),
  bookings: z.array(booking).nullable(),
});
export const todoQuerySchema = z.object({
  id: z.string(),
  note: z.string(),
  status: z.enum(['PENDING', 'DONE']),
  agent_id: z.string(),
  createdAt: z.string(),
});
export const adminDashboardStatsQuerySchema = z.object({
  today_data: z.object({
    overall_commission: z.number(),
    count: z.number(),
    ppb: z.number(),
  }),
  weekly_data: z.object({
    overall_commission: z.number(),
    count: z.number(),
    ppb: z.number(),
  }),
  monthly_data: z.object({
    overall_commission: z.number(),
    count: z.number(),
    ppb: z.number(),
  }),
});
// Zod schemas for analytics response
export const AnalyticsMetricSchema = z.object({
  value: z.number().optional(),
  change: z.number(),
  description: z.string().optional(),
});

export const BookingStatusSchema = z.object({
  booked: z.number(),
  lost: z.number(),
});

export const QuoteStatusSchema = z.object({
  accepted: z.number(),
  pending: z.number(),
  rejected: z.number(),
});

export const EnquiryStatusSchema = z.object({
  new: z.number(),
  in_progress: z.number(),
  converted: z.number(),
});

export const PerformanceMetricsSchema = z.object({
  completion_rate: z.number(),
  cancellation_rate: z.number(),
  monthly_growth: z.number(),
});

export const QuotePerformanceMetricsSchema = z.object({
  acceptance_rate: z.number(),
  rejection_rate: z.number(),
  pending_rate: z.number(),
});

export const EnquiryPerformanceMetricsSchema = z.object({
  conversion_rate: z.number(),
});

const RevenueSummarySchema = z.object({
  total_revenue: z.number(),
  avg_value: z.number(),
  growth: z.number(),
});

export const QuoteValueSummarySchema = z.object({
  total_value: z.number(),
  avg_value: z.number(),
  accepted_value: z.number(),
});

export const EnquiryEfficiencySummarySchema = z.object({
  total_enquiries: z.number(),
  converted: z.number(),
  pending: z.number(),
});

export const BookingAnalyticsSchema = z.object({
  total_bookings: AnalyticsMetricSchema,
  total_revenue: AnalyticsMetricSchema,
  avg_booking_value: AnalyticsMetricSchema,
  completion_rate: AnalyticsMetricSchema,
  booking_status: BookingStatusSchema,
  performance_metrics: PerformanceMetricsSchema,
  revenue_summary: RevenueSummarySchema,
});

export const QuoteAnalyticsSchema = z.object({
  total_quotes: AnalyticsMetricSchema,
  total_quote_value: AnalyticsMetricSchema,
  avg_quote_value: AnalyticsMetricSchema,
  acceptance_rate: AnalyticsMetricSchema,
  quote_status: QuoteStatusSchema,
  performance_metrics: QuotePerformanceMetricsSchema,
  value_summary: QuoteValueSummarySchema,
});

export const EnquiryAnalyticsSchema = z.object({
  total_enquiries: AnalyticsMetricSchema,
  conversion_rate: AnalyticsMetricSchema,
  enquiry_status: EnquiryStatusSchema,
  performance_metrics: EnquiryPerformanceMetricsSchema,
  efficiency_summary: EnquiryEfficiencySummarySchema,
});

export const AdminAnalyticsResponseSchema = z.object({
  quick_review: z.object({
    total_enquiries: z.number(),
    total_quotes: z.number(),
    total_bookings: z.number(),
    total_revenue: z.number(),
  }),
  revenue_overview: z.object({
    total_revenue: AnalyticsMetricSchema,
    average_booking: AnalyticsMetricSchema,
    total_bookings: AnalyticsMetricSchema,
    monthly_growth: AnalyticsMetricSchema,
  }),
  kpis: z.object({
    enquiry_to_quote: AnalyticsMetricSchema,
    quote_to_booking: AnalyticsMetricSchema,
    overall_conversion: AnalyticsMetricSchema,
    loss_rate: AnalyticsMetricSchema,
  }),
  activity_status: z.object({
    active_enquiries: AnalyticsMetricSchema,
    pending_quotes: AnalyticsMetricSchema,
    upcoming_bookings: AnalyticsMetricSchema,
    overdue_tasks: AnalyticsMetricSchema,
  }),
  performance_highlights: z.object({
    monthly_growth: z.number(),
    average_response_time: z.number(),
    average_booking_value: z.number(),
    average_quote_value: z.number(),
  }),
  sales_trends: z.array(z.object({
    name: z.string(),
    enquiries: z.number(),
    quotes: z.number(),
    bookings: z.number(),
    revenue: z.number(),
  })),
  revenue_distribution: z.array(z.object({
    name: z.string(),
    value: z.number(),
  })),
  monthly_comparison: z.array(z.object({
    name: z.string(),
    current: z.number(),
    previous: z.number(),
  })),
  booking_analytics: BookingAnalyticsSchema,
  quote_analytics: QuoteAnalyticsSchema,
  enquiry_analytics: EnquiryAnalyticsSchema,
});

export type AdminAnalyticsResponse = z.infer<typeof AdminAnalyticsResponseSchema>;
