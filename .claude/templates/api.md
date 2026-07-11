# API Endpoint Template

## Endpoint
[METHOD] /api/v1/[resource]

## Description
[What this endpoint does]

## Authentication
- Required: Yes/No
- Roles: [ADMIN, SELLER, CLIENT]

## Request

### Headers
| Header | Value | Required |
|---|---|---|
| Authorization | Bearer {token} | Yes |
| Content-Type | application/json | Yes |

### Path Parameters
| Parameter | Type | Description |
|---|---|---|
| id | string (UUID) | Resource ID |

### Query Parameters
| Parameter | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

### Body (JSON)
```json
{
  "field": "value"
}
```

### Validation Rules
| Field | Type | Required | Rules |
|---|---|---|---|
| name | string | yes | min: 1, max: 200 |
| price | number | yes | min: 0 |

## Response

### Success (200/201)
```json
{
  "success": true,
  "data": { }
}
```

### Error (400/401/403/404/500)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Error Codes
| Code | HTTP Status | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | No auth token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |

## Examples

### cURL
```bash
curl -X POST https://api.example.com/api/v1/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Product", "price": 10000}'
```

### TypeScript
```typescript
const response = await api.post('/products', {
  name: 'Product',
  price: 10000,
});
```

## Implementation Notes
- [Any special implementation details]
- [Performance considerations]
- [Security considerations]
