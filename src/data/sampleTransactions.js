/**
 * A transaction looks like:
 *   {
 *     id: string,          unique key
 *     description: string, what the money was for
 *     amount: number,      always positive - `type` carries the direction
 *     type: string,        'income' | 'expense'
 *     date: string,        'YYYY-MM-DD'
 *   }
 *
 * Hardcoded for now; the add-transaction form replaces this later.
 * Newest first - the list renders them in array order.
 */
const sampleTransactions = [
  {
    id: 't6',
    description: 'Coffee with friends',
    amount: 680,
    type: 'expense',
    date: '2026-08-14',
  },
  {
    id: 't5',
    description: 'Internet bill',
    amount: 1500,
    type: 'expense',
    date: '2026-08-10',
  },
  {
    id: 't4',
    description: 'Freelance project',
    amount: 12000,
    type: 'income',
    date: '2026-08-09',
  },
  {
    id: 't3',
    description: 'Groceries',
    amount: 4250.5,
    type: 'expense',
    date: '2026-08-05',
  },
  {
    id: 't2',
    description: 'Room rent',
    amount: 18000,
    type: 'expense',
    date: '2026-08-02',
  },
  {
    id: 't1',
    description: 'Monthly salary',
    amount: 55000,
    type: 'income',
    date: '2026-08-01',
  },
]

export default sampleTransactions
