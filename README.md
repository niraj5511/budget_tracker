# Budget Tracker

A personal budget tracker for recording income and expenses, setting category budgets, and tracking money lent or borrowed. Dates use the Nepali (Bikram Sambat) calendar.

```
budget_tracker/
  frontend/   React app (Vite)
  backend/    Spring Boot REST API
```

## Features

- **Dashboard**: balance summary, category breakdown and pie chart, monthly trend, month-to-month comparison, top spending category, and a month filter. A Lend / Borrow card shows what you are owed and what you owe.
- **Transactions**: add, edit and delete income and expenses, with categories and filters.
- **Budgets**: set a spending limit per category, track progress, and get a warning while adding an expense that nears or passes the limit.
- **Categories**: add your own income and expense categories on top of the built-in ones. Rename them, or delete them (their transactions move to Other).
- **Lend / Borrow**: record money lent or borrowed, with an optional due date and repayment history. Kept apart from your balance.
- **Accounts**: register, log in, change your password, or delete your account and all its data. Each user sees only their own data.
- **Backup**: download your transactions, budgets, loans and custom categories as a file and restore it into your account.
- **Theme**: light and dark mode.

## Tech stack

- **Frontend**: React 19, Vite, React Router, Recharts
- **Backend**: Java 21, Spring Boot 4.1, Spring Data JPA, Spring Security (JWT, BCrypt)
- **Database**: PostgreSQL on Supabase

## Running locally

You need Node.js, JDK 21 and a Supabase project.

1. Create `backend/secrets.properties` (it is in `.gitignore`, do not commit it):

   ```
   spring.datasource.url=jdbc:postgresql://<host>:5432/postgres
   spring.datasource.username=<user>
   spring.datasource.password=<password>
   app.jwt.secret=<long random string, at least 32 characters>
   ```

   Use the Session pooler details from the Supabase Connect panel.

2. Start the backend from the `backend` folder (it reads `secrets.properties` from there):

   ```
   cd backend
   .\mvnw spring-boot:run
   ```

3. Start the frontend in a second terminal:

   ```
   cd frontend
   npm install
   npm run dev
   ```

The API runs at `http://localhost:8080` and the app at `http://localhost:5173`. `frontend/.env` holds `VITE_API_URL=http://localhost:8080/api`; restart `npm run dev` after changing it.

Local runs use whichever database `secrets.properties` points to. If that is the live project, testing locally changes live data.

## API

Base path `/api`. Every endpoint except `/health` and `/auth/*` needs the header `Authorization: Bearer <token>`.

| Method      | Path                                   | Description                                                                                             |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| GET         | `/health`                              | Health check                                                                                            |
| POST        | `/auth/register`                       | Create an account (201, `409` if the email is taken)                                                    |
| POST        | `/auth/login`                          | Returns `{ token, user }`. The token lasts 24 hours.                                                    |
| PUT         | `/account/password`                    | Body `{ currentPassword, newPassword }`. Returns 204, `403` if the current password is wrong.           |
| POST        | `/account/delete`                      | Body `{ password }`. Deletes the account and all its data. Returns 204, `403` if the password is wrong. |
| GET, POST   | `/transactions`                        | List or create transactions                                                                             |
| PUT, DELETE | `/transactions/{id}`                   | Update or delete a transaction                                                                          |
| GET         | `/budgets`                             | List budgets                                                                                            |
| PUT, DELETE | `/budgets/{category}`                  | Set or remove a category limit                                                                          |
| GET, POST   | `/loans`                               | List loans (with repayments) or create one                                                              |
| PUT, DELETE | `/loans/{id}`                          | Update or delete a loan                                                                                 |
| POST        | `/loans/{id}/repayments`               | Add a repayment                                                                                         |
| DELETE      | `/loans/{id}/repayments/{repaymentId}` | Delete a repayment                                                                                      |
| POST | `/import` | Replace the user's transactions and budgets, and loans or categories if the body has those lists. All or nothing. |

- Errors: `400` invalid input, `401` missing, expired or wrong login, `404` not found, `429` too many attempts.
- Custom category names are 1 to 30 characters, unique within income or expense (ignoring case, and not matching a built-in name), with at most 30 per type.
- Passwords are 8 to 72 characters. Emails are stored in lowercase.
- After 5 wrong passwords in a row on login or `/account/*`, that email is locked for 15 minutes.
- Amounts must be greater than 0. Dates use `YYYY-MM-DD`.

Example transaction body:

```json
{
  "description": "Groceries",
  "amount": 3200,
  "type": "expense",
  "category": "Food",
  "date": "2026-10-03"
}
```

## Deployment

The backend runs on Render and the frontend on Netlify, both on free plans. Pushing to `main` redeploys both.

**Render** (Web Service from the GitHub repository): language Docker, branch `main`, Dockerfile path `backend/Dockerfile`, build context `backend`, health check `/api/health`. Environment variables:

- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`: the Supabase Session pooler details
- `APP_JWT_SECRET`: a long random secret, different from the local one
- `APP_CORS_ORIGINS`: the Netlify address with no trailing slash (separate several with commas)

**Netlify**: base directory `frontend`, build command `npm run build`, publish directory `frontend/dist`. Set `VITE_API_URL` to the Render address followed by `/api`, with no trailing slash. It is built into the app, so changing it needs a new deploy. `frontend/public/_redirects` makes page refresh work on routes like `/loans`.

## Current limitations

- The free hosting sleeps when idle, so the first request can take up to a minute. The Supabase project pauses after a week without use and must be restored from its dashboard.
- The login token is kept in the browser's `localStorage`, and stays valid until it expires, even after a password change.
- Failed-login counts are kept in memory, so they reset when the backend restarts.
- No forgot-password, and the email address cannot be changed.
- No automated tests.
- Repayments cannot be edited, only deleted and added again.
- The built-in categories cannot be renamed or removed.
