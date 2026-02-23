# Autowala API Documentation

## Base URL
```
Production: https://api.autowala.in
Development: http://localhost:3000/api
```

## Authentication

### User Login
```http
POST /auth/login
Content-Type: application/json

{
  "phone": "9876543210"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Verify OTP
```http
POST /auth/verify
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "user-123",
    "phone": "+919876543210",
    "language": "en",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

## Rides

### Get Zones
```http
GET /zones
```

### Create Ride
```http
POST /rides
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickupZoneId": "railway-station",
  "dropZoneId": "rankala"
}
```

### Get Ride Status
```http
GET /rides/:rideId
Authorization: Bearer <token>
```

### Cancel Ride
```http
POST /rides/:rideId/cancel
Authorization: Bearer <token>
```

## Drivers

### Driver Login
```http
POST /drivers/login
Content-Type: application/json

{
  "phone": "9876543210"
}
```

### Get Driver Profile
```http
GET /drivers/me
Authorization: Bearer <token>
```

### Update Driver Status
```http
POST /drivers/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "available" | "busy" | "offline"
}
```

## Error Responses

```json
{
  "success": false,
  "error": "Error message"
}
```

## Status Codes
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
