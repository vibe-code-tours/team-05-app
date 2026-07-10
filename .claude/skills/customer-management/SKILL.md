---
name: customer-management
description: Customer registration, profiles, addresses, order history, and customer-specific operations
---

# Customer Management Skill

## Core Entities

### Customer Profile
- Linked to User (CLIENT role)
- Delivery addresses (multiple)
- Order history
- Wishlist
- Reviews

---

## Business Rules

### Registration
- Phone OTP or Email registration
- Default role: CLIENT
- Profile completion optional

### Addresses
- Max 5 addresses per customer
- One default address
- Address validation required

### Order History
- View all past orders
- Track current orders
- Reorder from history

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/profile | Get customer profile |
| PATCH | /api/v1/profile | Update profile |
| GET | /api/v1/addresses | List addresses |
| POST | /api/v1/addresses | Add address |
| PATCH | /api/v1/addresses/:id | Update address |
| DELETE | /api/v1/addresses/:id | Delete address |
| GET | /api/v1/orders | Order history |

---

## Rules

**Always:**
- Validate address before saving
- Allow multiple addresses
- Track order history
- Protect customer data

**Never:**
- Expose customer data to other customers
- Allow address modification after order placement
- Skip address validation
