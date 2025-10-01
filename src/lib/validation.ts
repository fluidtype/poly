import { z } from 'zod';

export const yyyymmddSchema = z
  .string()
  .regex(/^[0-9]{8}$/u, 'Expected YYYYMMDD format');

export const gdeltQuerySchema = z
  .object({
    action: z.string().optional(),
    date_start: yyyymmddSchema.optional(),
    date_end: yyyymmddSchema.optional(),
  })
  .passthrough();

const booleanLiteralSchema = z.union([z.literal('true'), z.literal('false')]);

export const polyListQuerySchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    active: booleanLiteralSchema.optional(),
    limit: z.coerce.number().int().optional(),
    category: z.string().trim().min(1).optional(),
    sort: z.enum(['volume24h', 'liquidity', 'endDate']).optional(),
  })
  .passthrough();

export const polyMarketQuerySchema = z.object({
  id: z.string().min(1, 'Market id is required'),
});
