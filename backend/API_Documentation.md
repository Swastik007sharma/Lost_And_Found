# **Backend API Documentation**

This document provides a detailed overview of all API endpoints, including their purpose, request/response formats, and examples. Use this guide to test the API and develop the frontend.

---
Certainly! Below is the complete documentation for all the APIs in your application. This will help you test them using Postman or any other API testing tool.

---

### **Base URL**
- `http://localhost:5000/api/v1` (or the appropriate base URL where your server is running)

---

## **Authentication APIs**

### **1. Register a User**
- **Endpoint**: `POST /auth/register`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "_id": "652f8e2b3d4c9d1a4c8b4567",
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
  }
  ```

---

### **2. Login a User**
- **Endpoint**: `POST /auth/login`
- **Description**: Logs in a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "token": "your-jwt-token"
  }
  ```

---

## **Item APIs**

### **1. Create an Item**
- **Endpoint**: `POST /items`
- **Description**: Creates a new lost/found item.
- **Headers**:
  - `Authorization: Bearer <token>` (JWT token from login)
- **Request Body**:
  ```json
  {
    "title": "Lost Wallet",
    "description": "Black leather wallet lost near the library.",
    "category": "Accessories",
    "tags": ["black", "leather"],
    "status": "Unclaimed",
    "location": "Library"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Item created successfully",
    "item": {
      "_id": "652f8e2b3d4c9d1a4c8b4568",
      "title": "Lost Wallet",
      "description": "Black leather wallet lost near the library.",
      "category": "Accessories",
      "tags": ["black", "leather"],
      "status": "Unclaimed",
      "location": "Library",
      "postedBy": "652f8e2b3d4c9d1a4c8b4567"
    }
  }
  ```

---

### **2. Get All Items**
- **Endpoint**: `GET /items`
- **Description**: Fetches all items with optional filters (pagination, sorting, search).
- **Query Parameters**:
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `10`)
  - `sortBy`: Field to sort by (default: `createdAt`)
  - `order`: Sort order (`asc` or `desc`, default: `desc`)
  - `search`: Search term (optional)
- **Example Request**:
  ```
  GET /items?page=1&limit=5&sortBy=title&order=asc&search=wallet
  ```
- **Response**:
  ```json
  {
    "message": "Items fetched successfully",
    "items": [
      {
        "_id": "652f8e2b3d4c9d1a4c8b4568",
        "title": "Lost Wallet",
        "description": "Black leather wallet lost near the library.",
        "category": "Accessories",
        "tags": ["black", "leather"],
        "status": "Unclaimed",
        "location": "Library",
        "postedBy": {
          "_id": "652f8e2b3d4c9d1a4c8b4567",
          "name": "John Doe",
          "email": "john.doe@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalResults": 10
    }
  }
  ```

---

### **3. Get Details of a Specific Item**
- **Endpoint**: `GET /items/:id`
- **Description**: Fetches details of a specific item by its ID.
- **Path Parameter**:
  - Replace `:id` with the `_id` of the item.
- **Response**:
  ```json
  {
    "item": {
      "_id": "652f8e2b3d4c9d1a4c8b4568",
      "title": "Lost Wallet",
      "description": "Black leather wallet lost near the library.",
      "category": "Accessories",
      "tags": ["black", "leather"],
      "status": "Unclaimed",
      "location": "Library",
      "postedBy": {
        "_id": "652f8e2b3d4c9d1a4c8b4567",
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
  }
  ```

---

### **4. Update an Item**
- **Endpoint**: `PUT /items/:id`
- **Description**: Updates an existing item.
- **Headers**:
  - `Authorization: Bearer <token>` (JWT token from login)
- **Path Parameter**:
  - Replace `:id` with the `_id` of the item.
- **Request Body**:
  ```json
  {
    "title": "Updated Wallet Title",
    "description": "Updated description."
  }
  ```
- **Response**:
  ```json
  {
    "message": "Item updated successfully",
    "item": {
      "_id": "652f8e2b3d4c9d1a4c8b4568",
      "title": "Updated Wallet Title",
      "description": "Updated description."
    }
  }
  ```

---

### **5. Delete an Item**
- **Endpoint**: `DELETE /items/:id`
- **Description**: Deletes an item by its ID.
- **Headers**:
  - `Authorization: Bearer <token>` (JWT token from login)
- **Path Parameter**:
  - Replace `:id` with the `_id` of the item.
- **Response**:
  ```json
  {
    "message": "Item deleted successfully"
  }
  ```

---

### **6. Claim an Item**
- **Endpoint**: `POST /items/:id/claim`
- **Description**: Marks an item as claimed.
- **Headers**:
  - `Authorization: Bearer <token>` (JWT token from login)
- **Path Parameter**:
  - Replace `:id` with the `_id` of the item.
- **Response**:
  ```json
  {
    "message": "Item claimed successfully",
    "item": {
      "_id": "652f8e2b3d4c9d1a4c8b4568",
      "title": "Lost Wallet",
      "status": "Claimed"
    }
  }
  ```

---

### **7. Mark an Item as Returned**
- **Endpoint**: `POST /items/:id/return`
- **Description**: Marks an item as returned.
- **Headers**:
  - `Authorization: Bearer <token>` (JWT token from login)
- **Path Parameter**:
  - Replace `:id` with the `_id` of the item.
- **Response**:
  ```json
  {
    "message": "Item marked as returned successfully",
    "item": {
      "_id": "652f8e2b3d4c9d1a4c8b4568",
      "title": "Lost Wallet",
      "status": "Returned"
    }
  }
  ```

---

### **8. Assign a Keeper to an Item**
- **Endpoint**: `POST /items/:id/assign-keeper`
- **Description**: Assigns a keeper to an item.
- **Headers**:
  - `Authorization: Bearer <token>` (JWT token from login)
- **Path Parameter**:
  - Replace `:id` with the `_id` of the item.
- **Request Body**:
  ```json
  {
    "keeperId": "652f8e2b3d4c9d1a4c8b4567"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Item assigned to keeper successfully",
    "item": {
      "_id": "652f8e2b3d4c9d1a4c8b4568",
      "title": "Lost Wallet",
      "keeper": "652f8e2b3d4c9d1a4c8b4567"
    }
  }
  ```

---

## **Message APIs**

### **1. Get Messages in a Conversation**
- **Endpoint**: `GET /conversations/:id/messages`
- **Description**: Fetches all messages in a specific conversation.
- **Headers**:
  - `Authorization: Bearer <token>` (JWT token from login)
- **Path Parameter**:
  - Replace `:id` with the `_id` of the conversation.
- **Query Parameters**:
  - `page`: Page number (default: `1`)
  - `limit`: Messages per page (default: `10`)
- **Response**:
  ```json
  {
    "messages": [
      {
        "_id": "652f8e2b3d4c9d1a4c8b4569",
        "conversation": "652f8e2b3d4c9d1a4c8b4568",
        "sender": {
          "_id": "652f8e2b3d4c9d1a4c8b4567",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "text": "Hello, how are you?",
        "createdAt": "2023-10-15T12:34:56.789Z"
      }
    ]
  }
  ```

---

### **2. Send a Message**
- **Endpoint**: `POST /conversations/:id/send-message`
- **Description**: Sends a message in a specific conversation.
- **Headers**:
  - `Authorization: Bearer <token>` (JWT token from login)
- **Path Parameter**:
  - Replace `:id` with the `_id` of the conversation.
- **Request Body**:
  ```json
  {
    "text": "Hello, how are you?"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Message sent successfully",
    "message": {
      "_id": "652f8e2b3d4c9d1a4c8b4569",
      "conversation": "652f8e2b3d4c9d1a4c8b4568",
      "sender": {
        "_id": "652f8e2b3d4c9d1a4c8b4567",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "text": "Hello, how are you?",
      "createdAt": "2023-10-15T12:34:56.789Z"
    }
  }
  ```

---

## **Search APIs**

### **1. Search for Items**
- **Endpoint**: `GET /search/items/search`
- **Description**: Searches for items based on title, description, tags, category, or location.
- **Query Parameters**:
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `10`)
  - `sortBy`: Field to sort by (default: `createdAt`)
  - `order`: Sort order (`asc` or `desc`, default: `desc`)
  - `search`: Search term (optional, case-insensitive)

  ```plaintext
  - `sortBy`: Field to sort by (default: `createdAt`)
  - `order`: Sort order (`asc` or `desc`, default: `desc`)
  - `search`: Search term (optional)
```
- **Example Request**:
  ```
  GET /search/items/search?page=1&limit=5&sortBy=title&order=asc&search=wallet
  ```
- **Response**:
  ```json
  {
    "message": "Items fetched successfully",
    "items": [
      {
        "_id": "652f8e2b3d4c9d1a4c8b4568",
        "title": "Lost Wallet",
        "description": "Black leather wallet lost near the library.",
        "category": "Accessories",
        "tags": ["black", "leather"],
        "status": "Unclaimed",
        "location": "Library",
        "postedBy": {
          "_id": "652f8e2b3d4c9d1a4c8b4567",
          "name": "John Doe",
          "email": "john.doe@example.com"
        },
        "createdAt": "2023-10-15T12:34:56.789Z",
        "updatedAt": "2023-10-15T12:34:56.789Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalResults": 10
    }
  }
  ```

---

## **Keeper APIs**

### **1. Get Available Keepers**
- **Endpoint**: `GET /keepers`
- **Description**: Fetches a list of available keepers.
- **Response**:
  ```json
  {
    "keepers": [
      {
        "_id": "652f8e2b3d4c9d1a4c8b4567",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "createdAt": "2023-10-15T12:34:56.789Z"
      }
    ]
  }
  ```

---

## **Testing Tips for Postman**

1. **Set Up Environment Variables**:
   - Create an environment in Postman and store your JWT token as a variable (e.g., `{{token}}`).
   - Use this variable in the `Authorization` header for authenticated requests.

2. **Authentication**:
   - Use the `/auth/login` endpoint to get a JWT token.
   - Copy the token from the response and set it in the `Authorization` header for subsequent requests.

3. **File Uploads**:
   - For endpoints that require file uploads (e.g., creating an item with an image), use the `form-data` body type in Postman.
   - Add a key named `file` and select the file you want to upload.

4. **Pagination and Sorting**:
   - Use query parameters like `page`, `limit`, `sortBy`, and `order` to test pagination and sorting functionality.

5. **Error Handling**:
   - Test invalid inputs, missing fields, and unauthorized access to ensure proper error responses.

---

### **Conclusion**

This documentation covers all the APIs in your application, including their endpoints, request/response formats, and query parameters. You can now use Postman to test these APIs effectively. If you need further clarification or additional details, feel free to ask! 🚀