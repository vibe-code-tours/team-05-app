# Speckit Spec Format Reference

## Required Sections

Every spec MUST have these sections:

```markdown
# Feature: [Name]

## 1. Problem
[What problem does this solve? Why now?]

## 2. User Story
**As a** [role]
**I want to** [action]
**So that** [benefit]

## 3. Acceptance Criteria
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

## 4. API
[Endpoints with method, path, params, request/response]

## 5. Database
[New models, fields, relations, indexes]

## 6. UI
[Pages, components, layout, interactions]

## 7. Rules
[Business rules, validation, constraints]

## 8. Edge Cases
[What can go wrong? How to handle?]

## 9. Dependencies
[Other features, services, APIs needed]

## 10. Testing
[What to test, how to test]
```

---

## Optional Sections

Add these when relevant:

```markdown
## 11. Performance
[Response time targets, caching, pagination]

## 12. Security
[Auth requirements, data protection]

## 13. Notifications
[What to notify, when, to whom]

## 14. Rollback
[How to undo if something goes wrong]

## 15. Future
[What's NOT included in this iteration]
```

---

## Section Details

### 1. Problem
```markdown
## Problem
Users currently have to [current painful workflow].
This causes [negative outcome].
We need [what we're building] so that [positive outcome].
```

### 2. User Story
```markdown
## User Story
**As a** seller
**I want to** upload product images
**so that** customers can see what I'm selling.
```

### 3. Acceptance Criteria
```markdown
## Acceptance Criteria
- [ ] Seller can upload up to 10 images per product
- [ ] Images are stored in Cloudflare R2
- [ ] Images are compressed to max 5MB each
- [ ] Supported formats: JPEG, PNG, WebP
- [ ] First image is the thumbnail
- [ ] Images can be reordered by drag-and-drop
```

### 4. API
```markdown
## API

### POST /api/v1/products/:id/images
Upload product images.

**Auth:** SELLER (own product only)
**Request:** multipart/form-data
| Field | Type | Required | Rules |
|---|---|---|---|
| images | file[] | yes | max 10, max 5MB each, jpeg/png/webp |

**Response (201):**
{
  "success": true,
  "data": {
    "images": [
      { "id": "uuid", "url": "...", "sortOrder": 0 }
    ]
  }
}

**Errors:**
- 400: Invalid file type or size
- 403: Not product owner
- 404: Product not found
- 413: File too large
```

### 5. Database
```markdown
## Database

### New Model: ProductImage
| Field | Type | Required | Notes |
|---|---|---|---|
| id | UUID | yes | Primary key |
| productId | UUID | yes | FK → Product |
| url | String | yes | R2 path |
| sortOrder | Int | yes | Default: 0 |
| createdAt | DateTime | yes | Auto |

### New Index
- productId (for listing images by product)

### Relations
- Product has many ProductImage
- ProductImage belongs to Product
```

### 6. UI
```markdown
## UI

### Product Edit Page
- Image upload area (drag-and-drop zone)
- Image grid showing uploaded images
- Drag to reorder
- Delete button on each image
- First image marked as "Thumbnail"

### Product Detail Page
- Image carousel
- Thumbnail navigation
- Zoom on click
```

### 7. Rules
```markdown
## Rules
- Max 10 images per product
- Max 5MB per image
- Only JPEG, PNG, WebP allowed
- First image is always thumbnail
- Seller can only manage own product images
- Images deleted when product deleted (cascade)
```

### 8. Edge Cases
```markdown
## Edge Cases
- Upload fails mid-way → show partial success, allow retry
- All images deleted → show "No images" placeholder
- Invalid file type → show error, don't upload
- Network error → retry with exponential backoff
- Concurrent uploads → queue and process sequentially
```

---

## Spec Validation

Before implementation, validate:

| Check | Pass/Fail |
|---|---|
| Problem statement exists | |
| User story has role + action + benefit | |
| At least 3 acceptance criteria | |
| API endpoints defined | |
| Database changes defined | |
| UI described | |
| Business rules listed | |
| Edge cases considered | |
| Error handling defined | |
| Dependencies identified | |

**All must pass before coding begins.**
