const isProd = process.env.NODE_ENV === "production";

export function devLog(...args) {
  if (!isProd) console.log(...args);
}

export function devWarn(...args) {
  if (!isProd) console.warn(...args);
}

export function devError(...args) {
  if (!isProd) console.error(...args);
}

export function safeError(message, error) {
  if (!isProd) {
    console.error(message, error);
    return;
  }

  // Avoid leaking potentially sensitive error objects in production consoles.
  console.error(message);
}
