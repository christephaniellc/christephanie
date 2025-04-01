# Stripe API Contract

## Overview
This document defines the API contract between the frontend and backend for processing Stripe payments for the wedding registry. It outlines the endpoints, request/response formats, and error handling for the payment processing flow.

## Endpoints

### 1. Create Payment Intent

**Endpoint:** `POST /api/payments/create-intent`

**Purpose:** Create a new payment intent on the Stripe backend

**Request:**
```json
{
  "amount": 5000,             // Amount in cents (e.g., $50.00)
  "currency": "usd",          // Currency code (default: "usd")
  "giftCategory": "honeymoon", // Category/purpose of the gift
  "metadata": {               // Optional additional data
    "guestId": "guest_123",   // If user is logged in
    "guestName": "John Doe",  // Guest name for the payment
    "guestEmail": "email@example.com" // Guest email for receipt
  }
}
```

**Response (Success):**
```json
{
  "clientSecret": "pi_1234_secret_5678",  // Stripe client secret for payment confirmation
  "paymentIntentId": "pi_1234",           // Stripe payment intent ID
  "amount": 5000,                         // Amount in cents
  "currency": "usd"                       // Currency code
}
```

**Response (Error):**
```json
{
  "error": {
    "type": "invalid_request_error",
    "message": "Amount must be at least $0.50 USD",
    "code": "amount_too_small"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request parameters
- 500: Server error

### 2. Process Payment

**Endpoint:** `POST /api/payments/process`

**Purpose:** Process a payment after the client-side confirmation

**Request:**
```json
{
  "paymentIntentId": "pi_1234",        // Payment intent ID from create-intent
  "paymentMethodId": "pm_5678",        // Payment method ID from Stripe Elements
  "giftCategory": "honeymoon",         // Category of the gift
  "guestInfo": {                       // Guest information
    "name": "John Doe",
    "email": "email@example.com"
  },
  "savePaymentMethod": false           // Whether to save payment method for future use
}
```

**Response (Success):**
```json
{
  "success": true,
  "paymentIntentId": "pi_1234",
  "status": "succeeded",
  "receiptUrl": "https://stripe.com/receipts/...",
  "transactionId": "txn_1234"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "type": "card_error",
    "message": "Your card was declined",
    "code": "card_declined",
    "decline_code": "insufficient_funds"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request parameters
- 402: Payment failed
- 500: Server error

### 3. Get Payment Status

**Endpoint:** `GET /api/payments/{paymentIntentId}`

**Purpose:** Check the status of a payment

**Response (Success):**
```json
{
  "paymentIntentId": "pi_1234",
  "status": "succeeded",
  "amount": 5000,
  "currency": "usd",
  "giftCategory": "honeymoon",
  "createdAt": "2025-03-31T12:00:00Z",
  "updatedAt": "2025-03-31T12:01:00Z",
  "receiptUrl": "https://stripe.com/receipts/..."
}
```

**Response (Error):**
```json
{
  "error": {
    "type": "invalid_request_error",
    "message": "Payment intent not found"
  }
}
```

**Status Codes:**
- 200: Success
- 404: Payment intent not found
- 500: Server error

### 4. Get Recent Contributions

**Endpoint:** `GET /api/payments/contributions`

**Purpose:** Get recent contribution data for display on the registry page

**Query Parameters:**
- `limit`: Maximum number of contributions to return (default: 10)
- `offset`: Number of contributions to skip (for pagination)

**Response (Success):**
```json
{
  "contributions": [
    {
      "id": "cont_1234",
      "amount": 5000,
      "currency": "usd",
      "giftCategory": "honeymoon",
      "contributorName": "John D.",
      "createdAt": "2025-03-31T12:00:00Z",
      "message": "Congratulations!"
    },
    {
      "id": "cont_5678",
      "amount": 10000,
      "currency": "usd",
      "giftCategory": "house_fund",
      "contributorName": "Jane S.",
      "createdAt": "2025-03-30T15:30:00Z",
      "message": "Happy wedding day!"
    }
  ],
  "totalCount": 42,
  "totalAmount": 254500,
  "categorySummary": {
    "honeymoon": 125000,
    "house_fund": 85000,
    "charity": 44500
  }
}
```

**Response (Error):**
```json
{
  "error": {
    "message": "Failed to retrieve contributions"
  }
}
```

**Status Codes:**
- 200: Success
- 500: Server error

## Error Handling

All endpoints should follow this error response format:

```json
{
  "error": {
    "type": "error_type",
    "message": "Human-readable error message",
    "code": "error_code"
  }
}
```

Common error types:
1. `invalid_request_error`: The request was invalid
2. `card_error`: The card was declined
3. `authentication_error`: Authentication with Stripe failed
4. `api_error`: Stripe API error
5. `rate_limit_error`: Too many requests
6. `server_error`: Internal server error

## Implementation Notes

### Frontend Implementation:
1. Use Stripe Elements for secure card collection
2. Create payment intent before showing payment form
3. Confirm payment on client side using Stripe.js
4. Call process endpoint to complete payment
5. Show success/failure UI based on response

### Backend Implementation:
1. Use Stripe SDK for server-side operations
2. Store payment records in database with gift category and other metadata
3. Implement webhook handling for async payment events
4. Add proper error handling and logging
5. Ensure PCI compliance by never handling raw card data
6. Create Lambda functions for each endpoint in the contract
7. Set up API Gateway routes to map to Lambda functions
8. Implement proper authentication and authorization
9. Use the Command/Query pattern consistent with existing backend code
10. Create required DTOs and validation using FluentValidation

## OpenAPI Generation Steps for Backend

1. Create a Swagger/OpenAPI specification file in the backend:
   - Create a new file: `/backend/src/stripe-openapi.yml`
   - Define all endpoints, requests, responses based on this contract

2. Add Stripe-specific models:
   - Create required DTOs in `/backend/src/Wedding.Abstractions/Dtos/`
   - Add necessary validation in `/backend/src/Wedding.Abstractions/Validation/`

3. Implement Lambda functions:
   - Create new Lambda projects for Stripe-related endpoints:
     - `Wedding.Lambdas.Payments.CreateIntent`
     - `Wedding.Lambdas.Payments.Process`
     - `Wedding.Lambdas.Payments.GetStatus`
     - `Wedding.Lambdas.Payments.GetContributions`
   - Follow existing patterns for command/query implementation

4. Update Swagger generation:
   - Add the new Stripe endpoints to the swagger.json generation process
   - Run the update-swagger.bat script to generate the updated API contract

5. Share the generated OpenAPI with the frontend:
   - Copy the updated swagger.json to the frontend directory
   - Update the frontend API client to use the new endpoints

## Testing
1. Use Stripe test mode for development
2. Test successful payments with test cards
3. Test various failure scenarios (declined card, insufficient funds, etc.)
4. Test checkout flow end-to-end
5. Create unit tests for validation and command/query handlers
6. Create integration tests against the Stripe test environment

## Security Considerations
1. Validate all inputs on both client and server
2. Use HTTPS for all API calls
3. Implement proper authentication for payment endpoints
4. Never log sensitive payment information
5. Use Stripe's prebuilt components to maintain PCI compliance