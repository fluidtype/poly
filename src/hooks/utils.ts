import type { PolyMarket, PolyMarketApi, PolyToken, PolyTokenApi } from "@/types";

export const commonQueryOptions = {
  cacheTime: 10 * 60 * 1000,
  staleTime: 2 * 60 * 1000,
  refetchOnWindowFocus: false,
  onError: (error: Error) => console.error("Query failed:", error.message),
};

export function createAbortSignal(parent?: AbortSignal): AbortSignal {
  const controller = new AbortController();
  if (parent) {
    if (parent.aborted) {
      controller.abort();
    } else {
      parent.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }
  return controller.signal;
}

export function normalizeGdeltDate(value: string | number | undefined | null): string {
  if (value == null) {
    return "";
  }

  const raw = typeof value === "number" ? String(value) : value;
  if (/^\d{8}$/.test(raw)) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    return `${year}-${month}-${day}`;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0] ?? "";
}

export function normalizeTokens(tokens?: PolyTokenApi[] | null): PolyToken[] {
  if (!Array.isArray(tokens)) {
    return [];
  }

  return tokens
    .filter((token): token is PolyTokenApi => Boolean(token) && typeof token === "object")
    .map((token) => {
      const rawPrice = token.price;
      const price =
        typeof rawPrice === "number"
          ? rawPrice
          : typeof rawPrice === "string" && rawPrice.trim() !== ""
          ? Number(rawPrice)
          : undefined;

      return {
        id: String(token.id ?? ""),
        outcome: token.outcome === "NO" ? "NO" : "YES",
        price: Number.isFinite(price) ? price : undefined,
      };
    });
}

export function normalizeMarket(market?: PolyMarketApi | null): PolyMarket {
  const tokens = normalizeTokens(market?.tokens ?? null);
  const yesToken = tokens.find((token) => token.outcome === "YES");
  const noToken = tokens.find((token) => token.outcome === "NO");

  return {
    id: String(market?.id ?? ""),
    slug: market?.slug ? String(market.slug) : undefined,
    title: String(market?.title ?? ""),
    endDate: market?.endDate ? String(market.endDate) : null,
    volume24h: Number(market?.volume24h ?? 0) || 0,
    liquidity: Number(market?.liquidity ?? 0) || 0,
    status: String(market?.status ?? "unknown"),
    category: market?.category ? String(market.category) : undefined,
    tokens,
    priceYes: yesToken?.price,
    priceNo: noToken?.price,
  };
}
