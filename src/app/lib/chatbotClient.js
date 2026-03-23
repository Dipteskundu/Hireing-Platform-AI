"use client";

import { API_BASE } from "./apiClient";
import { auth } from "./firebaseClient";

export async function askChatbot(message, options = {}) {
  const controller = options.signal ? null : new AbortController();
  const signal = options.signal || controller?.signal;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), options.timeoutMs || 20000)
    : null;

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Please sign in to ask account-specific questions.");
    }

    const token = await currentUser.getIdToken();
    const response = await fetch(`${API_BASE}/api/chatbot/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        history: Array.isArray(options.history) ? options.history.slice(-5) : [],
      }),
      signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.message || "Chatbot request failed");
    }

    return payload;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
