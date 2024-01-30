# Wireview Backend Server

This repo contains server-side implementation for [Wireview](https://wireviewfrontend1.vercel.app/)  website. This server is responsible for handling user authentication, managing products, processing orders, and more.

## Tech Stack

- **Express.js:** A web application framework for Node.js.
- **MongoDB:** A NoSQL database used for storing user data, products, and orders.
- **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Cors:** Middleware for handling Cross-Origin Resource Sharing.
- **Bcrypt:** A library for hashing passwords.
- **Jsonwebtoken (JWT):** Used for creating and verifying JSON Web Tokens for user authentication.
- **Stripe:** Payment processing integration for handling transactions.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)

## Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/wireviewserver.git
```

2. Navigate to the project directory
```bash
cd wireviewserver
```

3. Install Dependencies
```bash
npm install
```

## Configure Environment Variables:

Create a .env file at the root of your project directory.
Add the necessary environment variables, including JWT_SECRET, STRIPE_KEY.

## Usage
1. Start the server
```bash
npm start
```
2. The server will be running on http://localhost:3001.

# API Endpoints

## Authentication: 

- Endpoints mentioned below require a valid user token in the Authorization header (`Bearer <token>`).
- `/admin/login` endpoint additionally requires an admin role for the user.

**Body Parameters:**

- All body parameters should be sent as JSON data in the request body.

**Response**

- All responses include a status code and a JSON body.
- Refer to the individual endpoint descriptions for specific response details.

### User Signup

**POST /signup**

Registers a new user.

**Request Body:**

| Parameter | Type | Description |
|---|---|---|
| username | string | Username for the new user |
| password | string | Password for the new user |

**Response**

- `201 Created`: Success message and JWT token if registration is successful
- `400 Bad Request`: Missing required fields or invalid data
- `403 Forbidden`: Username already exists

### User Login

**POST /login**

Logs in a regular user.

**Request Body:**

| Parameter | Type | Description |
|---|---|---|
| username | string | Username of the user |
| password | string | Password of the user |

**Response**

- `200 OK`: Success message and JWT token if login is successful
- `403 Forbidden`: Invalid username or password


### Admin Login

**POST /admin/login**

Logs in an admin user.

**Request Body:**

| Parameter | Type | Description |
|---|---|---|
| username | string | Username of the admin user |
| password | string | Password of the admin user |

**Response**

- `200 OK`: Success message, JWT token, username, and isAdmin flag if login is successful
- `403 Forbidden`: Invalid username or password, user is not an admin

### Get Current User Information

**GET /me**

Retrieves information about the currently authenticated user.

**Requires authentication**

**Middleware:**

- `authenticateJwt`: Validates the user's JWT token.

**Response**

- `200 OK`: User object
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: Invalid JWT token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database errors or other unexpected issues

**Potential Errors:**

- **Invalid JWT token:** If the JWT token is invalid or has expired, a 403 Forbidden response will be returned.
- **Database connection errors:** If the database is unavailable or encounters errors, a 500 Internal Server Error response will be returned, along with an error message in the JSON body.
- **Unexpected errors:** Other unexpected errors will also result in a 500 Internal Server Error response, with a generic error message.

## Cart Routes


**GET /cart**

Retrieves the user's cart.

**Requires authentication**

**Middleware:**

- `authenticateJwt`: Validates the user's JWT token.

**Response**

- `200 OK`: Cart object with populated products
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User not found
- `404 Not Found`: Cart not found
- `500 Internal Server Error`: Database errors or other unexpected issues

### Get Cart Quantity

**GET /cartQuantity**

Retrieves the total quantity of items in the user's cart.

**Requires authentication**

**Middleware:**

- `authenticateJwt`: Validates the user's JWT token.

**Response**

- `200 OK`: Total quantity of items in the cart
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User not found
- `404 Not Found`: Cart not found
- `500 Internal Server Error`: Database errors or other unexpected issues

### Delete Product from Cart

**DELETE /deleteFromCart/:productId**

Deletes a product from the user's cart.

**Requires authentication**

**Middleware:**

- `authenticateJwt`: Validates the user's JWT token.

**Response**

- `200 OK`: Success message
- `400 Bad Request`: Invalid product ID
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User not found
- `404 Not Found`: Cart not found or product not found in cart
- `500 Internal Server Error`: Database errors or other unexpected issues

### Add Product to Cart

**POST /addToCart**

Adds a product to the user's cart.

**Requires authentication**

**Middleware:**

- `authenticateJwt`: Validates the user's JWT token.

**Request Body:**

| Parameter | Type | Description |
|---|---|---|
| productId | string | ID of the product to add |
| quantity | number | Quantity of the product to add |
| price | number (optional) | Price of the product (if not already available in the product data) |

**Response**

- `200 OK`: Success message
- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User not found or product not found
- `409 Conflict`: Product addition failed due to conflicts
- `500 Internal Server Error`: Database errors or other unexpected issues


## Product Routes

### Get All Products

**GET /products**

Retrieves all published products.

**Response**

- `200 OK`: Array of product objects
- `404 Not Found`: No published products found
- `500 Internal Server Error`: Database errors or other unexpected issues

### Get Products by Category

**GET /category/:category**

Retrieves all published products within a specific category.

**Parameters:**

- `category`: The category to filter products by

**Response**

- `200 OK`: Array of product objects matching the category
- `404 Not Found`: Category not found or no published products in the category
- `500 Internal Server Error`: Database errors or other unexpected issues

### Get Product by ID

**GET /products/:productId**

Retrieves a specific product by its ID.

**Parameters:**

- `productId`: The ID of the product to retrieve

**Response**

- `200 OK`: Product object
- `404 Not Found`: Product not found
- `500 Internal Server Error`: Database errors or other unexpected issues


## Purchase Routes

### Create Order

**POST /purchase**

Creates a new order for the authenticated user.

**Requires authentication:** Yes

**Middleware:** `authenticateJwt`

| Parameter | Description | Required | Data Type | Example |
|---|---|---|---|---|
| `products` | Array of products to purchase | Yes | Array of Objects | `[{"productId": "123", "quantity": 2}, {"productId": "456", "quantity": 1}]` |


**Response**

- 200 OK: Success message
- 400 Bad Request: Missing or invalid products - data
- 404 Not Found: User not found
- 401 Unauthorized: Invalid or missing authentication token
- 500 Internal Server Error: Database errors or other unexpected issues

**POST /create-checkout-session**

To initiate a checkout process

**Requires authentication:** Yes

**Middleware:** `authenticateJwt`


**Request**

| Parameter | Description | Required | Data Type | Example |
|---|---|---|---|---|
| `product` | Array of products to purchase | Yes | Array of Objects | `[{"name": "Product Name", "price": 10.99, "quantity": 2}]` |

**Response**

- 200 OK:  Stripe checkout session object 
- 404 Not Found:  User not found 
- 400 Bad Request:  Missing or invalid product data 
- 401 Unauthorized:  Invalid or missing authentication token 
- 500 Internal Server Error:  Database errors or other unexpected issues 

**Additional Notes**

- The route uses the stripe library to create a Stripe checkout session.
- It creates a new order in the database and updates the user's order history.
- It clears the user's cart after a successful checkout.

## Admin Routes

### Get Orders

**GET /orders**

Retrieves all the orders.

**Response**

- 200 OK: Array of order objects, sorted by date in descending order
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: User is not an admin
- 404 Not Found: User not found
- 500 Internal Server Error: Error fetching orders

### Update Order Status

PUT /updateOrderStatus/:orderId

| Parameter | Description | Required | Data Type |
|---|---|---|---|
| `orderId` | ID of the order to update | Yes | String |
| `status` | New status of the order | Yes | String |

**Response**

- 200 OK: Message indicating successful status update
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: User is not an admin
- 404 Not Found: Order not found
- 400 Bad Request: Missing or invalid status data
- 500 Internal Server Error: Error updating order status

### Add Product 

POST /addproduct

Requires authentication: Yes
Requires Admin Priviliges: Yes 

Middleware: authenticateJwt

## Request

| Parameter | Description | Required | Data Type |
|---|---|---|---|
| `productName` | Name of the product | Yes | String |
| `productDescription` | Description of the product | Yes | String |
| `productPrice` | Price of the product | Yes | Number |
| `productCategory` | Category of the product | Yes | String |
| `productColor` | Color of the product | Yes | String |
| `productQuantity` | Quantity of the product available | Yes | Number |
| `productMediaUrl` | URL of the product's main image | Yes | String |
| `thUrl` | URL of the product's thumbnail image | Yes | String |
| `published` | Whether the product should be published immediately (optional) | Yes | Boolean |


**Response**

- 201 Created: Saved product object and success message
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: User is not an admin or missing required fields
- 400 Bad Request: Missing or invalid product data
- 500 Internal Server Error: Error adding the product

## Product Routes

GET /products

Requires authentication: No

Request:

No parameters required.

**Response**

- 200 OK: Array of published product objects 
- 500 Internal Server Error: Error fetching products 

### Get Products by Category

GET /category/:category

Requires authentication: No

Request:

| Parameter | Description |Required|Data Type|
|---|---|---|---|
| Category | Name of the category to retrieve products for |
| Yes | String |


**Response**

- 200 OK: Array of published product objects matching the category 
- 404 Not Found:  Category not found or no published products in the category 
- 500 Internal Server Error: Error fetching products 

### Get Product by ID

GET /products/:productId

Requires authentication: No

**Request**

| Parameter | Description |Required|Data Type|
|---|---|---|---|
| productId | ID of the product to retrieve || Yes | String |

**Response**

- 200 OK: Product object 
- 404 Not Found: Product not found
- 500 Internal Server Error: Error fetching product

### Order history

**Request**

No parameters required.

**Response**

- 200 OK: Array of user's order history objects, including populated product details.
- 401 Unauthorized: Invalid or missing authentication token.
- 404 Not Found: User not found.
- 500 Internal Server Error: Error fetching order history.






