export async function authedFetch(user, input, init = {}) {
  const headers = new Headers(init.headers || {});

  if (user?.getIdToken) {
    const token = await user.getIdToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}

