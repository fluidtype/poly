"use client";

import { useEffect, useState } from "react";

interface TwitterPlaceholderProps {
  comingSoon: boolean;
}

interface PlaceholderTweet {
  id?: string;
  text?: string;
  author?: string;
  createdAt?: string;
  url?: string;
}

const skeletonTweets = Array.from({ length: 3 });

function formatTimestamp(timestamp?: string) {
  if (!timestamp) {
    return "";
  }

  try {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

type TwitterApiResponse = PlaceholderTweet[] | { data?: PlaceholderTweet[] | null };

function TweetSkeleton() {
  return (
    <div className="flex animate-pulse gap-3 rounded-2xl border border-[rgb(var(--borderc))]/40 bg-[rgb(var(--surface))]/40 p-3">
      <div className="h-10 w-10 rounded-full bg-[rgb(var(--surface3))]/60" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded-full bg-[rgb(var(--surface3))]/60" />
        <div className="h-3 w-full rounded-full bg-[rgb(var(--surface3))]/60" />
        <div className="h-3 w-5/6 rounded-full bg-[rgb(var(--surface3))]/60" />
      </div>
    </div>
  );
}

function TweetCard({ tweet }: { tweet: PlaceholderTweet }) {
  return (
    <article className="group flex flex-col gap-2 rounded-2xl border border-[rgb(var(--borderc))]/50 bg-[rgb(var(--surface))]/50 p-3 transition hover:border-[rgb(var(--brand))]/60 hover:bg-[rgb(var(--brand))]/10">
      <header className="flex items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[rgb(var(--brand))]/20" />
          <div className="min-w-0">
            <p className="truncate font-medium text-[rgb(var(--text))]">
              {tweet.author ?? "Unknown handle"}
            </p>
            {tweet.createdAt ? (
              <p className="text-xs text-[rgb(var(--muted))]">{formatTimestamp(tweet.createdAt)}</p>
            ) : null}
          </div>
        </div>
        {tweet.url ? (
          <a
            href={tweet.url}
            target="_blank"
            rel="noreferrer"
            className="pill px-3 py-0 text-xs font-semibold text-[rgb(var(--accent-light))] hover:border-[rgb(var(--brand))]/50 hover:bg-[rgb(var(--brand))]/20"
          >
            View
          </a>
        ) : null}
      </header>
      <p className="line-clamp-4 text-sm leading-relaxed text-[rgb(var(--muted))]">
        {tweet.text ?? "No summary available yet."}
      </p>
    </article>
  );
}

export function TwitterPlaceholder({ comingSoon }: TwitterPlaceholderProps) {
  const [tweets, setTweets] = useState<PlaceholderTweet[]>([]);
  const [isLoading, setIsLoading] = useState(!comingSoon);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (comingSoon) {
      setIsLoading(false);
      setError(null);
      setTweets([]);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setError(null);

    fetch("/api/twitter")
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Unable to load Twitter data");
        }
        return response.json() as Promise<TwitterApiResponse>;
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const normalized: PlaceholderTweet[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data ?? []
          : [];

        setTweets(normalized);
      })
      .catch((fetchError: unknown) => {
        if (!isMounted) {
          return;
        }
        const message = fetchError instanceof Error ? fetchError.message : "Unknown error";
        setError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [comingSoon]);

  return (
    <section className="card flex h-full flex-col gap-4 rounded-2xl border border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/90 p-5">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[rgb(var(--text))]">Twitter signals</h2>
          <p className="meta mt-1">Curated market intelligence sourced from verified feeds.</p>
        </div>
      </header>

      {comingSoon ? (
        <div className="space-y-4">
          <div className="pill px-3 py-0 text-sm font-semibold text-[rgb(var(--accent-light))]">
            Twitter integration coming soon
          </div>
          <div className="space-y-3">
            {skeletonTweets.map((_, index) => (
              <TweetSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {skeletonTweets.map((_, index) => (
            <TweetSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="card rounded-2xl border border-[rgb(var(--brand))]/40 bg-[rgb(var(--brand))]/10 p-4 text-sm text-[rgb(var(--accent-light))]">
          Unable to load Twitter data.
          <span className="block text-xs opacity-80">{error}</span>
        </div>
      ) : tweets.length === 0 ? (
        <div className="card rounded-2xl border border-dashed border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/70 p-6 text-center text-sm text-[rgb(var(--muted))]">
          No Twitter updates available yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {tweets.map((tweet, index) => (
            <TweetCard key={tweet.id ?? tweet.url ?? `${tweet.author ?? "tweet"}-${index}`} tweet={tweet} />
          ))}
        </div>
      )}

      {!comingSoon && tweets.length === 0 && !isLoading && !error ? (
        <p className="text-center text-xs text-[rgb(var(--muted))]">
          Connect your Twitter credentials to surface market chatter once the integration launches.
        </p>
      ) : null}
    </section>
  );
}

export default TwitterPlaceholder;
