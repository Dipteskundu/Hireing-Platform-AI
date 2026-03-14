/**
 * Single source of truth for the backend base URL.
 * All API calls in the frontend should import this.
 *
 * In production (Vercel), NEXT_PUBLIC_API_BASE_URL is set to:
 *   https://hireing-platform-ai-server.onrender.com
 *
 * Locally it falls back to localhost:5000.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://hireing-platform-ai-server.onrender.com";
