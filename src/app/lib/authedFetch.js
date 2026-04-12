import api from "./apiClient";

/**
 * Authenticated fetch using the centralized axios instance.
 * Attaches Firebase ID token as Authorization header.
 * Returns { data: { success: false, message, _serverError: true } } on 500
 * so callers never need to catch server config errors.
 */
export async function authedFetch(user, url, init = {}) {
  const headers = { ...(init.headers || {}) };

  if (user?.getIdToken) {
    try {
      const token = await user.getIdToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // token fetch failed — proceed without auth header
    }
  }

  const { headers: _h, body, method, ...rest } = init;

  try {
    return await api({
      url,
      method: method || "GET",
      headers,
      data: body ? JSON.parse(body) : undefined,
      ...rest,
    });
  } catch (err) {
    const status = err?.response?.status;
    if (status === 500) {
      // Return a safe empty response so callers don't crash
      return {
        status: 500,
        data: {
          success: false,
          _serverError: true,
          message: err?.response?.data?.message || "Server error. Please try again later.",
          interviews: [],
          data: null,
        },
      };
    }
    throw err;
  }
}
