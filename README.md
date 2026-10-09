# MoneyMate – Your finance companion

A modern, responsive, fintech-grade Expense Tracker built with **React.js 19**, **TypeScript**, **Redux Toolkit**, **React Router 7**, and **Lucide Icons**.

---

## 🌟 Key Features

1. **Dashboard Overview**: Total Balance, Total Income, Total Expense, Current Month Expense, and Net Savings.
2. **Interactive SVG Charts**:
   - Monthly Income vs Expense (grouped animated bars with tooltips)
   - Expense by Category (interactive donut chart with legend and percentages)
   - Weekly Expense Trend (curved bezier area chart with daily data points)
   - Savings Trajectory (cumulative wealth curve)
3. **Monthly Expense Tracker (`/monthly`)**:
   - Month-by-month navigation (`<` Previous / Next `>`)
   - 31-day daily spending bar timeline
   - Month-over-Month (MoM) % variance
   - Peak spending day indicator
   - Filtered monthly transactions with instant search and CSV export
4. **Expense Management (`/expenses`)**: Add, Edit, Delete, View details, Filter by Category, Payment Method, and Date range, Sorting, and CSV Export.
5. **Income Management (`/income`)**: Add, Edit, Delete, Source breakdown, and CSV Export.
6. **Unified Transactions (`/transactions`)**: Consolidated statement of all cash inflows and outflows with pagination and multi-filtering.
7. **Budget Module (`/budget`)**: Category budgets with real-time visual progress bars, **80% threshold warnings**, and **100% exceeded notifications**.
8. **Financial Analytics (`/analytics`)**: Deep diagnostics for This Week, This Month, Last Month, Last 3 Months, This Year, and Custom Date Range.
9. **Recurring Expenses (`/recurring`)**: Subscriptions (Daily, Weekly, Monthly, Yearly) with days-remaining countdowns and 1-click payment logging.
10. **Authentication & RBAC**: Login, Register, Remember Me, Forgot Password, and **USER** / **ADMIN** roles with protected routes and admin console.
11. **Multi-Currency & Themes**: Real-time conversion across **₹ INR**, **$ USD**, **€ EUR**, **£ GBP**, plus **Dark Mode**, **Light Mode**, and **System Match**.
12. **Mobile-First UX**: Responsive mobile layout with bottom navigation (`Home | History | [+] | Budget | Profile`) and quick transaction action sheet.

---

## 🚀 Running Locally

```bash
cd expense-tracker
npm install
npm run dev
```

The application will start on **http://localhost:5174/**.

### Demo Credentials
* **User**: `alex@fintech.io` / `password123`
* **Admin**: `admin@fintech.io` / `admin123`
(One-click buttons are also available on the Login screen)
