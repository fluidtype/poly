import { NextResponse } from 'next/server';

import { fetchWithTimeout } from '@/lib/api';
import { gdeltQuerySchema } from '@/lib/validation';

const shouldLog = process.env.NODE_ENV !== 'production';
const DEFAULT_GDELT_BASE_URL = 'https://my-search-proxy.ew.r.appspot.com/gdelt';
const INVALID_GDELT_HOST_PATTERN = /api\.gdeltproject\.org/u;

const ACTIONS_REQUIRING_DATES = new Set([
  'context',
  'country',
  'bilateral',
  'bilateral_conflict_coverage',
]);

const MAX_DAILY_RANGE_DAYS = 365;

const parseDate = (value: string) =>
  new Date(
    Date.UTC(
      Number(value.slice(0, 4)),
      Number(value.slice(4, 6)) - 1,
      Number(value.slice(6, 8)),
    ),
  );

export async function GET(req: Request) {
  const configuredBaseUrl =
    process.env.GDELT_BASE_URL ?? process.env.NEXT_PUBLIC_GDELT_BASE_URL ?? DEFAULT_GDELT_BASE_URL;
  const baseUrl = configuredBaseUrl.trim().replace(/\/?$/, '');

  if (!baseUrl) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'GDELT_BASE_URL (or NEXT_PUBLIC_GDELT_BASE_URL) is not configured',
      },
      { status: 500 },
    );
  }

  if (INVALID_GDELT_HOST_PATTERN.test(baseUrl)) {
    const guidance =
      'Configured GDELT_BASE_URL points to api.gdeltproject.org, but the dashboard requires the Poly proxy (e.g. https://my-search-proxy.ew.r.appspot.com/gdelt).';

    if (shouldLog) {
      console.error('[api/gdelt] Invalid upstream host configured:', baseUrl);
    }

    const errorPayload: Record<string, unknown> = {
      status: 'error',
      message: guidance,
    };

    if (shouldLog) {
      errorPayload.debug = { url: baseUrl };
    }

    return NextResponse.json(errorPayload, { status: 500 });
  }

  const url = new URL(req.url);
  const rawParams = Object.fromEntries(url.searchParams.entries());
  const validation = gdeltQuerySchema.safeParse(rawParams);

  if (!validation.success) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Invalid query parameters',
        issues: validation.error.flatten(),
      },
      { status: 400 },
    );
  }

  const params = validation.data;
  const action = params.action ?? '';
  const requiresDates = ACTIONS_REQUIRING_DATES.has(action);

  const dateStart = params.date_start;
  const dateEnd = params.date_end;

  if (requiresDates && (!dateStart || !dateEnd)) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'date_start and date_end are required for the selected action',
      },
      { status: 400 },
    );
  }

  if (dateStart && dateEnd) {
    const startDate = parseDate(dateStart);
    const endDate = parseDate(dateEnd);

    if (startDate > endDate) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'date_start must be before date_end',
        },
        { status: 400 },
      );
    }

    const diffDays = Math.abs((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > MAX_DAILY_RANGE_DAYS) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Daily queries limited to 365 days maximum. Use monthly fallback',
        },
        { status: 400 },
      );
    }
  }

  const targetUrl = `${baseUrl}?${url.searchParams.toString()}`;

  if (shouldLog) {
    console.log('[api/gdelt] Fetching URL:', targetUrl);
  }

  const response = await fetchWithTimeout(targetUrl);

  const responseText = await response.text();
  let data: unknown;

  if (responseText) {
    try {
      data = JSON.parse(responseText) as unknown;
    } catch (error) {
      const message =
        error instanceof Error && error.name === 'SyntaxError'
          ? 'Invalid JSON response from GDELT'
          : (error as Error)?.message ?? 'Unable to parse response';

      if (shouldLog) {
        console.error('[api/gdelt] Failed to parse response JSON', {
          error,
          url: targetUrl,
          bodyPreview: responseText.slice(0, 500),
        });
      }

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
      data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)
        ? String((data as { message?: unknown }).message)
        : undefined;
    const message = parsedMessage || response.statusText || 'Upstream request failed';

    if (shouldLog) {
      console.error('[api/gdelt] Non-OK response from upstream', {
        status,
        url: targetUrl,
        bodyPreview: responseText.slice(0, 1000),
      });
    }

    const errorPayload: Record<string, unknown> = {
      status: 'error',
      message,
    };

    if (shouldLog) {
      errorPayload.debug = { url: targetUrl, status, body: responseText.slice(0, 1000) };
    }

    return NextResponse.json(errorPayload, { status });
  }

  return NextResponse.json(data ?? {}, { status: response.status });
}