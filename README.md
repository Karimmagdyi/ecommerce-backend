# 🛒 E-Commerce Backend

A production-ready REST API for an e-commerce platform built with **Node.js**, **Express**, and **MongoDB**. Designed with real-world concerns in mind: race condition handling, JWT authentication, role-based access, and real-time updates via WebSockets.

---

## ✨ Features

- **JWT Authentication** — Secure stateless auth with token expiry
- **Cart Management** — Add/update cart items using MongoDB transactions to prevent race conditions
- **Order Processing** — Two-phase order flow (pending → paid) with inventory locking to prevent overselling
- **Product Management** — Full CRUD with category filtering, search, and a best-seller ranking system using MongoDB Aggregation Pipeline
- **Real-time Updates** — Socket.io integration for live product and cart updates
- **Image Uploads** — Profile picture uploads handled via Multer with UUID-based file naming
- **Centralized Error Handling** — Custom error classes (BadRequest, NotFound, InternalServerError, ValidationError)

---

## 🧠 Technical Highlights

### Race Condition Handling
When a user adds a product to their cart, the API uses a **MongoDB session + transaction** to atomically check and update inventory — preventing two users from buying the last item simultaneously.

### Inventory Locking (Pending Orders)
When an order is placed with `paymentStatus: "pending"`, the ordered quantity is **locked** on the product document. This prevents other users from purchasing stock that is reserved but not yet confirmed.

### Best Seller Ranking
Products are ranked using MongoDB's `$setWindowFields` with `$rank` — the top 3 best-selling products are automatically flagged as best sellers without any manual updates.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Real-time | Socket.io |
| File Upload | Multer |
| Environment | dotenv |

---

## 📁 Project Structure

```
ecommerce-backend/
├── controller/        # Route handlers (auth, product, cart, order)
├── middleware/        # Auth, error handling
├── model/             # Mongoose schemas (User, Product, Cart, Order)
├── routes/            # Express routers
├── utils/             # Custom error classes, helper functions
├── app.js             # App entry point
└── sockets.js         # Socket.io initialization
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
git clone https://github.com/Karimmagdyi/ecommerce-backend.git
cd ecommerce-backend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3002
```

### Run

```bash
node app.js
```

Server runs on `http://localhost:3002`

---

## 📡 API Overview

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/login` | Login and receive JWT |
| GET | `/user` | Get user profile |
| PUT | `/user/picture` | Upload profile picture |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | Get all products with best-seller ranking |
| GET | `/products/:id` | Get product by ID |
| GET | `/products/search` | Search products by name |
| GET | `/products/filter` | Filter by category |
| POST | `/products` | Add a new product |
| PUT | `/products` | Update product |

### Cart & Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/cart` | Add item to cart (with transaction) |
| GET | `/cart` | Get user cart |
| POST | `/order` | Place order (pending or paid) |
| GET | `/order` | Get user orders |

---

## 👤 Author

**Karim Magdy**
[GitHub](https://github.com/Karimmagdyi) · [LinkedIn](https://linkedin.com/in/karim-magdy-0a82782a2)
