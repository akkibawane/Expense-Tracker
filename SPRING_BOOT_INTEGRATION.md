# MoneyMate Expense Tracker – Spring Boot Backend Architecture Guide

This document outlines the complete REST API backend integration matching the React.js frontend.

---

## 1. Tech Stack
* **Java 17+**
* **Spring Boot 3.x**
* **Spring Security 6.x** with JWT Stateless Authentication
* **Spring Data JPA / Hibernate**
* **MySQL 8.x**
* **Maven / Gradle**

---

## 2. MySQL Database Schema (DDL)

```sql
CREATE DATABASE IF NOT EXISTS expense_tracker_db;
USE expense_tracker_db;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    currency VARCHAR(10) DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata (IST)',
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Expenses Table
CREATE TABLE expenses (
    id VARCHAR(36) PRIMARY KEY,
    amount DECIMAL(12, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),
    date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    notes TEXT,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Income Table
CREATE TABLE income (
    id VARCHAR(36) PRIMARY KEY,
    amount DECIMAL(12, 2) NOT NULL,
    source VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    notes TEXT,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Budgets Table
CREATE TABLE budgets (
    id VARCHAR(36) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    monthly_limit DECIMAL(12, 2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_month_category (user_id, month, category)
);

-- 5. Recurring Expenses Table
CREATE TABLE recurring_expenses (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    frequency ENUM('Daily', 'Weekly', 'Monthly', 'Yearly') NOT NULL,
    next_payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 3. Spring Boot REST Endpoints

### Authentication Controller (`/api/auth`)
* `POST /api/auth/login` – Takes `{ email, password, rememberMe }`, validates against BCrypt password encoder, returns JWT Token & User Profile.
* `POST /api/auth/register` – Takes `{ fullName, email, mobileNumber, password, role }`, creates user record, returns JWT Token & User Profile.

### Expenses Controller (`/api/expenses`)
* `GET /api/expenses` – Returns user's expenses (supports `?startDate=&endDate=&category=&search=`).
* `POST /api/expenses` – Creates an expense and triggers automatic 80% / 100% budget threshold alerts.
* `PUT /api/expenses/{id}` – Updates existing expense.
* `DELETE /api/expenses/{id}` – Deletes expense record.

### Income Controller (`/api/income`)
* `GET /api/income` – Returns user's income streams.
* `POST /api/income` – Records new income.
* `PUT /api/income/{id}` – Updates income record.
* `DELETE /api/income/{id}` – Deletes income record.

### Unified Transactions Controller (`/api/transactions`)
* `GET /api/transactions` – Returns unified paginated cash flow statement (both income and expenses) sorted by date.

### Budgets Controller (`/api/budgets`)
* `GET /api/budgets` – Returns monthly category budgets.
* `POST /api/budgets` – Sets budget cap for a category in a month.
* `PUT /api/budgets/{id}` – Modifies budget limit.
* `DELETE /api/budgets/{id}` – Removes budget limit.

### Recurring Expenses Controller (`/api/recurring`)
* `GET /api/recurring` – Returns scheduled recurring payments.
* `POST /api/recurring` – Registers new subscription/bill.
* `PUT /api/recurring/{id}` – Updates recurring item or toggles active state.
* `DELETE /api/recurring/{id}` – Removes recurring item.

### Notifications Controller (`/api/notifications`)
* `GET /api/notifications` – Returns user's budget alerts and recurring payment reminders.
* `PUT /api/notifications/{id}` – Marks notification as read.
* `POST /api/notifications/read-all` – Marks all as read.
* `POST /api/notifications/clear` – Clears notification queue.

---

## 4. Connecting the Frontend to Spring Boot

In `src/services/api.ts`:
1. Change `USE_MOCK_FALLBACK = false`
2. Create `.env` file in the project root:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
3. Ensure CORS is enabled in Spring Boot:
   ```java
   @Configuration
   public class WebCorsConfig implements WebMvcConfigurer {
       @Override
       public void addCorsMappings(CorsRegistry registry) {
           registry.addMapping("/api/**")
                   .allowedOrigins("http://localhost:5173")
                   .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                   .allowedHeaders("*")
                   .allowCredentials(true);
       }
   }
   ```
