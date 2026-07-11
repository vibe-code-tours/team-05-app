---
name: dashboard
description: Dashboard design patterns, analytics widgets, charts, and data visualization
---

# Dashboard Skill

## Dashboard Types

### Customer Dashboard
- Recent orders
- Wishlist
- Saved addresses
- Account settings

### Seller Dashboard
- Sales overview (today, week, month)
- Recent orders
- Product performance
- Reviews summary
- Revenue charts

### Admin Dashboard
- Platform metrics
- User growth
- Order volume
- Revenue trends
- System health

---

## Widget Patterns

### Metric Card
```tsx
<Card>
  <CardHeader>Total Revenue</CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">$45,231.89</div>
    <p className="text-muted-foreground">+20.1% from last month</p>
  </CardContent>
</Card>
```

### Chart Widget
```tsx
<Card>
  <CardHeader>Sales Overview</CardHeader>
  <CardContent>
    <Chart data={salesData} />
  </CardContent>
</Card>
```

---

## Rules

**Always:**
- Show loading states
- Handle empty states
- Provide date range filters
- Export data option

**Never:**
- Show sensitive data without auth
- Skip loading indicators
- Hardcode dashboard data
