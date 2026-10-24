const API_URL = import.meta.env.VITE_API_URL

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.status === 204 ? null : response.json()
}

// The app expects string ids, but the backend sends numbers for now.
const withStringId = (transaction) => ({ ...transaction, id: String(transaction.id) })

export async function fetchTransactions() {
  const list = await request('/transactions')
  return list.map(withStringId)
}

export async function createTransaction(values) {
  return withStringId(
    await request('/transactions', { method: 'POST', body: JSON.stringify(values) }),
  )
}

export async function updateTransaction(id, values) {
  return withStringId(
    await request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(values) }),
  )
}

export async function deleteTransaction(id) {
  await request(`/transactions/${id}`, { method: 'DELETE' })
}