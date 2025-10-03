import { NextResponse } from 'next/server';

import { fetchWithTimeout } from '@/lib/api';
import { polymuffinMarketQuerySchema } from '@/lib/validation';

import { GammaMarket, NormalizedMarket, normalizeMarket } from '../helpers';

const shouldLog = process.env.NODE_ENV !== 'production';
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

const DEFAULT_POLYMUFFIN_GAMMA_BASE = 'https://gamma-api.polymarket.com';

export async function GET(req: Request) {
  const configuredBaseUrl =
    process.env.POLYMUFFIN_GAMMA_BASE ??
    process.env.NEXT_PUBLIC_POLYMUFFIN_GAMMA_BASE ??
    DEFAULT_POLYMUFFIN_GAMMA_BASE;
  const baseUrl = configuredBaseUrl.trim().replace(/\/?$/, '');

  if (!baseUrl) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'POLYMUFFIN_GAMMA_BASE (or NEXT_PUBLIC_POLYMUFFIN_GAMMA_BASE) is not configured',
      },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const rawParams = Object.fromEntries(url.searchParams.entries());
  const parsed = polymuffinMarketQuerySchema.safeParse(rawParams);

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

  const responseText = await response.text();
  let payload: unknown;

  if (responseText) {
    try {
      payload = JSON.parse(responseText) as unknown;
    } catch (error) {
      const message =
        error instanceof Error && error.name === 'SyntaxError'
          ? 'Invalid JSON response from Polymarket'
          : (error as Error)?.message ?? 'Unable to parse response';

      const errorPayload: Record<string, unknown> = {
        status: 'error',
        message,
      };

      if (shouldLog) {
        errorPayload.debug = { url: targetUrl, status: response.status };
      }

      return NextResponse.json(errorPayload, { status: 502 });
    }
  }

  if (!response.ok) {
    const status = response.status || 502;
    const parsedMessage =
      payload && typeof payload === 'object' && 'message' in (payload as Record<string, unknown>)
        ? String((payload as { message?: unknown }).message)
        : undefined;
    const message = parsedMessage || response.statusText || 'Upstream request failed';

    const errorPayload: Record<string, unknown> = {
      status: 'error',
      message,
    };

    if (shouldLog) {
      errorPayload.debug = { url: targetUrl, status, body: responseText.slice(0, 1000) };
    }

    return NextResponse.json(errorPayload, { status });
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