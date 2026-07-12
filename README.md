# AssetFlow 📦

**Next-Generation Enterprise Asset & Resource Management System**

![AssetFlow Mockup](https://app.excalidraw.com/l/65VNwvy7c4X/5ceOBMjbDby)

AssetFlow is a centralized, highly scalable ERP platform engineered to modernize how organizations track, allocate, and maintain their physical assets and shared resources. By replacing fragmented spreadsheets and manual paper logs with a unified digital ecosystem, AssetFlow delivers real-time visibility into asset lifecycles, condition tracking, and resource utilization.

---

## 📑 Table of Contents
1. [The Problem](#-the-problem)
2. [Our Solution & Vision](#-our-solution--vision)
3. [Core Modules](#-core-modules)
4. [Role-Based Access Control (RBAC)](#-role-based-access-control)
5. [System Architecture](#-system-architecture)
6. [Tech Stack](#-tech-stack)
7. [Local Setup & Installation](#-local-setup--installation)
8. [Hackathon Demo Setup](#-hackathon-demo-setup)
9. [Future Roadmap](#-future-roadmap)

---

## 🛑 The Problem
Modern organizations—whether corporate offices, hospitals, schools, or factories—struggle with asset tracking. Common pain points include:
- **Ghost Assets:** Equipment that is recorded on the books but physically missing.
- **Double-Booking:** Employees scheduling the same shared resource (e.g., conference rooms, projectors) simultaneously.
- **Reactive Maintenance:** Assets breaking down unexpectedly due to a lack of structured repair workflows.
- **Siloed Data:** Departments tracking their own equipment in isolated spreadsheets, leading to massive inefficiencies during organization-wide audits.

## 🌟 Our Solution & Vision
AssetFlow is designed to deliver core ERP functionality through a clean, intuitive interface. We abstract away the heavy complexities of accounting and invoicing, focusing purely on **operational lifecycle management**. 

Our vision is a system where an asset's journey—from initial registration to final disposal—is transparent, heavily audited, and effortlessly managed.

---

## ⚙️ Core Modules

### 1. Asset Lifecycle Management
Track an asset through discrete state transitions:
`Available` ↔ `Allocated` ↔ `Reserved` ↔ `Under Maintenance` → `Retired` / `Lost` / `Disposed`

### 2. Conflict-Free Resource Booking
A sophisticated calendar and time-slot booking engine for shared resources. The system mathematically prevents time-slot overlaps, ensuring that rooms, vehicles, or specialized equipment are never double-booked.

### 3. Kanban Maintenance Workflow
When an asset breaks, employees raise a request. The system routes the request through a structured approval pipeline:
`Pending` → `Approved` → `Technician Assigned` → `In Progress` → `Resolved`
*Assets are automatically locked from being booked while under maintenance.*

### 4. Scheduled Auditing Cycles
Admins can spawn targeted audit cycles (e.g., "Q3 IT Department Audit"). Assigned auditors sweep through departments, verifying physical presence. The system auto-generates discrepancy reports for missing or damaged items, closing the loop on inventory shrinkage.

---

## 🛡️ Role-Based Access Control

AssetFlow enforces strict security perimeters based on organizational roles:

- **Admin:** Manages master data (Departments, Asset Categories). Assigns roles to employees. Spawns organization-wide Audit Cycles. Accesses global KPI analytics.
- **Asset Manager:** The operational heart of the system. Registers new assets, approves or rejects transfer requests, sanctions maintenance operations, and resolves audit discrepancies.
- **Department Head:** Has a siloed view of assets allocated specifically to their department. Approves internal transfers and books resources on behalf of their team.
- **Employee:** The end-user. Can view assets assigned to them, book shared resources for personal use, and raise maintenance tickets for broken equipment.

---

## 🏗️ System Architecture

AssetFlow employs a decoupled architecture optimized for rapid iteration and scalability:
- **Frontend (Client):** A blazing-fast Single Page Application (SPA) built with React and Vite. It utilizes local state caching for optimistic UI updates, ensuring the app feels instantaneous.
- **Backend/BaaS:** Powered by Supabase.
  - **PostgreSQL:** Fully relational database enforcing strict foreign key constraints between Assets, Users, and Bookings.
  - **GoTrue Auth:** Secure JWT-based authentication.
  - **Storage:** Blob storage for asset imagery and maintenance documentation.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite |
| **Routing** | React Router DOM v7 |
| **Styling** | Vanilla CSS (CSS Variables, Flexbox/Grid, Dark Mode) |
| **Icons** | Lucide React |
| **Database & Auth** | Supabase (PostgreSQL) |

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/Kushalsheth7/AssertFlow.git
cd AssertFlow/frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of the `frontend` directory:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...<your-legacy-anon-key>
```
*(Note: Ensure you are using the legacy JWT Anon Key from Supabase, not the new `sb_publishable` format, to avoid CORS preflight rejections).*

### 3. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 👨‍💻 Hackathon Demo Setup (Important)

To ensure a flawless presentation during the hackathon, we have engineered a **failsafe local mock-data bypass**. This prevents the app from failing due to external network blocks (like conference Wi-Fi firewalls) or Supabase Free-Tier rate limits.

**To trigger the fully populated demo environment:**
1. Navigate to the Login screen.
2. Enter the following credentials:
   - **Email:** `admin@assetflow.com`
   - **Password:** `AssetFlow2026!`
3. Click Login.

*The system will instantly intercept these credentials, bypass external network calls, and hydrate the Redux/Context store with a massive, rich dataset (including MacBooks, Dell servers, active maintenance tickets, and populated Kanban boards) so you can seamlessly demonstrate every feature to the judges.*

---

## 🔮 Future Roadmap

- **QR/Barcode Scanning:** Native mobile integration to scan hardware tags directly into the audit workflow.
- **IoT Integration:** Real-time location tracking (RTLS) for high-value mobile assets.
- **Predictive Maintenance:** Machine learning models that analyze failure frequency to recommend preventative maintenance before a breakdown occurs.

---
*Architected and Built for the Hackathon.* 🚀
