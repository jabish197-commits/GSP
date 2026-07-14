# SJ Guppy Paradise Postman API Guide

## Import into Postman

1. Open Postman and choose **Import**.
2. Import `postman/SJ_Guppy_Paradise.postman_collection.json`.
3. Import `postman/SJ_Guppy_Paradise.postman_environment.json`.
4. Select **SJ Guppy Paradise - Local** from the environment selector.
5. Update `adminEmail` and `adminPassword` in the environment.
6. Start the backend API and run **01 - System > Health Check**.
7. Run **02 - Admin Authentication > Admin Login** before protected requests.

Postman saves the `sj_admin_token` login cookie automatically. If a protected request returns `401`, open Postman's cookie manager for `localhost`, confirm that the cookie exists, and log in again.

## Recommended first test

Run the requests in this order:

1. Health Check
2. Admin Login
3. Current Admin
4. Create Fish
5. Get All Fish
6. Create Customer Enquiry
7. Get All Enquiries
8. Create Customer Chat Session
9. Send Customer Message to AI
10. Request Human Admin
11. Get All Chats for Admin
12. Accept Chat Request
13. Send Admin Reply
14. Get Customer Chat Session
15. Upload Fish Image or Video

The collection automatically stores `fishId`, `fishSlug`, `orderId`, `chatId`, and `sessionId` when the related requests are run.

## Endpoint summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API health check |
| POST | `/api/auth/login` | Public | Admin login |
| GET | `/api/auth/me` | Admin | Current admin account |
| POST | `/api/auth/logout` | Admin | Admin logout |
| GET | `/api/fish` | Public | All fish and optional filters |
| GET | `/api/fish/:idOrSlug` | Public | One fish by ID or slug |
| POST | `/api/fish` | Admin | Create fish |
| PUT | `/api/fish/:id` | Admin | Update fish |
| DELETE | `/api/fish/:id` | Admin | Delete fish |
| POST | `/api/orders` | Public | Create customer enquiry |
| GET | `/api/orders` | Admin | List enquiries |
| PATCH | `/api/orders/:id/status` | Admin | Change enquiry status |
| POST | `/api/chat/session` | Public | Create or reopen chat session |
| GET | `/api/chat/session/:sessionId` | Public | Read customer chat |
| POST | `/api/chat/session/:sessionId/message` | Public | Send customer message |
| POST | `/api/chat/session/:sessionId/request-admin` | Public | Request human breeder |
| GET | `/api/chat/admin` | Admin | List admin chats |
| PATCH | `/api/chat/admin/:id/status` | Admin | Accept or close chat |
| POST | `/api/chat/admin/:id/message` | Admin | Send admin reply |
| GET | `/api/settings` | Public | Get public website settings |
| PUT | `/api/settings` | Admin | Update public website settings |
| POST | `/api/media` | Admin | Upload image or video |

## Common examples

### Health check

```http
GET http://localhost:5000/api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "sj-guppy-paradise-api"
}
```

### Admin login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "your-secure-admin-password"
}
```

Example response:

```json
{
  "admin": {
    "id": "6873a0f4f21234567890abcd",
    "name": "SJ Guppy Paradise",
    "email": "admin@example.com"
  }
}
```

The token is stored as a secure HTTP-only cookie and is intentionally not returned in the JSON response.

### Create fish

```http
POST http://localhost:5000/api/fish
Content-Type: application/json
Cookie: sj_admin_token=managed-by-postman
```

```json
{
  "name": "Blue Mosaic Guppy",
  "strain": "Blue Mosaic",
  "description": "Healthy breeder-selected pair with broad patterned tails.",
  "price": 650,
  "quantity": 5,
  "sex": "pair",
  "age": "4 months",
  "status": "available",
  "featured": true,
  "media": [
    {
      "url": "https://res.cloudinary.com/example/image/upload/blue-mosaic.jpg",
      "publicId": "sj_guppy_paradise/blue-mosaic",
      "type": "image",
      "alt": "Blue Mosaic guppy pair"
    }
  ]
}
```

Allowed `sex` values: `male`, `female`, `pair`, `juvenile`, `mixed`.

Allowed fish `status` values: `available`, `reserved`, `sold`.

### Fish search

```http
GET http://localhost:5000/api/fish?status=available&featured=true&search=mosaic
```

All query parameters are optional.

### Customer enquiry

```json
{
  "customer": {
    "name": "Arun Kumar",
    "phone": "+91 9876543210",
    "email": "arun@example.com",
    "address": "Chennai, Tamil Nadu"
  },
  "items": [
    {
      "fish": "6873a0f4f21234567890abcd",
      "quantity": 1
    }
  ],
  "notes": "Please confirm weekend delivery."
}
```

Example response:

```json
{
  "order": {
    "orderNumber": "SJG-MD2X8D-419",
    "total": 650,
    "status": "new"
  }
}
```

Allowed order statuses: `new`, `confirmed`, `preparing`, `shipped`, `completed`, `cancelled`.

### Customer AI chat

First create a session:

```json
{
  "customerName": "Arun Kumar"
}
```

Then use the returned `sessionId`:

```http
POST /api/chat/session/{sessionId}/message
```

```json
{
  "text": "Which guppies are available and what are their prices?"
}
```

### Request and accept human chat

Customer request:

```json
{
  "customerName": "Arun Kumar",
  "customerPhone": "+91 9876543210"
}
```

Admin accepts using:

```json
{
  "status": "accepted"
}
```

The admin reply changes the chat to `active`. Allowed chat statuses are `ai`, `pending`, `accepted`, `active`, and `closed`.

### Media upload

In Postman:

1. Select `POST {{baseUrl}}/media`.
2. Open **Body**.
3. Select **form-data**.
4. Use the key `file`.
5. Change its type from Text to File.
6. Choose an image or video.
7. Do not manually set the `Content-Type` header.

Example response:

```json
{
  "media": {
    "url": "https://res.cloudinary.com/example/image/upload/example.jpg",
    "publicId": "sj_guppy_paradise/example",
    "type": "image"
  }
}
```

Copy the returned `media` object into the fish `media` array when creating or updating a listing.

## Common errors

| Status | Meaning |
|---|---|
| `400` | Invalid or missing request data |
| `401` | Admin login is required or the cookie expired |
| `404` | Record or API route not found |
| `429` | Too many login or chat requests |
| `500` | Server, database, Cloudinary, or configuration error |

