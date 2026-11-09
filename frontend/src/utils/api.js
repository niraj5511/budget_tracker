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
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerRequest(email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function importData(transactions, budgets, loans) {
  const cleaned = transactions.map(
    ({ description, amount, type, category, date }) => ({
      description,
      amount,
      type,
      category,
      date,
    }),
  );
  return request("/import", {
    method: "POST",
    body: JSON.stringify({ transactions: cleaned, budgets, loans }),
  });
}

export function fetchLoans() {
  return request("/loans");
}

export function createLoan(values) {
  return request("/loans", { method: "POST", body: JSON.stringify(values) });
}

export function updateLoan(id, values) {
  return request(`/loans/${id}`, {
    method: "PUT",
    body: JSON.stringify(values),
  });
}

export async function deleteLoan(id) {
  await request(`/loans/${id}`, { method: "DELETE" });
}

export function addRepayment(loanId, values) {
  return request(`/loans/${loanId}/repayments`, {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export async function deleteRepayment(loanId, id) {
  await request(`/loans/${loanId}/repayments/${id}`, { method: "DELETE" });
}

export function changePassword(currentPassword, newPassword) {
  return request("/account/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function deleteAccount(password) {
  return request("/account/delete", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function fetchCategories() {
  return request("/categories");
}

export function createCategory(type, name) {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify({ type, name }),
  });
}

export function renameCategory(id, name) {
  return request(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}

export async function deleteCategory(id) {
  await request(`/categories/${id}`, { method: "DELETE" });
}