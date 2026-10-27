# Budget Tracker

A personal budget tracker for recording income and expenses, setting category budgets, and viewing spending summaries. Dates use the Nepali (Bikram Sambat) calendar.

The project has two parts in one repository:

```
budget_tracker/
  frontend/   React app (Vite)
  backend/    Spring Boot REST API
```

## Features

- **Dashboard**: balance summary, category breakdown, category pie chart, monthly trend, month-to-month comparison and top spending category, with a month filter.
- **Transactions**: add, edit and delete income and expense entries, with categories and filters.
- **Budgets**: set a spending limit per category and track progress against it.
- **Backup**: export and restore data.
- **Theme**: light and dark mode toggle.

## Tech stack

| Part | Tools |
|---|---|
| Frontend | React 19, Vite, React Router, Recharts |
| Backend | Java 21, Spring Boot 4.1, Maven, Spring Web, Validation, Spring Data JPA |
| Database | PostgreSQL on Supabase |

## Requirements

- Node.js and npm
- JDK 21
- A Supabase project (free plan) for the database

## Running locally

Create `backend/secrets.properties` with your database details. It is listed in `.gitignore` and must not be committed.
```
spring.datasource.url=jdbc:postgresql://<host>:5432/postgres
spring.datasource.username=<user>
spring.datasource.password=<password>
```
Use the Session pooler connection details from the Supabase Connect panel. Always start the backend from the `backend` folder, because the file is read from the current directory.
Start the backend first.

```
cd backend
.\mvnw spring-boot:run
```

The API runs at `http://localhost:8080`.

Then start the frontend in a second terminal.

```
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Frontend configuration

`frontend/.env` holds the API address:

```
VITE_API_URL=http://localhost:8080/api
```

Restart `npm run dev` after changing it. If the backend port changes, update this value and the allowed origin in `backend/src/main/java/com/niraj/backend/WebConfig.java`.

## API

Base path: `/api`

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Returns `{"status":"ok"}` |
| GET | `/transactions` | List all transactions |
| POST | `/transactions` | Create a transaction (returns 201) |
| PUT | `/transactions/{id}` | Update a transaction |
| DELETE | `/transactions/{id}` | Delete a transaction (returns 204) |
| GET | `/budgets` | List all budgets |
| PUT | `/budgets/{category}` | Set the limit for a category |
| DELETE | `/budgets/{category}` | Remove the limit for a category |

Missing records return `404`. Invalid input returns `400`.

### Transaction body

```json
{
  "description": "Groceries",
  "amount": 3200,
  "type": "expense",
  "category": "Food",
  "date": "2026-10-03"
}
```

- `description` and `category` must not be blank.
- `amount` must be greater than 0.
- `type` must be `income` or `expense`.
- `date` must be in `YYYY-MM-DD` format.

### Budget body

```json
{ "limit": 5000 }
```

`limit` must be greater than 0.

## Backend structure

Source is in `backend/src/main/java/com/niraj/backend/`.

| File | Role |
|---|---|
| `TransactionController`, `BudgetController` | Handle HTTP requests |
| `TransactionService`, `BudgetService` | Business rules and database access through the repositories |
| `Transaction`, `Budget` | Data returned by the API |
| `TransactionRequest`, `BudgetRequest` | Input accepted by the API, with validation |
| `HealthController` | Health check |
| `WebConfig` | CORS settings for the frontend |
| `TransactionEntity`, `BudgetEntity` | Database tables, created automatically on startup |
| `TransactionRepository`, `BudgetRepository` | Database access |

## Current limitations

- Backup restore updates only the data on screen and does not send it to the backend.
