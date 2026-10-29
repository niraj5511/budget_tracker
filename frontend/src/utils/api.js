const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "budget-tracker:token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable: the user stays signed in until the page reloads */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
}

// Set by the auth provider, so an expired token logs the user out.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (response.status === 401 && token) onUnauthorized();
  if (!response.ok) {
    const error = new Error(`Request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

// The app expects string ids, but the backend sends numbers for now.
const withStringId = (transaction) => ({
  ...transaction,
  id: String(transaction.id),
});

export async function fetchTransactions() {
  const list = await request("/transactions");
  return list.map(withStringId);
}

export async function createTransaction(values) {
  return withStringId(
    await request("/transactions", {
      method: "POST",
      body: JSON.stringify(values),
    }),
  );
}

export async function updateTransaction(id, values) {
  return withStringId(
    await request(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    }),
  );
}

export async function deleteTransaction(id) {
  await request(`/transactions/${id}`, { method: "DELETE" });
}
export async function fetchBudgets() {
  const list = await request("/budgets");
  return Object.fromEntries(
    list.map((budget) => [budget.category, budget.limit]),
  );
}

export async function saveBudgetLimit(category, limit) {
  await request(`/budgets/${encodeURIComponent(category)}`, {
    method: "PUT",
    body: JSON.stringify({ limit }),
  });
}

export async function deleteBudgetLimit(category) {
  await request(`/budgets/${encodeURIComponent(category)}`, {
    method: "DELETE",
  });
}

export function loginRequest(email, password) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function registerRequest(email, password) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
}
