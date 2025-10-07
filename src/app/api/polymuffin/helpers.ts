export type GammaMarket = Record<string, unknown>;

export type NormalizedToken = {
  id: string;
  outcome: 'YES' | 'NO';
  price?: number;
};

export type NormalizedMarket = {
  id: string;
  slug?: string;
  title: string;
  endDate: string | null;
  volume24h: number;
  liquidity: number;
  status: string;
  category?: string;
  tokens: NormalizedToken[];
  priceYes?: number;
  priceNo?: number;
};

export const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizeOutcomeName = (value: unknown): 'YES' | 'NO' => {
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper.includes('NO')) {
      return 'NO';
    }
  }

  return 'YES';
};

export const normalizeTokens = (market: GammaMarket): NormalizedToken[] => {
  const candidateCollections = [
    market.outcomes,
    market.tokens,
    market.outcomeTokens,
  ];

  for (const collection of candidateCollections) {
    if (Array.isArray(collection) && collection.length > 0) {
      return collection
        .map((token) => {
          if (!token || typeof token !== 'object') {
            return undefined;
          }

          if (!('id' in token)) {
            return undefined;
          }

          const rawTokenId = (token as { id: unknown }).id;
          if (rawTokenId === undefined || rawTokenId === null) {
            return undefined;
          }

          const tokenId = String(rawTokenId);
          if (!tokenId) {
            return undefined;
          }

          const outcomeName =
            ('outcome' in token && typeof token.outcome === 'string')
              ? token.outcome
              : ('name' in token && typeof token.name === 'string')
                ? token.name
                : ('title' in token && typeof token.title === 'string')
                  ? token.title
                  : 'YES';

          const priceValue =
            'price' in token
              ? (token.price as unknown)
              : 'lastPrice' in token
                ? (token.lastPrice as unknown)
                : 'mid' in token
                  ? (token.mid as unknown)
                  : undefined;

          const price = priceValue === undefined ? undefined : toNumber(priceValue);

          return {
            id: tokenId,
            outcome: normalizeOutcomeName(outcomeName),
            price: price === 0 && priceValue === undefined ? undefined : price,
          } satisfies NormalizedToken;
        })
        .filter((token): token is NormalizedToken => Boolean(token));
    }
  }

  if (typeof market.outcomes === 'string') {
    try {
      const parsedOutcomes = JSON.parse(market.outcomes);
      const parsedPrices =
        typeof market.outcomePrices === 'string'
          ? JSON.parse(market.outcomePrices)
          : undefined;

      if (Array.isArray(parsedOutcomes)) {
        const outcomes = parsedOutcomes as unknown[];
        const prices = Array.isArray(parsedPrices)
          ? (parsedPrices as unknown[])
          : [];

        const baseId = (() => {
          const candidate = market.id ?? market.marketId ?? market.questionId ?? market.slug;
          if (typeof candidate === 'string' && candidate.trim().length > 0) {
            return candidate.trim();
          }
          if (typeof candidate === 'number' && Number.isFinite(candidate)) {
            return String(candidate);
          }
          return 'market';
        })();

        return outcomes
          .map((outcome, index) => {
            if (typeof outcome !== 'string') {
              return undefined;
            }

            const rawPrice = index < prices.length ? prices[index] : undefined;
            const priceValue = rawPrice === undefined || rawPrice === null ? undefined : toNumber(rawPrice);

            return {
              id: `${baseId}-${index}`,
              outcome: normalizeOutcomeName(outcome),
              price: priceValue === undefined ? undefined : priceValue,
            } satisfies NormalizedToken;
          })
          .filter((token): token is NormalizedToken => Boolean(token));
      }
    } catch (error) {
      console.error('[api/polymuffin] Failed to parse outcomes/outcomePrices', {
        error,
      });
    }
  }

  return [];
};

const pickString = (market: GammaMarket, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = market[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const extractNumericValue = (
  value: unknown,
  visited = new Set<unknown>(),
): number | null => {
  const direct = toNumber(value);
  if (direct !== 0 || value === 0 || value === '0') {
    return direct;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  if (visited.has(value)) {
    return null;
  }

  visited.add(value);

  const record = value as Record<string, unknown>;
  const priorityKeys = [
    'usd',
    'USD',
    'usdValue',
    'usd_amount',
    'usdAmount',
    'amountUsd',
    'amount_usd',
    'inUsd',
    'inUSD',
    'value',
    'amount',
    'num',
    'numValue',
    'float',
    'total',
    'quantity',
  ];

  for (const key of priorityKeys) {
    if (key in record) {
      const nested = extractNumericValue(record[key], visited);
      if (nested !== null) {
        return nested;
      }
    }
  }

  for (const nestedValue of Object.values(record)) {
    const nested = extractNumericValue(nestedValue, visited);
    if (nested !== null) {
      return nested;
    }
  }

  return null;
};

const pickNumber = (market: GammaMarket, keys: string[]): number => {
  for (const key of keys) {
    if (key in market) {
      const value = market[key];
      const parsed = extractNumericValue(value);
      if (parsed !== null) {
        return parsed;
      }
    }
  }

  return 0;
};

export const normalizeMarket = (market: GammaMarket): NormalizedMarket | null => {
  const toIdString = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? String(value) : undefined;
    }

    return undefined;
  };

  const identifierKeys = [
    'id',
    'marketId',
    '_id',
    'questionId',
    'question_id',
    'market_id',
    'slug',
  ];

  const idValue = identifierKeys
    .map((key) => toIdString(market[key]))
    .find((candidate): candidate is string => Boolean(candidate));

  if (!idValue) {
    return null;
  }

  const title =
    pickString(market, ['question', 'title', 'name', 'slug']) ??
    `Market ${idValue}`;

  const slug = pickString(market, ['slug', 'urlSlug', 'marketSlug', 'questionSlug']);

  const endDate = pickString(market, ['endDate', 'endTime', 'end_time', 'closeTime']) ?? null;
  const volume24h = pickNumber(market, [
    'volume24hrClob',
    'volume24hrAmm',
    'volume24hr',
    'volume24h',
    'volume24Hr',
    'volume24Hours',
    'volumeClob',
    'volumeAmm',
    'volume',
    'volume24hUsd',
    'volume24hUSD',
    'volume24hInUsd',
    'volume24hValue',
    'volume24hAmount',
  ]);
  const liquidity = pickNumber(market, [
    'liquidityClob',
    'liquidityAmm',
    'liquidity',
    'liquidity24h',
    'marketMakerLiquidity',
    'liquidityInUsd',
    'liquidityInUSD',
    'liquidityUsd',
    'liquidityUSD',
    'liquidityValue',
    'liquidityAmount',
    'tvl',
    'tvlUsd',
    'totalLiquidity',
  ]);

  const rawStatus = pickString(market, ['status', 'state']);
  const status = rawStatus ?? (typeof market.active === 'boolean' ? (market.active ? 'active' : 'inactive') : 'unknown');

  const category = pickString(market, ['category']) ??
    (Array.isArray(market.categories) && market.categories.length > 0 && typeof market.categories[0] === 'string'
      ? (market.categories[0] as string)
      : undefined);

  const tokens = normalizeTokens(market);
  const priceYes = tokens.find((token) => token.outcome === 'YES')?.price;
  const priceNo = tokens.find((token) => token.outcome === 'NO')?.price;

  return {
    id: idValue,
    slug: slug ?? undefined,
    title,
    endDate,
    volume24h,
    liquidity,
    status,
    category: category ?? undefined,
    tokens,
    priceYes,
    priceNo,
  };
};

export const toQueryTokens = (query?: string): string[] => {
  if (!query) {
    return [];
  }

  return query
    .split(/[\s,]+/u)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
};

export const matchesQuery = (market: GammaMarket, tokens: string[]): boolean => {
  if (tokens.length === 0) {
    return true;
  }

  const haystack = [
    market.question,
    market.description,
    market.eventTitle,
    market.title,
  ]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map((value) => value.toLowerCase());

  if (haystack.length === 0) {
    return false;
  }

  return tokens.some((token) => haystack.some((value) => value.includes(token)));
};

export const sortMarkets = (markets: NormalizedMarket[], sort: 'volume24h' | 'liquidity' | 'endDate') => {
  const sorter: Record<'volume24h' | 'liquidity' | 'endDate', (a: NormalizedMarket, b: NormalizedMarket) => number> = {
    volume24h: (a, b) => b.volume24h - a.volume24h,
    liquidity: (a, b) => b.liquidity - a.liquidity,
    endDate: (a, b) => {
      if (!a.endDate && !b.endDate) {
        return 0;
      }
      if (!a.endDate) {
        return 1;
      }
      if (!b.endDate) {
        return -1;
      }
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    },
  };

  markets.sort(sorter[sort]);
};
