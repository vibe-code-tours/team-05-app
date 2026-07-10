# Feature: [FEATURE_NAME]

---

## 1. Problem

[Describe the problem this feature solves. Why is it important? What happens if we don't build it?]

---

## 2. User Story

**As a** [role: admin/seller/client]
**I want to** [action]
**So that** [benefit]

---

## 3. Acceptance Criteria

- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]
- [ ] [Specific, testable criterion 4]
- [ ] [Specific, testable criterion 5]

---

## 4. API

### [METHOD] /api/v1/[resource]

**Description:** [What this endpoint does]

**Auth:** [Required role]

**Request:**

| Field | Type | Required | Rules |
|---|---|---|---|
| field | type | yes/no | validation rules |

**Response (200/201):**
```json
{
  "success": true,
  "data": {}
}
```

**Errors:**
- 400: [When]
- 401: [When]
- 403: [When]
- 404: [When]

---

## 5. Database

### New/Modified Models

| Model | Change | Fields |
|---|---|---|
| ModelName | new/modify | field: type |

### New Indexes

| Table | Index | Reason |
|---|---|---|
| table | field | query pattern |

### Relations

| From | To | Type |
|---|---|---|
| Model | Model | 1:N / M:N |

---

## 6. UI

### Page: [Page Name]

**Layout:**
- [Component 1]
- [Component 2]

**Interactions:**
- [Click handler]
- [Form submission]

**States:**
- Loading
- Empty
- Error
- Success

---

## 7. Rules

- [Business rule 1]
- [Business rule 2]
- [Validation rule 1]

---

## 8. Edge Cases

| Scenario | Handling |
|---|---|
| [What can go wrong] | [How to handle it] |

---

## 9. Dependencies

- [ ] [Other feature/service needed]
- [ ] [External API needed]

---

## 10. Testing

### Unit Tests
- [ ] [What to test]

### Integration Tests
- [ ] [What to test]

### E2E Tests
- [ ] [Critical flow to test]

---

## 11. Performance

- Response time: < [X]ms
- Pagination: [X] items per page
- Caching: [strategy]

---

## 12. Security

- Auth: [required/optional]
- Roles: [who can access]
- Data: [sensitive data handling]

---

## 13. Notifications

| Event | Recipient | Channel |
|---|---|---|
| [event] | [who] | [in-app/email/sms] |

---

## 14. Future (Out of Scope)

- [What we're NOT building now]
