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
  } catch (error) {
    return timestamp;
  }
}

function TweetSkeleton() {
  return (
    <div className="flex animate-pulse gap-3 rounded-2xl border border-[color:var(--surface-3)]/20 bg-gradient-to-br from-[color:var(--surface-2)] to-[color:var(--surface-3)] p-3 shadow-inner shadow-black/5">
      <div className="h-10 w-10 rounded-full bg-[color:var(--surface-4)]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded-full bg-[color:var(--surface-4)]" />
        <div className="h-3 w-full rounded-full bg-[color:var(--surface-4)]" />
        <div className="h-3 w-5/6 rounded-full bg-[color:var(--surface-4)]" />
      </div>
    </div>
  );
}

function TweetCard({ tweet }: { tweet: PlaceholderTweet }) {
  return (
    <article className="group flex flex-col gap-2 rounded-2xl border border-[color:var(--surface-3)]/20 bg-gradient-to-br from-[color:var(--surface-2)] to-[color:var(--surface-3)] p-3 shadow-lg shadow-black/5 transition hover:border-[color:var(--primary)]/40 hover:shadow-[0_20px_45px_-30px_var(--primary)]">
      <header className="flex items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[color:var(--primary)]/20" />
          <div className="min-w-0">
            <p className="truncate font-medium text-[color:var(--text)]">
              {tweet.author ?? "Unknown handle"}
            </p>
            {tweet.createdAt ? (
              <p className="text-xs text-[color:var(--muted)]">{formatTimestamp(tweet.createdAt)}</p>
            ) : null}
          </div>
        </div>
        {tweet.url ? (
          <a
            href={tweet.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-[color:var(--surface-4)] bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--primary)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10"
          >
            View
          </a>
        ) : null}
      </header>
      <p className="line-clamp-4 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
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
        return response.json();
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const normalized: PlaceholderTweet[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
          ? (data as any).data
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
    <section className="card relative flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--text)]">Twitter Signals</h2>
          <p className="text-sm text-[color:var(--muted)]">
            Curated market intelligence sourced from verified feeds.
          </p>
        </div>
      </header>

      {comingSoon ? (
        <div className="space-y-4">
          <div className="rounded-full bg-[color:var(--primary)]/15 px-3 py-1 text-sm font-medium text-[color:var(--primary)]">
            Twitter Integration Coming Soon
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
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          Unable to load Twitter data.
          <span className="block text-xs opacity-80">{error}</span>
        </div>
      ) : tweets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--surface-4)]/60 bg-[color:var(--surface-2)]/40 p-6 text-center text-sm text-[color:var(--muted)]">
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
        <p className="text-center text-xs text-[color:var(--muted)]">
          Connect your Twitter credentials to surface market chatter once the integration launches.
        </p>
      ) : null}
    </section>
  );
}

export default TwitterPlaceholder;
