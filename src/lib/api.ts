export type FetchOptions = RequestInit;

const DEFAULT_TIMEOUT = 30000;

export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {},
  timeout = DEFAULT_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = response.statusText || 'Request failed';

      try {
        const data = await response.clone().json();
        if (typeof data === 'object' && data && 'message' in data) {
          message = String((data as { message?: unknown }).message ?? message);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'SyntaxError') {
          message = error.message;
        }
      }

      return new Response(
        JSON.stringify({ status: 'error', message }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    return response;
  } catch (error) {
    const isAbortError = error instanceof Error && error.name === 'AbortError';
    const message = isAbortError
      ? 'Request timed out'
      : error instanceof Error
        ? error.message
        : 'Request failed';

    return new Response(
      JSON.stringify({ status: 'error', message }),
      {
        status: isAbortError ? 504 : 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
