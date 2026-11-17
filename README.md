# Budget Tracker

A personal budget tracker for recording income and expenses, setting category budgets, and tracking money lent or borrowed. The app is called Artha. All dates use the Nepali (Bikram Sambat) calendar.

## What it does

### Dashboard
- Balance summary: income, expenses and what is left.
- Spending by category, shown as a breakdown and a pie chart, and a monthly trend.
- A comparison with the previous month and your top spending category.
- Budget progress for your categories, and a Lend / Borrow card showing what you are owed and what you owe.
- A month filter to look at one month or all time, and a button to open the monthly report.

### Transactions
- Add, edit and delete income and expenses, each with a category and a date. Filter the list to find them.
- A new transaction starts with your default category for its type. You can pick another one for any transaction.
- While you add an expense, you get a notice if it takes its category to 75% of its monthly budget or more, and a stronger one at 90% or over the limit. The notice never stops you from saving.

### Lend / Borrow
- Record money you lent or borrowed, with an optional due date and a history of repayments.
- Kept apart from your balance. Overdue items show on the Dashboard.

### Monthly report
- A summary of one month: income, expenses, balance, and a comparison with the month before.
- Expenses by category next to your budget limits, income by category, and the five largest expenses.
- Print it, or save it as a PDF from the print dialog.

### Profile
Opened from the **Profile** link in the header, with four tabs:

- **Account**: your email and Log out, default categories for expenses and for income, change password, and delete account (this removes all your data).
- **Budgets**: set a monthly spending limit per expense category. A limit saves when you leave the field. A card turns to a warning colour from 75% used, and to red from 90% or when over.
- **Categories**: add your own income and expense categories on top of the built-in ones, up to 30 of each type. Rename them, or delete them: their transactions move to Other and their budget is removed. Built-in categories cannot be changed.
- **Backup**: download your transactions, budgets, loans and custom categories as a file, and restore a file into your account. Restoring replaces what you have now. Older backup files still work and leave the parts they do not contain alone.

### Accounts
- Register and log in with an email and a password of 8 to 72 characters, with a button to show or hide the password.
- Each user sees only their own data.
- After five wrong passwords in a row, that email is locked for 15 minutes.
- After logging in you return to the page you were on.

### Other
- Light and dark themes.

## Good to know

- The free hosting goes to sleep when idle, so the first request after a quiet period can take up to a minute.
- There is no forgot-password option, and the email address cannot be changed.
- Repayments cannot be edited, only deleted and added again.
- You stay logged in until your login expires after 24 hours, even if you change your password.

## Tech stack

- **Frontend** (`frontend/`): React 19, Vite, React Router, Recharts
- **Backend** (`backend/`): Java 21, Spring Boot 4.1, Spring Data JPA, Spring Security with JWT login and BCrypt passwords
- **Database**: PostgreSQL on Supabase
- **Hosting**: Render (backend) and Netlify (frontend)