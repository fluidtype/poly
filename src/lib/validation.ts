import { z } from 'zod';

export const yyyymmddSchema = z
  .string()
  .regex(/^[0-9]{8}$/u, 'Expected YYYYMMDD format');

const gdeltBooleanSchema = z.union([z.literal('true'), z.literal('false')]);
const countryCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/iu, 'Expected three-letter country code');
const cameoCodesSchema = z
  .string()
  .regex(/^[0-9]+(?:,[0-9]+)*$/u, 'Expected comma-separated numeric codes');

export const gdeltQuerySchema = z
  .object({
    action: z.enum([
      'bilateral',
      'bilateral_conflict_coverage',
      'conflict',
      'context',
      'country',
      'economic',
      'high-impact',
      'search',
      'test',
    ]),
    date_start: yyyymmddSchema.optional(),
    date_end: yyyymmddSchema.optional(),
    country: countryCodeSchema.optional(),
    country1: countryCodeSchema.optional(),
    country2: countryCodeSchema.optional(),
    actor1_code: countryCodeSchema.optional(),
    actor2_code: countryCodeSchema.optional(),
    keywords: z.string().trim().min(1).optional(),
    query: z.string().trim().min(1).optional(),
    limit: z.coerce.number().int().positive().max(1000).optional(),
    include_insights: gdeltBooleanSchema.optional(),
    include_total: gdeltBooleanSchema.optional(),
    cameo_codes: cameoCodesSchema.optional(),
    granularity: z.enum(['daily', 'monthly']).optional(),
    time_unit: z.enum(['day', 'month']).optional(),
  })
  .passthrough();

const booleanLiteralSchema = z.union([z.literal('true'), z.literal('false')]);

export const polymuffinListQuerySchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    active: booleanLiteralSchema.optional(),
    limit: z.coerce.number().int().optional(),
    category: z.string().trim().min(1).optional(),
    sort: z.enum(['volume24h', 'liquidity', 'endDate']).optional(),
  })
  .passthrough();

export const polymuffinMarketQuerySchema = z.object({
  id: z.string().min(1, 'Market id is required'),
});
