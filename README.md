# Budget Tracker

A personal budget tracker for recording income and expenses, setting category budgets, and viewing spending summaries. Dates use the Nepali (Bikram Sambat) calendar.

The project has two parts in one repository:

```
budget_tracker/
  frontend/   React app (Vite)
  backend/    Spring Boot REST API
```

## Features

- **Dashboard**: balance summary, category breakdown, category pie chart, monthly trend, month-to-month comparison and top spending category, with a month filter. A Lend / Borrow card shows what you are owed and what you owe.
- **Transactions**: add, edit and delete income and expense entries, with categories and filters.
- **Budgets**: set a spending limit per category and track progress against it.
- **Lend / Borrow**: record money you lent or borrowed, with an optional due date and a history of repayments. These records are kept apart from your income, expenses and balance.
- **Accounts**: register and log in, change your password, or delete your account and all its data. Each user sees only their own data.
- **Backup**: download your data (transactions, budgets and Lend / Borrow records) as a file, and restore it into your account.
- **Theme**: light and dark mode toggle.

## Tech stack

| Part     | Tools                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Frontend | React 19, Vite, React Router, Recharts                                                                  |
| Backend  | Java 21, Spring Boot 4.1, Maven, Spring Web, Validation, Spring Data JPA, Spring Security (JWT, BCrypt) |
| Database | PostgreSQL on Supabase                                                                                  |

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
app.jwt.secret=<long random string, at least 32 characters>
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

Restart `npm run dev` after changing it. If the backend runs on a different port, update this value. If the frontend runs on a different address, set `app.cors.origins` for the backend (see Deployment).

## API

Base path: `/api`

All endpoints except `/health` and `/auth/*` need the header `Authorization: Bearer <token>`. Each user can only read and change their own transactions, budgets and loans.

| Method | Path                                   | Description                                                                                                    |
| ------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| GET    | `/health`                              | Returns `{"status":"ok"}`                                                                                      |
| POST   | `/auth/register`                       | Create an account (returns 201, `409` if the email is taken)                                                   |
| POST   | `/auth/login`                          | Returns `{ token, user }`. The token lasts 24 hours. Bad credentials return `401`.                             |
| GET    | `/transactions`                        | List all transactions                                                                                          |
| POST   | `/transactions`                        | Create a transaction (returns 201)                                                                             |
| PUT    | `/transactions/{id}`                   | Update a transaction                                                                                           |
| DELETE | `/transactions/{id}`                   | Delete a transaction (returns 204)                                                                             |
| GET    | `/budgets`                             | List all budgets                                                                                               |
| PUT    | `/budgets/{category}`                  | Set the limit for a category                                                                                   |
| DELETE | `/budgets/{category}`                  | Remove the limit for a category                                                                                |
| GET    | `/loans`                               | List loans, each with its repayments and the total repaid                                                      |
| POST   | `/loans`                               | Create a loan (returns 201)                                                                                    |
| PUT    | `/loans/{id}`                          | Update a loan                                                                                                  |
| DELETE | `/loans/{id}`                          | Delete a loan and its repayments (returns 204)                                                                 |
| POST   | `/loans/{id}/repayments`               | Add a repayment (returns 201)                                                                                  |
| DELETE | `/loans/{id}/repayments/{repaymentId}` | Delete a repayment (returns 204)                                                                               |
| POST   | `/import`                              | Replace the user's transactions and budgets, and their loans when the body has a `loans` list. All or nothing. |
| PUT    | `/account/password`                    | Change the password. Body `{ currentPassword, newPassword }`. Returns 204, `403` if the current password is wrong. |
| POST   | `/account/delete`                      | Delete the account and all its data. Body `{ password }`. Returns 204, `403` if the password is wrong.            |

Missing records return `404`. Invalid input returns `400`. A missing or expired token returns `401`. After 5 wrong passwords in a row on `/auth/login` or `/account/*`, that email is locked for 15 minutes and these endpoints return `429`.

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

### Auth body

```json
{ "email": "you@example.com", "password": "at-least-8-characters" }
```

The password must be 8 to 72 characters. Emails are stored in lowercase.

### Import body

```json
{
  "transactions": [
    {
      "description": "Groceries",
      "amount": 3200,
      "type": "expense",
      "category": "Food",
      "date": "2026-10-03"
    }
  ],
  "budgets": { "Food": 5000 },
  "loans": [
    {
      "direction": "lent",
      "person": "Ram",
      "amount": 1000,
      "date": "2026-10-03",
      "dueDate": null,
      "note": null,
      "repayments": [{ "amount": 400, "date": "2026-10-10", "note": null }]
    }
  ]
}
```

Each transaction follows the transaction rules above. Each limit must be greater than 0.

`loans` is optional. If it is left out or `null`, the user's existing loans are kept. If it is a list, even an empty one, it replaces them, repayments included. Each loan and repayment follows the rules in Loan body and Repayment body, and a loan's repayments must not add up to more than its amount.

### Budget body

```json
{ "limit": 5000 }
```

`limit` must be greater than 0.

### Loan body

```json
{
  "direction": "lent",
  "person": "Ram",
  "amount": 1000,
  "date": "2026-10-03",
  "dueDate": "2026-12-01",
  "note": "For rent"
}
```

- `direction` must be `lent` or `borrowed`.
- `person` must not be blank and can be up to 100 characters.
- `amount` must be greater than 0, and cannot be lowered below what is already repaid.
- `date` must be in `YYYY-MM-DD` format. `dueDate` uses the same format and is optional.
- `note` is optional and can be up to 500 characters.

A loan in a response also has `id`, `repaid` (the total of its repayments) and `repayments` (a list of `{ id, amount, date, note }`).

### Repayment body

```json
{ "amount": 400, "date": "2026-10-10", "note": null }
```

`amount` must be greater than 0 and no more than what is still outstanding on the loan. `date` must be in `YYYY-MM-DD` format. `note` is optional.

## Backend structure

Source is in `backend/src/main/java/com/niraj/backend/`.

| File                                                                     | Role                                                                 |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `TransactionController`, `BudgetController`                              | Handle HTTP requests                                                 |
| `TransactionService`, `BudgetService`                                    | Business rules and database access through the repositories          |
| `Transaction`, `Budget`                                                  | Data returned by the API                                             |
| `TransactionRequest`, `BudgetRequest`                                    | Input accepted by the API, with validation                           |
| `AuthController`, `AuthService`                                          | Register and login                                                   |
| `AccountController`, `AccountService`, `ChangePasswordRequest`, `DeleteAccountRequest` | Change password and delete account                       |
| `ImportController`, `ImportService`, `ImportRequest`                     | Bulk replace of a user's data from a backup                          |
| `SecurityConfig`, `JwtConfig`, `PasswordConfig`                          | Token checks, JWT signing, password hashing                          |
| `LoanController`, `RepaymentController`                                  | Handle loan and repayment requests                                   |
| `LoanService`, `RepaymentService`                                        | Loan rules, such as repayments never adding up to more than the loan |
| `Loan`, `Repayment`, `LoanRequest`, `RepaymentRequest`, `ImportLoan`     | Data returned and accepted by the API, with validation               |
| `LoanEntity`, `RepaymentEntity`, `LoanRepository`, `RepaymentRepository` | Database tables `loans` and `loan_repayments`, and access to them    |
| `UserEntity`, `UserRepository`                                           | User accounts                                                        |
| `HealthController`                                                       | Health check                                                         |
| `WebConfig`                                                              | CORS settings for the frontend                                       |
| `TransactionEntity`, `BudgetEntity`                                      | Database tables, created automatically on startup                    |
| `TransactionRepository`, `BudgetRepository`                              | Database access                                                      |


## Deployment

The backend runs on Render and the frontend on Netlify, both on free plans. The database is the Supabase project the app also uses locally, so testing on a local copy changes the live data.

### Backend (Render)

Create a Web Service from the GitHub repository:

| Setting | Value |
|---|---|
| Language | Docker |
| Branch | `main` |
| Region | Singapore (closest to the Supabase database) |
| Root Directory | empty |
| Dockerfile Path | `backend/Dockerfile` |
| Docker Build Context Directory | `backend` |
| Instance Type | Free |
| Health Check Path | `/api/health` |

Environment variables (names only; keep the values private):

| Name | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | The Supabase Session pooler JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | The database user |
| `SPRING_DATASOURCE_PASSWORD` | The database password |
| `APP_JWT_SECRET` | A long random secret, different from the local one |
| `APP_CORS_ORIGINS` | The Netlify address, with no trailing slash. Several can be given, separated by commas. |

Render sets `PORT` itself. The `Dockerfile` in `backend` builds the jar with Maven and runs it on a small JVM, to fit the free plan's memory.

### Frontend (Netlify)

Import the same repository:

| Setting | Value |
|---|---|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/dist` (the form shows the base directory as a prefix) |
| Environment variable `VITE_API_URL` | The Render address followed by `/api`, with no trailing slash |

`VITE_API_URL` is written into the build, so changing it needs a new deploy. `frontend/public/_redirects` makes a page refresh work on routes like `/loans`, and `frontend/.nvmrc` sets the Node version for the build.

Pushing to `main` redeploys both services.

## Current limitations

- The free hosting sleeps when idle, so the first request after a quiet period can take up to a minute. The Supabase project also pauses after a week without use and has to be restored from its dashboard.
- The login token is kept in the browser's `localStorage`.
- There are no automated tests.
- Login attempts are counted in memory, so the count resets when the backend restarts or the free hosting sleeps.
- Old login tokens stay valid until they expire, even after a password change.
- There is no forgot-password flow and the email address cannot be changed.
- Repayments cannot be edited, only deleted and added again.
