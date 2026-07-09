# API Specification

This document provides a high-level overview of the RESTful API endpoints for the CrossMart backend (NestJS).

## 1. Authentication (`/api/v1/auth`)
- `POST /auth/request-otp` - Request OTP for login/register.
- `POST /auth/verify-otp` - Verify OTP and return JWT.
- `POST /auth/register-seller` - Endpoint for clients upgrading to a seller account (includes ID upload).

## 2. Users (`/api/v1/users`)
- `GET /users/me` - Get current user profile.
- `PATCH /users/me` - Update profile, addresses.
- `GET /users/sellers` - (Admin only) List sellers pending verification.
- `PATCH /users/sellers/:id/verify` - (Admin only) Approve/Reject seller application.

## 3. Products (`/api/v1/products`)
- `GET /products` - List all approved products (supports query params: `search`, `categoryId`, `type`).
- `GET /products/:id` - Get product details.
- `POST /products` - (Seller only) Create a new product.
- `PATCH /products/:id` - (Seller only) Update stock/price.
- `PATCH /products/:id/approve` - (Admin only) Approve a pending product.

## 4. Orders (`/api/v1/orders`)
- `POST /orders` - (Client only) Create an order from cart items.
- `GET /orders` - (Client/Seller/Admin) List orders contextually based on RBAC.
- `GET /orders/:id` - Get specific order details and cargo tracking timeline.
- `PATCH /orders/:id/status` - (Seller/Admin) Update the tracking state of an order (e.g., to "PACKED").

## 5. Payments (`/api/v1/payments`)
- `POST /payments/:orderId/slip` - (Client only) Upload a payment screenshot.
- `PATCH /payments/:id/verify` - (Seller/Admin) Confirm payment receipt.

## 6. Categories (`/api/v1/categories`)
- `GET /categories` - Fetch category tree (Redis cached).
- `POST /categories` - (Admin only) Create new category.
