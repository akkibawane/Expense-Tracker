# 💰 MoneyMate – Smart Expense Tracker & Finance Companion

[![Deploy to GitHub Pages](https://github.com/akkibawane/Expense-Tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/akkibawane/Expense-Tracker/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen?style=flat&logo=github)](https://akkibawane.github.io/Expense-Tracker/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)](https://vite.dev/)

A modern, responsive, fintech-grade personal finance and expense tracking web application built with **React 19**, **TypeScript**, **Redux Toolkit**, **React Router 7**, and **Lucide Icons**.

---

## 🌐 Live Demo

🔗 **Live Website**: [https://akkibawane.github.io/Expense-Tracker/](https://akkibawane.github.io/Expense-Tracker/)  
📁 **GitHub Repository**: [https://github.com/akkibawane/Expense-Tracker](https://github.com/akkibawane/Expense-Tracker)

---

## 🌟 Key Features

- **📊 Comprehensive Financial Dashboard**: Real-time calculations of Total Balance, Total Income, Total Expense, Current Month Expense, and Net Savings.
- **📈 Interactive Data Visualizations**:
  - Monthly Income vs. Expense (animated grouped bar charts with tooltips).
  - Expense by Category (interactive SVG donut chart with breakdown & percentages).
  - Weekly Spending Trend (curved bezier area chart with daily data points).
  - Savings Trajectory (cumulative wealth progression curve).
- **📅 Monthly Expense Tracker (`/monthly`)**:
  - Interactive month-by-month timeline navigation.
  - 31-day daily spending bar chart.
  - Month-over-Month (MoM) % variance and peak spending day indicator.
  - Filtered monthly transactions with instant search and CSV export.
- **💸 Expense Management (`/expenses`)**: Add, edit, delete, categorize, tag payment methods, filter by date ranges, sort, and export to CSV.
- **💵 Income Tracking (`/income`)**: Track multiple revenue streams, source breakdowns, and export earnings history.
- **💳 Unified Transaction Statement (`/transactions`)**: Consolidated view of all cash inflows and outflows with pagination and multi-filtering.
- **🎯 Smart Budgeting Module (`/budget`)**: Category budgets with dynamic visual progress bars, **80% warning alerts**, and **100% budget exceeded notifications**.
- **🔍 Deep Financial Analytics (`/analytics`)**: Timeframe diagnostics for This Week, This Month, Last 3 Months, This Year, and custom date ranges.
- **🔄 Recurring Subscriptions (`/recurring`)**: Manage daily, weekly, monthly, and yearly recurring expenses with days-remaining countdowns.
- **🔐 Authentication & RBAC**: Demo login with **USER** and **ADMIN** roles, protected routing, and admin management console.
- **🌍 Multi-Currency & Theming**: Instant currency switching across **₹ INR**, **$ USD**, **€ EUR**, and **£ GBP**, alongside **Dark Mode**, **Light Mode**, and **System Theme**.
- **📱 Mobile-First UX**: Responsive mobile bottom navigation bar (`Home | History | [+] | Budget | Profile`) and quick transaction action sheet.
- **🛡️ Resilient Error Boundary**: Graceful crash prevention with an interactive recovery card (Reload App / Reset Data).

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + React-Redux
- **Routing**: [React Router v7](https://reactrouter.com/) (HashRouter for static hosting compatibility)
- **Styling**: Modern Vanilla CSS with CSS custom properties (design tokens, glassmorphism, responsive breakpoints)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Effects**: Canvas Confetti
- **Deployment**: GitHub Pages via GitHub Actions

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/akkibawane/Expense-Tracker.git

# Navigate into the project folder
cd Expense-Tracker

# Install dependencies
npm install

# Start local dev server
npm run dev
```

The application will be live at: **http://localhost:5174/**

### Demo Credentials

One-click login buttons are provided on the login page, or use:
- **User**: `alex@fintech.io` / `password123`
- **Admin**: `admin@fintech.io` / `admin123`

---

## 📦 Building for Production

```bash
# Compile TypeScript and build production bundle
npm run build

# Preview production build locally
npm run preview
```

The output bundle will be generated in the `dist/` directory.

---

## 🚢 Deployment

This repository includes an automated GitHub Actions deployment workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Any push to `master` automatically triggers the build and deploys to GitHub Pages.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
