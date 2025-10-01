import { NextResponse } from 'next/server';

import { fetchWithTimeout } from '@/lib/api';
import { polyMarketQuerySchema } from '@/lib/validation';

import { GammaMarket, NormalizedMarket, normalizeMarket } from '../helpers';

const buildMetadata = (market: GammaMarket) => {
  const metadata: Record<string, unknown> = {};

  if (typeof market.description === 'string' && market.description.trim().length > 0) {
    metadata.description = market.description.trim();
  }

  if (typeof market.eventTitle === 'string' && market.eventTitle.trim().length > 0) {
    metadata.eventTitle = market.eventTitle.trim();
  }

  if (typeof market.image === 'string' && market.image.trim().length > 0) {
    metadata.image = market.image.trim();
  }

  if (typeof market.resolution === 'string' && market.resolution.trim().length > 0) {
    metadata.resolution = market.resolution.trim();
  }

  if (Array.isArray(market.categories)) {
    const categories = market.categories.filter((value): value is string => typeof value === 'string' && value.length > 0);
    if (categories.length > 0) {
      metadata.categories = categories;
    }
  }

  if ('liquidityHistory' in market && Array.isArray(market.liquidityHistory)) {
    metadata.liquidityHistory = market.liquidityHistory;
  }

  return metadata;
};

const extractMarketPayload = (payload: unknown): GammaMarket | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('market' in payload && (payload as { market?: unknown }).market) {
    const market = (payload as { market: unknown }).market;
    if (market && typeof market === 'object') {
      return market as GammaMarket;
    }
  }

  if ('data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data) && data.length > 0) {
      const [first] = data;
      if (first && typeof first === 'object') {
        return first as GammaMarket;
      }
    }
    if (data && typeof data === 'object') {
      return data as GammaMarket;
    }
  }

  return payload as GammaMarket;
};

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
  const parsed = polyMarketQuerySchema.safeParse(rawParams);

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

  const { id } = parsed.data;
  const targetUrl = `${baseUrl}/markets/${id}`;
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

    return NextResponse.json(
      { status: 'error', message },
      { status },
    );
  }

  const marketPayload = extractMarketPayload(payload);

  if (!marketPayload) {
    return NextResponse.json(
      { status: 'error', message: 'Market not found' },
      { status: 404 },
    );
  }

  const normalized = normalizeMarket(marketPayload);

  if (!normalized) {
    return NextResponse.json(
      { status: 'error', message: 'Market not found' },
      { status: 404 },
    );
  }

  const metadata = buildMetadata(marketPayload);
  const market: NormalizedMarket = normalized;

  return NextResponse.json({
    status: 'success',
    market,
    metadata,
  });
}
