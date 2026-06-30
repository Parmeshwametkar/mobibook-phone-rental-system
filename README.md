# 📱 MobiBook: Full-Stack Phone Booking System

MobiBook is a comprehensive, production-ready Full-Stack Phone Booking and Rental System. It allows standard users to search, view specifications, and register bookings for flagship smartphones, while granting administrators complete control over inventory, pricing, technical specifications, and system-wide reservations.

---

## 🛠️ Tech Stack & Key Architectures

### 💻 Frontend Client
* **React 19 (TypeScript)** with **Vite** as the lightning-fast bundler and dev server.
* **Tailwind CSS** for fluid, modern, desktop-first and mobile-responsive styling.
* **Lucide React** for premium vector iconography.
* State-driven, modular UI containing modals, forms, and validation handlers.

### ☕ Spring Boot Backend (Exportable Code)
* **Java 17 / Spring Boot 3.x** microservice framework.
* **Spring Web MVC** handling REST controllers and payload structures.
* **Spring Data JPA (Hibernate)** for object-relational mapping.
* **Lombok** for clean, getter/setter/builder boilerplate removal.
* **Jakarta Validation API** for backend payload validations.

### 🗄️ Database
* **MySQL 8.x** relational database engine.
* Structural relational mapping with automatic indices, cascades, and constraints.

---

## 📂 Project Directory Structure

The project has been organized with a modular, highly scalable folder architecture:

```text
├── /                         # Workspace Root
│   ├── index.html            # Main SPA mount entrypoint
│   ├── package.json          # Node dependencies, scripts, and build tasks
│   ├── server.ts             # Express preview server (for instant Live AI Studio testing)
│   ├── vite.config.ts        # Vite configuration & asset routing
│   │
│   ├── /src                  # React.js Client Code
│   │   ├── main.tsx          # React application bootstrapping
│   │   ├── App.tsx           # Global view controller & core state manager
│   │   ├── index.css         # Tailwind directives and CSS variables
│   │   ├── types.ts          # Shared TypeScript models and interfaces
│   │   └── /components       # Reusable, self-contained layout components
│   │       ├── Navbar.tsx            # Header, user session & view controls
│   │       ├── PhoneCard.tsx         # Catalog card displaying device details
│   │       ├── BookingModal.tsx      # Date-calculator & checkout booking form
│   │       ├── PhoneDetailModal.tsx  # Interactive spec sheet drawer
│   │       ├── AdminPhoneModal.tsx   # Inventory controls (add/edit form)
│   │       └── AuthModal.tsx         # Unified registration and login modals
│   │
│   └── /springboot-backend   # Spring Boot Java Backend Code (Exportable)
│       ├── pom.xml           # Maven project dependencies
│       └── /src/main
│           ├── /resources
│           │   ├── application.properties  # MySQL database configuration
│           │   ├── schema.sql              # MySQL DDL table creation scripts
│           │   └── data.sql                # MySQL DML initial seed data script
│           └── /java/com/phonebooking
│               ├── PhoneBookingApplication.java  # Main application boot class
│               ├── /model          # JPA Relational Entities
│               │   ├── User.java       # User profiles mapping
│               │   ├── Phone.java      # Smartphone inventory details
│               │   ├── Booking.java    # Reservation records
│               │   └── Role.java       # User classification Enum (USER, ADMIN)
│               ├── /repository     # JPA Data Access Interfaces
│               │   ├── UserRepository.java
│               │   ├── PhoneRepository.java
│               │   └── BookingRepository.java
│               ├── /dto            # Data Transfer Request/Response Payloads
│               │   ├── LoginRequest.java
│               │   ├── RegisterRequest.java
│               │   ├── BookingRequest.java
│               │   └── AuthResponse.java
│               └── /controller     # REST Controller API Handlers
│                   ├── AuthController.java     # User registrations and logins
│                   ├── PhoneController.java    # Device retrieval and CRUD operations
│                   └── BookingController.java  # Device bookings and cancellations
```

---

## 🔑 Evaluation Credentials

For rapid testing in the Live Preview iframe, the system is pre-seeded with:

| Account Type | Username / Email | Password | Role Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `adminpassword` | Accesses all bookings, registers new phones, modifies pricing/stock, deletes catalog devices. |
| **Standard Customer**| `john_doe` | `password123` | Browses inventory, views detailed specs, rents devices, views personal booking history, cancels active bookings. |

---

## 📡 REST API Mapping Table

Both the Express Preview Server and Spring Boot Backend share the identical API mapping interfaces, enabling hot-swaps:

| Method | Endpoint | Access Level | Description | Payload Body (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Registers a new account | `{ "username": "alex", "email": "alex@mail.com", "password": "123", "role": "USER" }` |
| **POST** | `/api/auth/login` | Public | Authenticates user credentials | `{ "usernameOrEmail": "alex", "password": "123" }` |
| **GET** | `/api/phones` | Public | Retrieves filtered devices | None (Supports `search` & `brand` query params) |
| **GET** | `/api/phones/{id}` | Public | Retrieves specific device details | None |
| **POST** | `/api/phones` | **Admin Only** | Adds a new phone listing | `{ "brand": "Brand", "model": "Model", "pricePerDay": 40.0, "stock": 5, ... }` |
| **PUT** | `/api/phones/{id}` | **Admin Only** | Modifies existing phone parameters | `{ "brand": "Brand", "model": "Model", ... }` |
| **DELETE**| `/api/phones/{id}` | **Admin Only** | Removes phone from catalog | None |
| **GET** | `/api/bookings` | **Authenticated** | Returns reservation log history | None (Admins get all logs, users get their own) |
| **POST** | `/api/bookings` | **Authenticated** | Book a device | `{ "phoneId": 1, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }` |
| **DELETE**| `/api/bookings/{id}` | **Authenticated** | Cancels active booking | None (Customer/Admin can cancel) |

---

## 🚀 Step-by-Step Local Setup Guide

### Part 1: Setting up MySQL
1. Launch your MySQL command line client or terminal:
   ```bash
   mysql -u root -p
   ```
2. Execute the schema definitions located inside the backend source:
   ```sql
   -- Paste content from /springboot-backend/src/main/resources/schema.sql
   -- Paste content from /springboot-backend/src/main/resources/data.sql
   ```

### Part 2: Running the Spring Boot Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd springboot-backend
   ```
2. Edit `/src/main/resources/application.properties` to ensure the MySQL URL, user, and passwords match your system.
3. Build and launch the application using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
4. The backend services will boot successfully and listen on: `http://localhost:8080`.

### Part 3: Running the React Client
1. In a separate terminal window, navigate to the project root directory:
   ```bash
   cd /project-root
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. To configure Vite to communicate directly with the local Spring Boot server instead of the local Express mock server, edit the `/vite.config.ts` proxy section (or let the default requests handle it directly by editing `/src/App.tsx` API fetches to target `http://localhost:8080/api`).
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
5. Launch your browser and navigate to: `http://localhost:3000`. You are ready to explore!
