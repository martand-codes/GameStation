<div align="center">

# 🎮 GameStation Core

**Enterprise-Grade Distributed Gaming Marketplace, Commerce Engine & Telemetry Platform**

*Engineered with React 19, TypeScript, Node.js, PostgreSQL 18, Docker, and W3C OpenTelemetry.*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL_18-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma_6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Stripe](https://img.shields.io/badge/Stripe_API-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

<p align="center">
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-visual-engineering-showcase">Visual Tour</a> •
  <a href="#-deep-dive-engineering-highlights">Deep Dives</a> •
  <a href="#-quickstart--development-saga">Quickstart</a> •
  <a href="#-performance-benchmarks">Benchmarks</a>
</p>

</div>

---

## 🏛️ Executive Overview

**GameStation** is an end-to-end gaming commerce and real-time distribution ecosystem built to solve core distributed system challenges: **eventual consistency across distributed transactions**, **sub-millisecond search indexing**, **in-house observability profiling**, and **high-concurrency real-time state synchronization**.

Rather than relying on basic CRUD patterns, GameStation implements production-level architectural primitives:
- **Distributed Saga Pattern Orchestrator**: Handles multi-step checkouts across non-transactional boundaries (Stripe, wallet credits, DRM license issuance, and developer revenue splits) with automatic backward compensation loops on hardware faults.
- **In-Memory Prefix Trie & Okapi BM25 Search Engine**: Sub-2ms text retrieval with Levenshtein distance fuzzy spell-checking, zero database disk I/O, and prefix autocompletion.
- **Custom Application Performance Monitoring (APM)**: Native W3C OpenTelemetry-compliant tracing engine utilizing Node.js `AsyncLocalStorage` to profile Express middleware, Prisma query execution, and render visual FlameGraphs.
- **Bi-Directional WebSocket Squad Engine**: Socket.IO-powered real-time user presence, friend transmission channels, and platform event streaming.
- **Multi-Stage Docker & Edge Nginx Routing**: 131 MB total production container footprint with Nginx reverse proxying, gzip compression, and sub-40 kB initial frontend client bundles.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Tier (React 19 + Vite SPA)"]
        UI["Cyberpunk UI / Route-Splitting"]
        State["Context State (Cart, Social, Telemetry)"]
        WS_Client["Socket.IO Client"]
    end

    subgraph Edge ["Edge Tier (Nginx Alpine)"]
        Proxy["Nginx Reverse Proxy & Static Cache"]
        Gzip["Gzip Engine & SPA Fallback"]
    end

    subgraph Gateway ["Application Gateway (Node.js + Express v5)"]
        Auth["JWT & Multi-Role RBAC (4 Tiers)"]
        RateLimit["Slotted IP Rate Limiters"]
        APM["AsyncLocalStorage APM Tracing Engine"]
    end

    subgraph Core ["Platform Core Services"]
        Saga["Saga Transaction Orchestrator & Chaos Rig"]
        Trie["In-Memory Prefix Trie & BM25 Search"]
        WS_Server["Socket.IO Squad & Event Server"]
        TelemetrySvc["Telemetry & FlameGraph Collector"]
    end

    subgraph Persistence ["Persistence & External Gateways"]
        PG[("PostgreSQL 18 (Prisma v6)")]
        Stripe["Stripe Checkout Gateway"]
    end

    UI --> Proxy
    WS_Client --> Proxy
    Proxy -->|Static Assets| Gzip
    Proxy -->|/api/* Requests| Gateway
    Proxy -->|/socket.io/* WSS| WS_Server

    Gateway --> Auth
    Auth --> RateLimit
    RateLimit --> APM
    APM --> Core

    Saga -->|Atomicity & Compensation| PG
    Saga -->|Payment Webhooks| Stripe
    Trie -->|Sub-2ms Memory Reads| Gateway
    WS_Server -->|State Broadcast| Client
    TelemetrySvc -->|Hierarchical Spans| PG
```

---

## 📸 Visual Engineering Showcase

### 1. Storefront & Algorithmic Search
| Cyberpunk Storefront (Ring-3 Runtime) | In-Memory Prefix Trie Search (<2ms BM25) |
|:---:|:---:|
| ![Storefront](docs/screenshots/Store.png) | ![Search Engine](docs/screenshots/Search_Engine.png) |
| *Real-time catalog displaying published titles, promotional banners, and active player telemetry.* | *Instant prefix search with Levenshtein fuzzy distance ("Did you mean: red") and BM25 token relevance.* |

---

### 2. Distributed Transactions & Fault Tolerance
| Distributed Saga & Chaos Simulator | Stripe Hosted Checkout Sandbox |
|:---:|:---:|
| ![Saga Orchestrator](docs/screenshots/Toast_Notification.png) | ![Stripe Checkout](docs/screenshots/Stripe_Checkout.png) |
| *Fault tolerance test rig showing automatic backward compensation rollbacks when simulated faults trigger.* | *Stripe payment integration with idempotent webhook verification and license issuance.* |

---

### 3. Native APM Tracing & Platform Observability
| Custom APM FlameGraph Tracing | Infrastructure Telemetry Radar |
|:---:|:---:|
| ![FlameGraph](docs/screenshots/Flam_Graphs.png) | ![Telemetry Radar](docs/screenshots/Live_Database_Sync.png) |
| *W3C OpenTelemetry span breakdown: visual hierarchy profiling Express routes down to Prisma SQL queries.* | *Live execution latency waterfall monitoring P50, P95, and P99 metrics with subsystem time allocation.* |

---

### 4. Governance, Treasury & Developer Studio
| Sovereign Owner Cockpit | Sovereign Financial Ledger (30% Take-Rate) |
|:---:|:---:|
| ![Owner Dashboard](docs/screenshots/Owner_Dashboard.png) | ![Owner Treasury](docs/screenshots/Owner_Treasury.png) |
| *Executive command center with gross volume telemetry, emergency controls, and live platform events.* | *Dynamic platform take-rate slider (30%) with itemized cryptographic settlement audit trail.* |

| Developer 5-Axis Quality Benchmark Radar | Operations Certification Command Center |
|:---:|:---:|
| ![Developer Portal](docs/screenshots/Devloper_Saga.png) | ![Admin Dashboard](docs/screenshots/Admin_Dashboard.png) |
| *Studio telemetry with 5-axis benchmark radar (Optimization, Fun Factor, Sound, Visuals, Netcode).* | *Level-1 Operator desk monitoring submission queues, 24h review velocity, and SLA certification trends.* |

---

### 5. Real-Time Squad Networking & UX Polish
| WebSocket Squad Communications | Cyberpunk Suspense Skeleton Loaders |
|:---:|:---:|
| ![Chat Feature](docs/screenshots/Chat_Feature.png) | ![Skeleton Loading](docs/screenshots/Skeleton_Loading.png) |
| *Bi-directional Socket.IO squad transmissions, friend requests, and active presence status indicators.* | *Zero Cumulative Layout Shift (CLS) with multi-tier React.lazy() Suspense skeleton boundaries.* |

---

## ⚡ Deep-Dive Engineering Highlights

### 1. Distributed Saga Orchestration Pattern & Chaos Rig
In e-commerce checkout, distributed transactions spanning external services (Stripe), local wallets (points), DRM license databases, and developer accounts cannot rely on traditional 2-Phase Commit (2PC) due to blocking network dependencies.

GameStation implements a custom **Saga Orchestrator**:
- **Forward Steps**:
  1. `ValidateInventoryAndLock`: Idempotently verifies game license availability.
  2. `ProcessPaymentOrDeductWallet`: Coordinates Stripe payment intents or deducts points from the user's wallet.
  3. `IssueDRMLicense`: Generates cryptographic activation records in the player's library.
  4. `ReconcileDeveloperRoyalty`: Disburses the 70% publisher cut while crediting the platform's 30% sovereign treasury.
- **Backward Compensation Loop**:
  If step 3 or 4 fails (e.g. database network partition), the Saga engine triggers automatic reverse compensation: wallet funds are refunded, provisional licenses are revoked, and transaction state transitions to `COMPENSATED (ROLLED BACK)`.
- **Chaos Simulator Built-In**: The admin cockpit features an interactive chaos rig allowing engineers to deliberately inject faults into Step 3 to observe automated compensation live.

---

### 2. Sub-Millisecond In-Memory BM25 & Trie Search
Querying relational databases with `ILIKE %query%` on every keystroke causes full table scans, disk IOPS saturation, and connection pool exhaustion under high traffic.

GameStation isolates search into a **zero-dependency, in-memory prefix indexing engine**:
- **Trie Index Data Structure**: Built at server startup from published game records. Every title, tag, and developer handle is indexed character-by-character into a prefix tree.
- **Levenshtein Distance Spelling Suggestions**: Detects misspellings in constant time (e.g., `"Rdrd"` $\rightarrow$ `"Did you mean: 'red'"`).
- **Okapi BM25 Ranking**: Scores search terms against multi-token documents with term frequency (TF) and inverse document frequency (IDF) saturation.
- **Performance Benchmark**: Search queries resolve in **`~1.68 ms`**, returning highlighted matches and relevancy scores without touching PostgreSQL.

---

### 3. In-House W3C Distributed Tracing (APM) & FlameGraphs
Rather than introducing heavy third-party agent daemons (Datadog/NewRelic), GameStation features an in-house **Application Performance Monitoring (APM)** engine:
- **Context Propagation**: Utilizes Node.js `AsyncLocalStorage` to propagate W3C-compliant trace headers (`traceparent`) through asynchronous middleware pipelines.
- **Sub-Span Profiling**: Custom wrappers measure sub-operations:
  - Express route middleware resolution
  - Prisma query execution (`User.findFirst`, `Session.deleteMany`, `Session.create`)
  - JSON serialization overhead
- **Interactive FlameGraph UI**: Renders waterfall visual timelines displaying total latency, percentage distribution, HTTP metadata, and database execution durations.

---

### 4. Real-Time WebSocket Infrastructure
- Built on **Socket.IO** with custom room segregation.
- **Presence Engine**: Tracks player states across `Online`, `In-Game`, and `Offline` matrix modes.
- **Squad Transmissions**: Instant peer-to-peer messaging, friend requests, and unread count badges.
- **Platform Event Dispatch**: Real-time broadcast stream publishing live purchases, reviews, and developer updates across connected operator consoles.

---

### 5. Frontend Bundle Optimization (93% Size Reduction)
A common flaw in modern React SPAs is massive initial JavaScript bundles caused by monolithic imports of charting libraries and nested admin views.

GameStation re-architected its client bundle with **Route-Level Code Splitting**:
- **Dynamic Imports**: Converted Storefront, Developer Studio, Admin Deck, and Governance Cockpit into `React.lazy()` chunks.
- **Vendor Chunk Isolation**: Vite manual chunks configured to isolate `vendor-recharts` (431 kB) and `vendor-react` into independent cached layers.
- **Results**:
  - Initial JS bundle dropped from **1,881.94 kB** down to **130.77 kB** (**39.25 kB gzipped**).
  - **93.0% reduction** in initial parse time.
  - Paired with two-tier `<Suspense>` boundaries and custom `CyberSkeleton` loaders for seamless zero-CLS page transitions.

---

### 6. Production Multi-Stage Docker Architecture
The repository includes a unified, production-ready containerization setup:
- **Backend Dockerfile**: Multi-stage build based on `node:22-slim` containing compiled TypeScript output and minimal production dependencies (~177 MB).
- **Frontend Dockerfile**: Multi-stage build compiling React 19 assets and serving them through an ultra-lightweight `nginx:alpine` instance (~26.9 MB).
- **Reverse Proxy**: Nginx proxies incoming `/api/*` and `/socket.io/*` requests internally to the Node backend while serving static files with gzip compression.
- **Total Footprint**: The entire stack (Frontend + Backend + PostgreSQL 18) runs inside **~131.7 MiB of host RAM**.

---

## 💻 Tech Stack Matrix

| Domain | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | React | `19.0.0` | Declarative UI rendering & state management |
| **Build Tool** | Vite | `6.0.0` | Hot Module Replacement (HMR) & Rollup bundling |
| **Language** | TypeScript | `5.7.0` | End-to-end type safety |
| **Styling** | Tailwind CSS | `4.0.0` | Custom cyberpunk design system & utility classes |
| **Routing** | React Router | `7.0.0` | Declarative client-side routing & lazy loading |
| **Data Visualization**| Recharts | `2.15.0` | 5-axis quality radars & telemetry latency charts |
| **Backend API** | Express.js | `5.0.0` | REST API routing & middleware pipeline |
| **Database** | PostgreSQL | `18.0` | ACID-compliant relational data persistence |
| **ORM** | Prisma | `6.0.0` | Type-safe database queries & migration schema |
| **Real-Time** | Socket.IO | `4.8.0` | WebSockets for squad chat & telemetry stream |
| **Payments** | Stripe SDK | `17.0.0` | Checkout sessions, webhooks & payout flows |
| **Containerization** | Docker & Compose | Multi-Stage | Unified service orchestration & Nginx edge proxy |
| **Validation** | Zod | `3.23.0` | Runtime request body schema validation |

---

## 🗄️ Database Schema Highlights

The database is strictly normalized and indexed across 12 core relational entities:

- **`User` & `Session`**: Multi-role security accounts (`PLAYER`, `DEVELOPER`, `ADMIN`, `OWNER`) with hashed refresh tokens.
- **`Game`**: Central catalog entity managing lifecycle states (`DRAFT`, `PENDING`, `REJECTED`, `PUBLISHED`, `HIDDEN`).
- **`GamePricing` & `Discount`**: Supports editions (`Standard`, `Deluxe`, `Ultimate`) with scheduled promotional sales.
- **`GameMedia` & `GameVersion`**: Handles trailers, screenshots, binary download URLs, and historical release changelogs.
- **`GameRequirements` & `GameTelemetry`**: Hardware specifications (Min/Recommended) and verified player playtime metrics.
- **`Order` & `SagaTransaction`**: Cryptographic settlement log with forward action traces, compensation states, and idempotency keys.
- **`Review`**: 5-dimensional ratings (Optimization, Fun, Sound, Art, Netcode) restricted to verified game owners.
- **`Friendship` & `Message`**: Social graph storing bidirectional friend statuses and encrypted chat logs.

---

## 🚀 Quickstart & Development Saga

GameStation supports two distinct development workflows: **Lightweight Hybrid Development** (instant HMR for coding) and **Full Containerized Verification** (pre-push smoke testing).

### Prerequisites
- [Node.js (v20+)](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/)

---

### Workflow A: Hybrid Development (Recommended for Daily Coding)
*Keep PostgreSQL in Docker while running Frontend and Backend natively on your host for instant `<20ms` hot-reloading.*

1. **Clone the repository**:
   ```bash
   git clone https://github.com/martand-codes/GameStation.git
   cd GameStation
   ```

2. **Start PostgreSQL in Docker**:
   ```bash
   docker compose up -d postgres
   ```

3. **Setup and run the Backend**:
   ```bash
   cd Backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

4. **Setup and run the Frontend**:
   ```bash
   cd ../Frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

### Workflow B: Full Production Docker Stack
*Spin up the entire production-grade stack (PostgreSQL + Backend + Nginx Frontend) with a single command.*

```bash
# Start all services with automated multi-stage builds
docker compose up --build -d
```
- **Frontend & Nginx Edge**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001/api`
- **PostgreSQL**: `localhost:5433`

To tear down the stack gracefully:
```bash
docker compose down
```

---

## 📊 Performance Benchmarks

| Metric | Target / Measurement | Engineering Implementation |
| :--- | :--- | :--- |
| **Search Query Latency** | **`< 2.0 ms`** (P95) | In-Memory Prefix Trie & Okapi BM25 Index |
| **Database Pool Query Time** | **`< 10 ms`** (P50) | PostgreSQL 18 connection tuning via Prisma |
| **Initial JS Bundle Size** | **`130.77 kB`** (39 kB gzip) | Route-level `React.lazy()` & Vendor chunking |
| **Client Bundle Reduction** | **`93.0%` Reduction** | Eliminated monolithic bundle (down from 1.88 MB) |
| **Docker Stack RAM Footprint** | **`~131.7 MiB`** Total | Multi-stage Alpine & Debian-slim containerization |
| **Saga Compensation Time** | **`< 150 ms`** | Automated backward rollback on transaction failure |

---

## 👨‍💻 Author & Engineering Credits

Built by **Martand Prakhar**  
- **GitHub**: [@martand-codes](https://github.com/martand-codes)
- **LinkedIn**: [Martand Prakhar](https://www.linkedin.com/in/martand-prakhar/)

---

## 📝 License
This project is open-source and licensed under the [ISC License](LICENSE).
