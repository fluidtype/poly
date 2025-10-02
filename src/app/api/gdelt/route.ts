import { NextResponse } from 'next/server';

import { fetchWithTimeout } from '@/lib/api';
import { gdeltQuerySchema } from '@/lib/validation';

const ACTIONS_REQUIRING_DATES = new Set([
  'context',
  'country',
  'bilateral',
  'bilateral_conflict_coverage',
]);

const MAX_DAILY_RANGE_DAYS = 365;

const parseDate = (value: string) => {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));

  return new Date(Date.UTC(year, month, day));
};

export async function GET(req: Request) {
  const baseUrl = process.env.GDELT_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { status: 'error', message: 'GDELT_BASE_URL is not configured' },
      { status: 500 },
    );
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
  const response = await fetchWithTimeout(targetUrl);

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'SyntaxError'
        ? 'Invalid JSON response from GDELT'
        : (error as Error)?.message ?? 'Unable to parse response';

    return NextResponse.json(
      { status: 'error', message },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const status = response.status || 502;
    const message =
      data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)
        ? String((data as { message?: unknown }).message)
        : 'Upstream request failed';

    return NextResponse.json(
      { status: 'error', message },
      { status },
    );
  }

  return NextResponse.json(data, { status: response.status });
}
