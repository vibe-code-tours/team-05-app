---
name: notification
description: In-app notifications, email notifications, SMS alerts, and notification management
---

# Notification Skill

## Notification Types

| Type | Channel | Trigger |
|---|---|---|
| Order Confirmed | In-App + Email | Payment verified |
| Order Shipped | In-App + Email | Status: SHIPPED |
| Order Delivered | In-App + Email | Status: DELIVERED |
| Payment Rejected | In-App | Payment rejected |
| Review Received | In-App | New review on product |
| Low Stock | In-App | Stock < 10 |
| Promotion | In-App + Email | New promotion active |

---

## Core Entities

### Notification
- userId, title, message, type, isRead, data

---

## Rules

**Always:**
- Notify on order status change
- Mark as read when viewed
- Allow notification preferences
- Log notification sent

**Never:**
- Spam users
- Send sensitive data in notifications
- Skip notification on important events
