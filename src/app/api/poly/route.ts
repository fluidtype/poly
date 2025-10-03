import { NextResponse } from 'next/server';

import { fetchWithTimeout } from '@/lib/api';
import { polyListQuerySchema } from '@/lib/validation';

const shouldLog = process.env.NODE_ENV !== 'production';

import {
  GammaMarket,
  NormalizedMarket,
  matchesQuery,
  normalizeMarket,
  sortMarkets,
  toQueryTokens,
} from './helpers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractMarkets = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const root = payload as Record<string, unknown>;

  const candidates: unknown[] = [root.markets, root.data, root.results];

  if (isRecord(root.data)) {
    const nestedData = root.data;
    candidates.push(nestedData.markets, nestedData.data, nestedData.results);
  }

  if (isRecord(root.markets)) {
    const nestedMarkets = root.markets;
    candidates.push(nestedMarkets.data, nestedMarkets.markets, nestedMarkets.results);
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

type SortField = 'volume24h' | 'liquidity' | 'endDate';

const clampLimit = (value: number) => Math.min(Math.max(value, 5), 200);

export async function GET(req: Request) {
  const baseUrl = process.env.POLY_GAMMA_BASE;
  if (!baseUrl) {
    return NextResponse.json(
      { status: 'error', message: 'POLY_GAMMA_BASE is not configured' },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const rawParams = Object.fromEntries(url.searchParams.entries());
  const parsed = polyListQuerySchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Invalid query parameters',
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const query = data.q?.trim();
  const queryTokens = toQueryTokens(query);
  const active = data.active ? data.active === 'true' : true;
  const closed = !active;
  const limit = clampLimit(data.limit ?? 30);
  const category = data.category;
  const sort = (data.sort ?? 'volume24h') as SortField;

  const searchParams = new URLSearchParams({
    closed: String(closed),
    limit: String(limit),
  });

  if (category) {
    searchParams.set('category', category);
  }

  const targetUrl = `${baseUrl}/markets?${searchParams.toString()}`;

  if (shouldLog) {
    console.log('[api/poly] Fetching URL:', targetUrl);
  }

  const response = await fetchWithTimeout(targetUrl);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'SyntaxError'
        ? 'Invalid JSON response from Polymarket'
        : (error as Error)?.message ?? 'Unable to parse response';

    return NextResponse.json(
      { status: 'error', message },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const status = response.status || 502;
    const message =
      payload && typeof payload === 'object' && 'message' in (payload as Record<string, unknown>)
        ? String((payload as { message?: unknown }).message)
        : 'Upstream request failed';

    if (shouldLog) {
      console.error('[api/poly] Non-OK response', status, 'from URL:', targetUrl, 'message:', message);
    }

    return NextResponse.json(
      { status: 'error', message },
      { status },
    );
  }

  const upstreamMarkets = extractMarkets(payload);

  const filteredRaw = queryTokens.length === 0
    ? upstreamMarkets
    : upstreamMarkets.filter((market) => matchesQuery(market as GammaMarket, queryTokens));

  const normalized = filteredRaw
    .map((market) => normalizeMarket(market as GammaMarket))
    .filter((market): market is NormalizedMarket => Boolean(market));

  if (shouldLog) {
    console.log(
      '[api/poly] Returning markets:',
      normalized.length,
      'from upstream:',
      upstreamMarkets.length,
      'query tokens:',
      queryTokens.length,
    );
  }

  sortMarkets(normalized, sort);

  return NextResponse.json({
    status: 'success',
    count: normalized.length,
    markets: normalized,
  });
}
