# ServiceBuddy Appliance CRM: Complete Client User Guide

Welcome to your official **ServiceBuddy Appliance CRM** portal. This guide is designed to help the **System Administrator (Admin)** and the **Operation Manager (Manager)** understand and navigate the system, manage data records, monitor financials, track resources, and coordinate technicians.

---

## Table of Contents
1. [User Roles & Access Control (RBAC)](#1-user-roles--access-control-rbac)
2. [Sidebar Menu Tabs & Features](#2-sidebar-menu-tabs--features)
3. [Understanding Dashboard Statistics](#3-understanding-dashboard-statistics)
4. [Step-by-Step Data Creation Guide](#4-step-by-step-data-creation-guide)
5. [Bulk Spreadsheet Importing](#5-bulk-spreadsheet-importing)
6. [Duplicate Prevention & Validation Rules](#6-duplicate-prevention--validation-rules)

---

## 1. User Roles & Access Control (RBAC)

The CRM enforces strict role-based access control (RBAC) to ensure operational security. The two active roles are:
* **System Administrator (Admin)**: Full control over all system functions, configuration, resources, and critical financial records (including deletes).
* **Operation Manager (Manager)**: Operational coordinator. Can view metrics, create and modify bookings, customers, leads, contacts, and inventory, but is restricted from editing financial ledgers, performing deletions, or viewing administrative resources.

### Detailed Role Access Matrix

| Feature Module | Admin Access | Manager Access | Notes |
| :--- | :---: | :---: | :--- |
| **Dashboard Overview** | Full Financials & Operations | Operations Only (No Profit/Revenue) | Manager sees operational stats cards only. |
| **Bookings & Customers** | Create, Read, Update, Delete | Create, Read, Update | Managers cannot delete records. |
| **Leads Funnel** | Create, Read, Update, Delete | Create, Read, Update | Managers cannot delete leads. |
| **Contacts Directory** | Create, Read, Update, Delete | Create, Read, Update | Managers cannot delete contacts. |
| **Inventory Spares** | Create, Read, Update, Delete | Create, Read, Update | Managers cannot delete catalog spares. |
| **Asset Manager** | Create, Read, Update, Delete | Read Only | Managers have read-only view of assets. |
| **Employees Roster** | Create, Read, Update, Delete | Read Only | Managers have read-only view of employees. |
| **Technician Registry** | Create, Read, Update, Delete | Onboard, Read, Status Toggle | Managers cannot delete technician profiles. |
| **Expenditures Ledger** | Create, Read, Update, Delete | **No Access** | Hidden from Manager sidebar. |
| **Outstanding Dues** | Create, Read, Update, Delete | **No Access** | Hidden from Manager sidebar. |
| **Technician Payouts** | Create, Read, Update, Delete | **No Access** | Hidden from Manager sidebar. |
| **Data Importer** | Full Spreadsheet Upload | Full Spreadsheet Upload | Both roles can migrate bulk spreadsheet data. |
| **Reports Center** | Full Analytics Views | Full Analytics Views | Both roles can view operations/sales charts. |
| **Reminders Board** | View & Act (Dismiss alerts) | View & Act (Dismiss alerts) | Shared operations notifications board. |

---

## 2. Sidebar Menu Tabs & Features

The sidebar is divided into four main operational categories:

### Operations Group
* **Overview (Dashboard)**: The interactive dashboard home. Displays summaries, notifications, and dynamic breakdowns.
* **Bookings & Customers**: Where you coordinate service work orders. Displays active bookings, appliances, assignment status, and customer contact registries.
* **Leads Funnel**: Track inbound service requests from Google, Facebook, referrals, and walk-ins before they are converted into formal bookings.
* **Contacts**: A directory for partners, wholesale dealers, parts suppliers, and business contacts.

### Financials Group (Restricted to Admin)
* **Expenditures**: The business expense ledger. Log rent, utility costs, tool purchases, refunds, and subscriptions.
* **Outstanding Dues**: Log running accounts payable or short-term liabilities that require scheduled payments.
* **Technician Payouts**: The commission ledger for service technicians. Records completed jobs, advances, extra incentives, and payouts.

### Resources Group
* **Inventory Spares**: Spares stock ledger. Monitor units in stock, costs, selling prices, and reorder alerts.
* **Asset Manager**: Track office assets, tools, laptops, and diagnostic hardware. (Managers: Read-Only).
* **Employees**: Staff roster of internal customer support agents, managers, and admins. (Managers: Read-Only).
* **Technicians**: Onboard and inspect active field service technicians, their current outstanding dues, and advances.

### Analytics Group
* **Reports Center**: Visual analytics tracking monthly revenue, job completion percentages, and expense categories.
* **Reminders**: A centralized system notification center listing urgent items (e.g., unpaid payouts, low stock spares, pending due dates).
* **Data Importer**: Bulk spreadsheet import panel for onboarding existing excel tables in one click.

---

## 3. Understanding Dashboard Statistics

Dashboard summary cards are designed to prevent clutter by hiding details until clicked. Clicking a card reveals a secondary breakdown section.

### Admin Dashboard (Financials & Operations)

1. **Total Revenue** (Green Accent)
   * *What it means*: The aggregate amount charged to clients across all logged work orders.
   * *Detailed breakdown details*: 
     - **Spare Parts Sales**: Revenue generated from parts used in repairs.
     - **Technician Service Income**: Amount allocated to technicians' service charges.
     - **Company Core Margin**: Company's earnings before operational expenditures.
2. **Net Profit** (Mint/Rose Accent)
   * *What it means*: Total Revenue minus all Expenditures and Outstanding Dues.
   * *Detailed breakdown details*:
     - **Company Core Margin**: Income after spares/tech payout.
     - **Total Expenditures**: Sum of logged operational expenses.
     - **Outstanding Liabilities**: Running dues logged.
     - **Net Cash Balance**: Running cash position.
3. **Operating Expenses** (Rose Accent)
   * *What it means*: Cumulative expenses logged in the Expenditure tab.
   * *Detailed breakdown details*: Aggregated categories (Working expenses, Office expenses, Maintenance, Software subscriptions, Refunds, etc.).
4. **Operations & Inventory** (Amber Accent)
   * *What it means*: Live status updates of work orders and spare parts value.
   * *Detailed breakdown details*: Total bookings count, completed jobs, pending jobs, active technician count, and overall spares inventory cash value.

### Manager Dashboard (Operations Only)

1. **Bookings Overview**
   * *What it means*: Active work requests logged.
   * *Detailed breakdown details*: Total bookings count, job completion rate %, pending jobs count, active field technician count, and average booking ticket value.
2. **Customers & Leads**
   * *What it means*: Customer database counts and inbound sales opportunities.
   * *Detailed breakdown details*: Total registered clients, repeat customer count, customer retention rate %, lead conversion rate %, and business contacts directory count.
3. **Staff & Inventory**
   * *What it means*: Asset and stock levels.
   * *Detailed breakdown details*: Spares catalog item count, out-of-stock warnings, low-stock reorder warnings, registered office assets count, and total onboarded technicians.

---

## 4. Step-by-Step Data Creation Guide

### A. Registering a Customer
1. Navigate to **Bookings & Customers** tab.
2. Under the Customers list (lower section), click **"Register New Customer"**.
3. Enter the client's **Name**, **Mobile Number** (required, 10 digits), **Email** (optional), **Address**, **Area/Locality**, and **Customer Type** (Regular, Premium, or Commercial).
4. Click **"Register Customer"**. 

*Note: You can also create a new customer directly on the fly while creating a booking.*

### B. Creating a Service Booking
1. Navigate to **Bookings & Customers** tab.
2. Click **"New Booking Request"** (opens a full-screen drawer).
3. Under **Client Information**, choose whether it is an existing client or a new client:
   - **Existing Client**: Search for the customer by name, mobile, or address in the search box. Select the customer card (turns green).
   - **New Client**: Fill in the name, mobile number, and address fields directly.
4. Fill in **Service Details**: Date, Appliance Type, Brand Name, Service Type (Installation, Repair, Maintenance, Audit, Cleaning), and Issue Description.
5. Fill in **Staff Assignment**: Select an active technician from the dropdown list.
6. Fill in **Financial Details**: 
   - **Total Consumer Charge**: The final price quoted to the client.
   - **Spare Cost**: Cost of materials used.
   - **Technician Payout**: Payout owed to the technician for the job.
   *The system automatically calculates the remaining Company Margin.*
7. Set the **Work Status** (Not Started, In Progress, Completed) and **Warranty Period** (months).
8. Click **"Log Booking Request"**.

### C. Logging a Lead
1. Navigate to **Leads Funnel** tab.
2. Click **"Log Inbound Lead"**.
3. Fill in the Customer's **Name**, **Mobile**, **Appliance**, **Lead Source** (Google, WhatsApp, Referral, Facebook, Walk-in), **Lead Status** (Cold, Warm, Hot), **Budget Estimate**, and **Remarks**.
4. Click **"Log Lead"**.
5. *Action*: When a lead converts into a customer, click the **"Convert"** button on their lead card to automatically pre-populate a new booking form.

### D. Adding Spares to Inventory
1. Navigate to **Inventory Spares** tab.
2. Click **"Add Catalog Spare"**.
3. Enter the **Spare Name**, **SKU/Part Code** (must be unique), **Unit Cost** (purchase price), **Unit Price** (selling price), **Stock Quantity** (starting units), **Reorder Level** (alert threshold), **Supplier Name**, and **Storage Location**.
4. Click **"Add Spare Item"**.

### E. Registering Assets (Admin Only)
1. Navigate to **Asset Manager** tab.
2. Click **"Register Asset"**.
3. Enter **Asset Name**, **Serial Number/ID**, **Purchase Date**, **Purchase Price**, **Storage Location**, **Assigned Staff/Owner**, and **Notes**.
4. Click **"Register Asset"**.

### F. Onboarding Employees (Admin Only)
1. Navigate to **Employees** tab.
2. Click **"Onboard Employee"**.
3. Enter **Employee Name**, **Employee ID/Code** (unique), **Role** (Manager, Admin, Receptionist, Accountant), **Mobile Number**, **Email**, **Joining Date**, and **Salary**.
4. Click **"Onboard Employee"**.

### G. Onboarding Technicians (Admin & Manager)
1. Navigate to **Technicians** tab.
2. Click **"Onboard Technician"**.
3. Enter **Technician Name**, **Mobile Number**, **Location/Service Area**, and select **Primary Repair Skills** (Refrigeration, Washing Machines, HVAC, etc.).
4. Click **"Onboard Technician"**.

### H. Logging expenditures (Admin Only)
1. Navigate to **Expenditures** tab.
2. Click **"Log Business Expense"**.
3. Enter **Expense Item**, **Category** (Working expenses, Office expenses, maintenance, etc.), **Amount**, **Date**, **Beneficiary/Merchant** (optional), and **Remarks**.
4. Click **"Log Expense"**.

### I. Logging Outstanding Liabilities (Admin Only)
1. Navigate to **Outstanding Dues** tab.
2. Click **"Log Liability Outstanding"**.
3. Enter **Recipient/Entity**, **Amount**, **Date Logged**, **Due Date**, **Reason/Description**, and **Priority** (Low, Medium, High, Critical).
4. Click **"Log Outstanding Due"**.

### J. Logging Technician Payouts (Admin Only)
1. Navigate to **Technician Payouts** tab.
2. Click **"Log Technician Payout"**.
3. Select the **Technician** from the dropdown list.
4. Input **Log Date**, **Daily Earnings** (base amount earned from completed jobs), **Advance Deductions** (deducted from any running advance they took), **Extra Pay/Incentive** (bonus pay), and **Paid Amount** (cash paid out right now).
5. The system automatically computes the remaining **Due Amount**.
6. Select **Payment Status** (Settled or Pending) and enter a **Payment Reference/Method** (Cash, UPI, GPay, Bank Transfer).
7. Click **"Log Payout Ledger"**.

---

## 5. Bulk Spreadsheet Importing

If you have existing business worksheets in Excel or Google Sheets, you can import them all at once.

1. Navigate to the **Data Importer** tab.
2. Select your **Module Target** (e.g., Customers, Bookings, Technicians, Inventory Spares, etc.).
3. Choose your file (must be `.xlsx` or `.csv`).
4. **Header Alignment**: Ensure the columns in your spreadsheet match the expected headers (case-insensitive).
5. Click **"Run Import"**.
6. Review the live importer logs below the button. The system will display the count of successfully imported records, as well as warning logs for skipped duplicates.

---

## 6. Duplicate Prevention & Validation Rules

To maintain high data integrity, the CRM automatically runs validation checks. If a record is flagged as a duplicate, the CRM will prevent creation/updates or skip the record during spreadsheet imports.

* **Customers**: Blocked if a customer with the same **Name** and **Mobile Number** already exists.
* **Bookings**: Blocked if a duplicate booking is entered for the same **Customer Name**, **Date**, **Appliance**, and **Service Type**.
* **Technicians**: Blocked if a technician with the same **Name** and **Mobile Number** already exists.
* **Inventory Spares**: Blocked if a spare item with the same **Part Code (SKU)** or **Name** already exists.
* **Expenditures**: Blocked if an expense is logged with the same **Item Name**, **Amount**, **Date**, and **Beneficiary**.
* **Outstanding Dues**: Blocked if a liability is logged with the same **Recipient**, **Amount**, **Reason**, and **Date**.
* **Leads**: Blocked if a lead is logged with the identical **Client Name**, **Mobile**, and **Appliance**.
* **Contacts**: Blocked if a directory contact with the same **Name** and **Mobile Number** exists.
* **Assets**: Blocked if an asset is registered with the same **Asset Name** and **Purchase Date**.
* **Employees**: Blocked if an employee with the same **Name** and **Mobile Number** exists.
* **Technician Payouts**: Blocked if a payout is logged with the same **Technician**, **Date**, **Daily Earnings**, **Advance Deduction**, and **Extra Pay**.
