

Build a scalable API handling system in a Next.js application using Axios with the following requirements:

* Use an environment variable named `NEXT_PUBLIC_API_BASE_URL` to define the backend server URL.
* Ensure that **no API base URL is hardcoded anywhere in the application**.
* Create a centralized Axios instance (e.g., `/lib/axios.ts` or `/utils/api.ts`) that:

  * Uses `process.env.NEXT_PUBLIC_API_BASE_URL` as the `baseURL`
  * Supports global configuration (headers, timeout, etc.)
* All API calls throughout the app must use this centralized Axios instance.
* Make the setup flexible so switching between:

  * local development server
  * staging server
  * production server
    can be done by simply changing environment variables (`.env.local`, `.env.production`, etc.)
* Optionally include:

  * request and response interceptors for handling tokens, errors, and logging
  * TypeScript support (if applicable)
* Ensure compatibility with both client-side and server-side rendering in Next.js.

Also include:

* Example `.env.local` and `.env.production` configurations
* Example API call using the centralized Axios instance
* Best practices for maintaining clean and scalable API layers

---

### 💡 Quick Implementation Insight (so you understand the idea clearly)

**1. `.env.local`**

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

**2. `.env.production`**

```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

**3. Axios Instance (`lib/api.ts`)**

```ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

export default api;
```

**4. Usage Anywhere**

```ts
import api from "@/lib/api";

const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};
```

---

### ⚙️ Engineering Benefit

* **Single Source of Truth** → No duplication of base URLs
* **Environment Agnostic** → Switch backend without touching code
* **Maintainability** → Clean, testable API layer
* **Scalability** → Easy to extend with interceptors, auth, retries

.
