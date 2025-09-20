# API Endpoint Documentation

## /users/register Endpoint

### Endpoint

- **URL:** `/users/register`
- **Method:** POST

### Description

This endpoint registers a new user by accepting user details, validating the data, hashing the password, and creating a user in the database. Upon successful registration, it returns an authentication token and the user object.

### Required Request Data

The request body must be in JSON format and include the following data:

- **fullname:** An object with:
  - **firstname:** String (required, minimum 3 characters)
  - **lastname:** String (optional but recommended)
- **email:** String (required, valid email format)
- **password:** String (required, minimum 6 characters)

**Example Request Body:**

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "123456"
}
```

### Response

#### Success Response

- **Status Code:** 201 Created
- **Content:** JSON object containing:
  - `token`: The JWT authentication token.
  - `user`: The newly created user object (excluding the password).

**Example Success Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "_id": "60b...",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

#### Error Response

- **Status Code:** 400 Bad Request
- **Content:** JSON object containing an array of validation errors.

**Example Error Response:**

```json
{
  "errors": [
    {
      "msg": "Invalid email format",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "First name must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    }
  ]
}
```

---

## /users/login Endpoint

### Endpoint

- **URL:** `/users/login`
- **Method:** POST

### Description

This endpoint logs in an existing user. It accepts the user's email and password, validates the input, and checks if the credentials match a record in the database. Upon successful authentication, it returns a JWT token and the user object.

### Required Request Data

The request body must be in JSON format and include the following data:

- **email:** String (required, valid email format)
- **password:** String (required, minimum 6 characters)

**Example Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "123456"
}
```

### Response

#### Success Response

- **Status Code:** 200 OK
- **Content:** JSON object containing:
  - `token`: The JWT authentication token.
  - `user`: The authenticated user object (excluding the password).

**Example Success Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "_id": "60b...",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

#### Error Response

- **Status Code:** 400 Bad Request or 401 Unauthorized
- **Content:** JSON object containing either an array of validation errors or an error message if authentication fails.

**Example Error Response (Validation Errors):**

```json
{
  "errors": [
    {
      "msg": "Invalid email format",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**Example Error Response (Authentication Failure):**

```json
{
  "message": "Invalid email or password"
}
```

---

## /users/profile Endpoint

### Endpoint

- **URL:** `/users/profile`
- **Method:** GET

### Description

This endpoint retrieves the profile of the authenticated user. It requires a valid JWT token to be provided in the request cookies or the `Authorization` header.

### Required Request Data

- No request body is required.
- Must include a valid JWT token in the cookies or the `Authorization` header.

### Response

#### Success Response

- **Status Code:** 200 OK
- **Content:** JSON object containing the user's profile data.

**Example Success Response:**

```json
{
  "user": {
    "_id": "60b...",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

#### Error Response

- **Status Code:** 401 Unauthorized
- **Content:** JSON object with an error message indicating that authentication failed.

**Example Error Response:**

```json
{
  "message": "Unauthorized"
}
```

---

## /users/logout Endpoint

### Endpoint

- **URL:** `/users/logout`
- **Method:** GET

### Description

This endpoint logs out an authenticated user by blacklisting the current JWT token and clearing it from the user's cookies, effectively ending the session.

### Required Request Data

- No request body is required.
- Must include a valid JWT token in the cookies or the `Authorization` header.

### Response

#### Success Response

- **Status Code:** 200 OK
- **Content:** JSON object confirming a successful logout.

**Example Success Response:**

```json
{
  "message": "Logged out successfully"
}
```

#### Error Response

- **Status Code:** 400 Bad Request
- **Content:** JSON object with an error message if no token is found or another issue occurs.

**Example Error Response:**

```json
{
  "message": "No token found to logout"
}
```

---

## Captain Routes

When mounted, these endpoints are accessed with the captain route prefix (e.g. `/captain`).

### /captain/register Endpoint

#### Endpoint

- **URL:** `/captain/register`
- **Method:** POST

#### Description

This endpoint registers a new captain by accepting captain details along with vehicle information. The input data is validated, and if successful, a new captain is created with a hashed password. An authentication token is then generated and returned.

#### Required Request Data

The request body must be in JSON format and include the following fields:

- **fullname:** An object with:
  - **firstname:** String (required, minimum 3 characters)
  - **lastname:** String (optional; if provided, minimum 3 characters)
- **email:** String (required, valid email format)
- **password:** String (required, minimum 6 characters)
- **vehicle:** An object with:
  - **color:** String (required, minimum 3 characters)
  - **plate:** String (required, unique, minimum 3 characters)
  - **capacity:** Number (required, minimum value 1)
  - **vehicleType:** String (required, must be one of `"bike"`, `"car"`, or `"auto"`)

**Example Request Body:**

```json
{
  "fullname": {
    "firstname": "Alice",
    "lastname": "Smith"
  },
  "email": "alice.smith@example.com",
  "password": "securePass123",
  "vehicle": {
    "color": "Red",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

#### Response

##### Success Response

- **Status Code:** 201 Created
- **Content:** JSON object containing:
  - `captain`: The newly created captain object (excluding the password).
  - `token`: The JWT authentication token.

**Example Success Response:**

```json
{
  "captain": {
    "_id": "609...",
    "fullname": {
      "firstname": "Alice",
      "lastname": "Smith"
    },
    "email": "alice.smith@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

##### Error Response

- **Status Code:** 400 Bad Request
- **Content:** JSON object containing either an array of validation errors or an error message if a captain with the provided email already exists.

**Example Error Response (Validation Errors):**

```json
{
  "errors": [
    {
      "msg": "Please provide a valid email",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "firstname must be at least 3 characters",
      "param": "fullname.firstname",
      "location": "body"
    },
    {
      "msg": "color must be at least 3 characters",
      "param": "vehicle.color",
      "location": "body"
    }
  ]
}
```

**Example Error Response (Duplicate Captain):**

```json
{
  "message": "Captain with this email already exists"
}
```

---

### /captain/login Endpoint

#### Endpoint

- **URL:** `/captain/login`
- **Method:** POST

#### Description

This endpoint logs in an existing captain. It accepts the captain's email and password, validates the credentials, and if successfully authenticated, returns a JWT token and the captain's information.

#### Required Request Data

The request body must be in JSON format and include the following fields:

- **email:** String (required, valid email format)
- **password:** String (required, minimum 6 characters)

**Example Request Body:**

```json
{
  "email": "alice.smith@example.com",
  "password": "securePass123"
}
```

#### Response

##### Success Response

- **Status Code:** 200 OK
- **Content:** JSON object containing:
  - `captain`: The authenticated captain object (excluding the password).
  - `token`: The JWT authentication token.

**Example Success Response:**

```json
{
  "captain": {
    "_id": "609...",
    "fullname": {
      "firstname": "Alice",
      "lastname": "Smith"
    },
    "email": "alice.smith@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

##### Error Response

- **Status Code:** 400 Bad Request
- **Content:** JSON object containing either an array of validation errors or an error message if authentication fails.

**Example Error Response (Validation Errors):**

```json
{
  "errors": [
    {
      "msg": "Please provide a valid email",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "password must be at least 6 characters",
      "param": "password",
      "location": "body"
    }
  ]
}
```

**Example Error Response (Authentication Failure):**

```json
{
  "message": "Invalid email or password"
}
```

---

### /captain/profile Endpoint

#### Endpoint

- **URL:** `/captain/profile`
- **Method:** GET

#### Description

This endpoint retrieves the profile of the authenticated captain. A valid JWT token must be provided in the cookies or the `Authorization` header.

#### Required Request Data

- No request body is required.
- The request must include a valid JWT token.

#### Response

##### Success Response

- **Status Code:** 200 OK
- **Content:** JSON object containing the captain's profile data.

**Example Success Response:**

```json
{
  "captain": {
    "_id": "609...",
    "fullname": {
      "firstname": "Alice",
      "lastname": "Smith"
    },
    "email": "alice.smith@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

##### Error Response

- **Status Code:** 401 Unauthorized
- **Content:** JSON object with an error message indicating that authentication failed.

**Example Error Response:**

```json
{
  "message": "Token is not valid"
}
```

---

### /captain/logout Endpoint

#### Endpoint

- **URL:** `/captain/logout`
- **Method:** GET

#### Description

This endpoint logs out an authenticated captain by blacklisting their JWT token and clearing it from their cookies, effectively ending their session.

#### Required Request Data

- No request body is required.
- The request must include a valid JWT token.

#### Response

##### Success Response

- **Status Code:** 200 OK
- **Content:** JSON object confirming successful logout.

**Example Success Response:**

```json
{
  "message": "Logged out successfully"
}
```

##### Error Response

- **Status Code:** 400 Bad Request
- **Content:** JSON object with an error message if no token is provided or if another issue occurs.

**Example Error Response:**

```json
{
  "message": "No token found to logout"
}
```

## Maps Routes

### /maps/get-coordinates Endpoint

#### Endpoint

- **URL:** `/maps/get-coordinates`
- **Method:** GET

#### Description

This endpoint retrieves the latitude and longitude coordinates for a given address using the MapTiler API.

#### Required Query Parameters

- **address:** String (required, minimum 3 characters)

**Example Request:**

```
GET /maps/get-coordinates?address=1600+Amphitheatre+Parkway
```

#### Response

##### Success Response

- **Status Code:** 200 OK
- **Content:** JSON object containing the latitude and longitude of the address.

**Example Success Response:**

```json
{
  "lat": 37.422,
  "lng": -122.084
}
```

##### Error Response

- **Status Code:** 400 Bad Request
- **Content:** JSON object with an error message if the address is invalid or not provided.

**Example Error Response:**

```json
{
  "message": "Invalid address"
}
```

---

### /maps/get-distance-time Endpoint

#### Endpoint

- **URL:** `/maps/get-distance-time`
- **Method:** GET

#### Description

This endpoint calculates the distance and estimated travel time between two locations using the OSRM API.

#### Required Query Parameters

- **origin:** String (required, minimum 3 characters)
- **destination:** String (required, minimum 3 characters)

**Example Request:**

```
GET /maps/get-distance-time?origin=New+York&destination=Los+Angeles
```

#### Response

##### Success Response

- **Status Code:** 200 OK
- **Content:** JSON object containing the distance and duration between the two locations.

**Example Success Response:**

```json
{
  "status": "OK",
  "distance": {
    "text": "4,500.00 km",
    "value": 4500000
  },
  "duration": {
    "text": "50 hours",
    "value": 180000
  }
}
```

##### Error Response

- **Status Code:** 400 Bad Request
- **Content:** JSON object with an error message if the origin or destination is invalid.

**Example Error Response:**

```json
{
  "message": "Invalid origin or destination"
}
```

---

### /maps/get-suggestions Endpoint

#### Endpoint

- **URL:** `/maps/get-suggestions`
- **Method:** GET

#### Description

This endpoint provides autocomplete suggestions for a given input query using the MapTiler API.

#### Required Query Parameters

- **input:** String (required, minimum 3 characters)

**Example Request:**

```
GET /maps/get-suggestions?input=San
```

#### Response

##### Success Response

- **Status Code:** 200 OK
- **Content:** JSON array of suggestions with place names and coordinates.

**Example Success Response:**

```json
[
  {
    "name": "San Francisco, California, USA",
    "coordinates": [-122.4194, 37.7749]
  },
  {
    "name": "San Jose, California, USA",
    "coordinates": [-121.8863, 37.3382]
  }
]
```

##### Error Response

- **Status Code:** 400 Bad Request
- **Content:** JSON object with an error message if the input query is invalid.

**Example Error Response:**

```json
{
  "message": "Input query is required"
}
```

---

## Ride Routes

### /ride/create Endpoint

#### Endpoint

- **URL:** `/ride/create`
- **Method:** POST

#### Description

This endpoint allows a user to create a new ride request by providing pickup and destination addresses, along with the desired vehicle type.

#### Required Request Data

The request body must be in JSON format and include the following fields:

- **pickup:** String (required, minimum 3 characters)
- **destination:** String (required, minimum 3 characters)
- **vehicleType:** String (required, must be one of `"car"`, `"auto"`, or `"bike"`)

**Example Request Body:**

```json
{
  "pickup": "1600 Amphitheatre Parkway",
  "destination": "1 Infinite Loop",
  "vehicleType": "car"
}
```

#### Response

##### Success Response

- **Status Code:** 201 Created
- **Content:** JSON object containing the created ride details.

**Example Success Response:**

```json
{
  "_id": "60b...",
  "user": "60a...",
  "pickup": "1600 Amphitheatre Parkway",
  "destination": "1 Infinite Loop",
  "fare": 150,
  "status": "Pending",
  "otp": "123456"
}
```

##### Error Response

- **Status Code:** 400 Bad Request
- **Content:** JSON object with an error message if any required field is missing or invalid.

**Example Error Response:**

```json
{
  "errors": [
    {
      "msg": "Invalid pickup address",
      "param": "pickup",
      "location": "body"
    },
    {
      "msg": "Invalid destination address",
      "param": "destination",
      "location": "body"
    }
  ]
}
```

---

## Notes

- All endpoints require authentication using a valid JWT token, which must be included in the request cookies or the `Authorization` header.
- Input validation is performed using the `express-validator` middleware.
- The `maps` routes use the MapTiler API for geocoding and the OSRM API for routing.
- The `ride` routes handle ride creation and fare calculation based on distance, duration, and vehicle type.

---

### Calculate Fare

Calculates the estimated fare for a ride based on pickup and destination locations.

- **URL**: `/rides/get-fare`
- **Method**: `POST`
- **Authentication**: Required

**Request Body**:

```json
{
  "pickup": "pickup_location_coordinates",
  "destination": "destination_location_coordinates"
}

Example Request:
{
  "pickup": "18.5204,73.8567",
  "destination": "18.5314,73.8446"
}
Success Response:
Code: 200 OK
Content:
{
  "fare": {
    "auto": 85,
    "car": 120,
    "bike": 65
  }
}
Error Responses:
Code: 400 Bad Request
Content: { "errors": [{ "msg": "Invalid input" }] }
Code: 500 Internal Server Error
Content: { "message": "Error message details" }
## Notes

- Input validation for captain routes is performed using the `express-validator` middleware.
- Password management uses bcrypt for secure hashing and comparison.
- JWT tokens are generated for authentication and must be included in subsequent requests either via cookies or the `Authorization` header.
- Authentication middleware is applied to protected routes to ensure only authenticated users can access them.

```
