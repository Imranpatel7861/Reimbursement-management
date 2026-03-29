<div align="center">

<h1>ExpenseFlow</h1>
<h3>Intelligent Reimbursement Management — Reimagined</h3>

<p>
  <img src="https://img.shields.io/badge/Stack-MERN%20%2B%20PostgreSQL-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/OCR-Powered-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Multi--Level-Approvals-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge" />
</p>

<p><em>Built at Odoo Hackathon · Full-Stack · Real-World System Design</em></p>

</div>

---

## The Problem We're Solving

Every organization deals with this: an employee submits a paper receipt. It gets stapled to a form. It lands on a manager's desk — maybe. It gets approved — eventually. Finance reconciles it — manually.

This process is **slow, opaque, and error-prone.**

ExpenseFlow replaces it with an end-to-end digital platform that automates receipt reading, routes expenses through configurable approval chains, and gives every stakeholder real-time visibility.

---

## What Makes This Different

| Pain Point | Our Solution |
|---|---|
| Manual data entry from receipts | OCR auto-extracts amount, date, merchant |
| Rigid, one-size-fits-all approvals | Configurable multi-step workflow engine |
| No audit trail | Full approval history with comments |
| Currency confusion for global teams | Live exchange rate conversion per submission |
| Black-box approval decisions | Rule engine with ALL / Percentage / Specific / Hybrid modes |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                     │
│        Employee Portal │ Manager Dashboard │ Admin Console      │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST API
┌──────────────────────────────▼──────────────────────────────────┐
│                    BACKEND (Node.js + Express)                  │
│                                                                 │
│   ┌──────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│   │ OCR Module   │  │  Expense Service│  │  Approval Engine  │  │
│   │ (Receipt     │  │  (Submission &  │  │  (Rule Evaluator) │  │
│   │  Parsing)    │  │   History)      │  │                   │  │
│   └──────┬───────┘  └────────┬────────┘  └────────┬──────────┘  │
└──────────┼──────────────────┼─────────────────────┼─────────────┘
           │                  │                     │
   ┌───────▼───────┐  ┌───────▼──────────────────────▼──────────┐
   │ OCR.space API │  │           PostgreSQL Database           │
   └───────────────┘  └─────────────────────────────────────────┘
```

---

## Core Features

### 1. OCR-Powered Expense Entry

Upload a receipt photo and let the system do the work.

- Extracts **amount, date, merchant name, and expense type** using OCR
- Auto-populates the submission form
- User retains full edit control before submitting — *OCR assists, never overrides*

### 2. Multi-Currency Expense Submission

Employees submit in **any currency**; approvers see amounts in the company's default currency.

- Country & currency data via `restcountries.com`
- Real-time conversion via `exchangerate-api.com`
- Company currency auto-set on signup based on country

### 3. Configurable Approval Workflow

Admins define the exact approval chain for their organization:

```
Step 1 → Manager (if IS_MANAGER_APPROVER is enabled)
Step 2 → Finance
Step 3 → Director
```

- Sequential enforcement — step N only unlocks after step N-1 resolves
- Each approver can approve or reject with comments
- Full audit trail maintained per expense

###  4. Intelligent Rule Engine

Four approval modes, fully configurable:

| Rule Type | How It Works |
|---|---|
| **ALL** | Every approver must approve |
| **Percentage** | e.g., 60% of approvers approve → auto-approved |
| **Specific Approver** | e.g., CFO approval → overrides and auto-approves |
| **Hybrid** | Combine both — e.g., 60% OR CFO |

Rules can stack with multi-step flows for maximum flexibility.

###  5. Role-Based Access Control

| Role | Capabilities |
|---|---|
| **Admin** | Create company on signup, manage users & roles, configure approval rules, view all expenses, override approvals |
| **Manager** | View team expenses, approve/reject with comments, see amounts in company currency |
| **Employee** | Submit expenses, view own history, track approval status in real time |

---

##  Database Schema

```sql
-- Core Tables
expenses          (id, employee_id, amount, currency, date, category, description, status, receipt_url)
approval_flows    (id, company_id, name)
approval_steps    (id, flow_id, step_order, role)
approval_records  (id, expense_id, approver_id, step_order, status, comment, created_at)
approval_rules    (id, flow_id, type, threshold_pct, special_role)
users             (id, company_id, name, email, role, manager_id)
companies         (id, name, country, default_currency)
```

---

##  API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ocr` | Extract structured data from receipt image |
| `POST` | `/expenses` | Submit a new expense claim |
| `GET` | `/expenses` | List expenses (filtered by role) |
| `GET` | `/approvals/pending` | Fetch expenses awaiting action |
| `POST` | `/approvals/:id` | Approve or reject an expense step |
| `POST` | `/approval-config` | Create/update approval workflow config |
| `GET` | `/approval-config` | Retrieve current config |

---

##  Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- OCR.space API key (free tier available)

### 1. Clone & Install

```bash
git clone <repo-url>
cd expenseflow

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=expenseflow
DB_PORT=5432
OCR_API_KEY=your_ocr_space_key
```

### 3. Run

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit `http://localhost:5173`. On first signup, your company and admin account are auto-provisioned.

---

##  End-to-End Flow

```
1.  Employee uploads receipt
         │
2.  OCR extracts text → parsing layer structures it
         │
3.  Form auto-fills (editable)
         │
4.  Employee submits → status: PENDING
         │
5.  Approval engine triggers Step 1
         │
6.  Approver reviews → Approves / Rejects with comment
         │
7.  Rule engine evaluates (ALL / % / SPECIFIC / HYBRID)
         │
8.  If approved → Step 2 unlocks ... → Final: APPROVED
    If rejected → Expense marked REJECTED, employee notified
```

---

##  Design Philosophy

- **OCR is assistive, not authoritative** — users always review extracted data before submitting
- **Modularity first** — approval rules and workflow steps are independently configurable
- **Auditability by design** — every action is timestamped and stored
- **Role isolation** — employees never see each other's data; managers see only their team

---

##  Testing the System

1. Sign up → company + admin auto-created
2. Create employees and managers from Admin console
3. Upload a sample receipt → verify OCR autofill accuracy
4. Submit an expense → observe approval chain activation
5. Approve from Manager account → confirm step progression
6. Test rule edge cases: percentage-only, CFO override, hybrid

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| OCR | OCR.space API |
| Currency | RestCountries API + ExchangeRate API |

---

## 👨 Authors

Built with ❤️ for the Odoo Hackathon

---

<div align="center">
  <sub>MIT License · ExpenseFlow · Odoo Hackathon</sub>
</div>