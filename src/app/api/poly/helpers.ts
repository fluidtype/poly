export type GammaMarket = Record<string, unknown>;

export type NormalizedToken = {
  id: string;
  outcome: 'YES' | 'NO';
  price?: number;
};

export type NormalizedMarket = {
  id: string;
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

const pickNumber = (market: GammaMarket, keys: string[]): number => {
  for (const key of keys) {
    if (key in market) {
      const value = market[key];
      const parsed = toNumber(value);
      if (parsed !== 0 || value === 0 || value === '0') {
        return parsed;
      }
    }
  }

  return 0;
};

export const normalizeMarket = (market: GammaMarket): NormalizedMarket | null => {
  const idValue = market.id ?? market.marketId ?? market.slug;
  if (typeof idValue !== 'string' || !idValue) {
    return null;
  }

  const title =
    pickString(market, ['question', 'title', 'name', 'slug']) ??
    `Market ${idValue}`;

  const endDate = pickString(market, ['endDate', 'endTime', 'end_time', 'closeTime']) ?? null;
  const volume24h = pickNumber(market, ['volume24h', 'volume24Hr', 'volume24hr', 'volume24Hours']);
  const liquidity = pickNumber(market, ['liquidity', 'liquidity24h', 'marketMakerLiquidity']);

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
