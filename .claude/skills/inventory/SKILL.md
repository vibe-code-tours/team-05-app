---
name: inventory
description: Stock management, variant inventory, low stock alerts, and inventory tracking
---

# Inventory Skill

## Core Entities

### Stock
- Per-variant stock tracking
- Reserved stock (pending orders)
- Available stock = total - reserved

---

## Business Rules

### Stock Management
- Stock decremented on order confirmation
- Stock restored on order cancellation
- Low stock alert at 10 units
- Out of stock = 0 available

### Reservation
- Stock reserved during checkout (15 min)
- Released if order not completed
- Prevents overselling

---

## Rules

**Always:**
- Track stock per variant
- Reserve stock during checkout
- Restore stock on cancellation
- Alert on low stock

**Never:**
- Allow negative stock
- Skip stock validation on order
- Forget to restore cancelled stock
