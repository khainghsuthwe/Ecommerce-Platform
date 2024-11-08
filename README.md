# E-commerce API 
This is the API for an e-commerce application built with Node.js and Express.js. The project specifications can be found on [roadmap.sh](https://roadmap.sh/projects/ecommerce-api)
## Table of Contents

1. [TechStack](#techstack)
2. [Installation and Setup](#installation-and-setup)
   - [Clone the Repository](#clone-the-repository)
   - [Install Dependencies](#install-dependencies)
   - [Setup .env file](#setup-env-file)
3. [Running the Server](#running-the-server)
    -  [Base URL](#base-url)
5. [API Endpoints](#api-endpoints)
   - [1. User](#1-user)
     - [POST /api/users/register](#post-apiusersregister)
     - [POST /api/users/login](#post-apiuserslogin)
   - [2. Products](#2-products)
   - [3. Cart](#3-cart)
   - [4. Categories](#4-categories)
   - [5. Payment](#5-payment)

## TechStack
- Nodejs with TypeScript
- MongoDB
- JWT authentication
- Stripe payment integration

## Installation and Setup
 - clone the repository
 ```
 git clone 
 ```
 - go to backend directory
 ```
 cd backend
 ```

 - install packages
 ```
 npm install
 ```

### Setup .env file
- Inside 'backend' directory, create a .env file.

```
MONGODB_URI = <your mongodb uri>
JWT_SECRET= <your_jwt_secret>
STRIPE_SECRET_KEY = <your stripe api key>
```

## Running

- run the server
```
npm run dev
```

### Base URL 
```
http://localhost:5000/
```

### Authentication
The API uses JWT (JSON Web Tokens) for authentication. All routes that require authentication need a valid JWT token passed in the Authorization header as a Bearer token.
```
Authorization: Bearer <your-jwt-token>

```

## API Endpoints

### 1. User
#### **POST** /api/users/register
- **Description**: Register a new user in the system.
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
  }

#### **POST** /api/users/login
- **Description**: Login user and returns JWT token.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
  }

### 2. Products
#### **GET** /api/products
- **Description**: Fetch all products
- **Request Body**:
```json
{
    [
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "inventory": "number",
    "image":"string",
    "tags":"list of string"
  }
]
}
```
#### **GET** /api/products/:id
- **Description**: Fetches a single product by its ID
- **Request Body**:
```json
{
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "inventory": "number",
    "image":"string",
    "tags":"list of string"
}
```

#### **GET** /api/products/
- **Description**: Creates a new product (Admin only).
- **Request Body**:
```json
{
    "id": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "inventory": "number",
    "image":"string",
    "tags":"list of string"
}
```
**PUT** /api/products/:id
- **Description**: Updates an existing product (Admin only).

### 3. Cart
#### **GET** /api/cart/view
#### **POST** /api/cart/add
#### **Delete** /api/cart/remove/:productId

### 4. Categories
#### **GET** /api/categories
#### **GET** /api/categories/:id


### 5. Payment
#### **POST** /api/checkout