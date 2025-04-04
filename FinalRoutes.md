# 📘 Deduplicated Combined API Documentation

This document includes **non-redundant** detailed routes from all sources.

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

### **c. Get Details of a Specific Item**
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

### **d. Update an Item**
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

### **e. Delete an Item**
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

### **f. Claim an Item**
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

### **g. Mark an Item as Returned**
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

### **h. Assign a Keeper to an Item**
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

## **4. Messages API**

### **a. Get Messages in a Conversation**
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

### **b. Send a Message**
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

## **5. Search API**

### **a. Search for Items**
- **Endpoint**: `GET /search/items/search`
- **Description**: Searches for items based on title, description, tags, category, or location.
- **Query Parameters**:
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `10`)
  - `sortBy`: Field to sort by (default: `createdAt`)
  - `order`: Sort order (`asc` or `desc`, default: `desc`)
  - `search`: Search term (optional, case-insensitive)
- **Example Request**:
  ```
---

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

## **6. Keepers API**

### **a. Get Available Keepers**
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

## **7. Error Handling**

### **a. Standard Error Response**
All API endpoints return error responses in the following format:
```json
{
  "error": "Error message describing the issue",
  "details": {
    // Additional details about the error (if applicable)
  }
}
```

### **b. Common HTTP Status Codes**
- `200 OK`: Successful request.
- `201 Created`: Resource created successfully.
- `400 Bad Request`: Invalid input or missing fields.
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: User does not have permission to perform the action.
- `404 Not Found`: Resource not found.
- `500 Internal Server Error`: Unexpected server error.

---

## **8. Best Practices for Frontend Integration**

### **a. Authentication**
- Always include the JWT token in the `Authorization` header for authenticated requests:
  ```
  Authorization: Bearer <token>
  ```
- Store the token securely (e.g., in localStorage or cookies) and handle token expiration gracefully.

### **b. Pagination**
- Use the `pagination` object in the response to implement pagination in your frontend.
- Example:
  ```javascript
  const { currentPage, totalPages } = response.pagination;
  ```

### **c. File Uploads**
- For endpoints that require file uploads (e.g., creating an item with an image), use `multipart/form-data` for the request body.
- Example using `FormData` in JavaScript:
  ```javascript
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('title', 'Lost Wallet');
  formData.append('description', 'Black leather wallet lost near the library.');
  fetch('/api/v1/items', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  ```

### **d. Real-Time Updates**
- If your application supports real-time updates (e.g., notifications or messages), consider integrating **Socket.IO** or **WebSockets**.
- Example:
  ```javascript
  const socket = io('http://localhost:5000');
  socket.on('newNotification', (notification) => {
    console.log('New notification:', notification);
  });
  ```

---

## **9. Testing APIs Locally**
To test the APIs locally:
1. Use tools like **Postman** or **Insomnia** to manually test endpoints.
2. Automate API testing using libraries like **Jest** or **Cypress**.
3. Simulate user interactions and ensure all endpoints work as expected.

---

## **10. Deployment Considerations**
- Replace the development base URL (`http://localhost:5000`) with the production base URL in your frontend code.
- Ensure CORS is properly configured on the backend to allow requests from your frontend domain.
- Use environment variables to manage API URLs and other sensitive data.

---

## **Conclusion**
This documentation provides a comprehensive guide for frontend developers to integrate with the Lost & Found application's backend APIs. It includes details about authentication, endpoints, request/response formats, and best practices for implementation. If you have any questions or need further clarification, feel free to ask! 🚀

---

## 📄 Content from NewAPIdocs.md

Below is the complete API routes documentation in Markdown (`.md`) format, consolidating all the previous routes and the newly created routes (e.g., category-related routes). This documentation reflects the current state of your backend API as of April 04, 2025, based on the routes we’ve implemented and discussed.

---

# API Routes Documentation

**Base URL**: `http://localhost:5000/api/v1`

**Authentication**:
- Most endpoints require a Bearer token in the `Authorization` header.
- Example: `Authorization: Bearer <your-token>`
- Admin-only endpoints require the user to have the `admin` role, enforced by middleware.

---

## Endpoints

### Authentication

#### POST /auth/register
- **Description**: Register a new user (admin, keeper, or regular user).
- **Access**: Admin-only (for creating admin/keeper accounts).
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "string" // "admin", "keeper", or "user"
  }
  ```
- **Response**:
  - **201 Created**:
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string"
      }
    }
    ```
  - **400 Bad Request**:
    ```json
    {
      "message": "User already exists",
      "code": "USER_EXISTS"
    }
    ```

#### POST /auth/login
- **Description**: Log in a user and return a JWT token.
- **Access**: Public.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Login successful",
      "token": "string",
      "user": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string"
      }
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "message": "Invalid credentials",
      "code": "INVALID_CREDENTIALS"
    }
    ```

---

### Admin Dashboard

#### GET /admin/dashboard-stats
- **Description**: Fetch statistics for the admin dashboard.
- **Access**: Admin-only.
- **Query Parameters**:
  - None.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Dashboard stats fetched successfully",
      "stats": {
        "totalItems": "number",
        "claimedItems": "number",
        "unclaimedItems": "number",
        "totalUsers": "number",
        "totalCategories": "number",
        "mostActiveUsers": [
          {
            "userId": "string",
            "name": "string",
            "email": "string",
            "itemCount": "number"
          }
        ]
      }
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to fetch dashboard stats",
      "code": "SERVER_ERROR"
    }
    ```

#### GET /admin/users
- **Description**: Fetch all users with pagination.
- **Access**: Admin-only.
- **Query Parameters**:
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 10): Number of users per page.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Users fetched successfully",
      "users": [
        {
          "_id": "string",
          "name": "string",
          "email": "string",
          "role": "string",
          "createdAt": "string",
          "isActive": "boolean"
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "total": "number"
      }
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to fetch users",
      "code": "FETCH_ERROR"
    }
    ```

#### GET /admin/users/:id
- **Description**: Fetch a specific user by ID.
- **Access**: Admin-only.
- **Path Parameters**:
  - `id`: User ID.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "User fetched successfully",
      "user": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "createdAt": "string",
        "isActive": "boolean"
      }
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "User not found",
      "code": "NOT_FOUND"
    }
    ```

#### DELETE /admin/users/:id
- **Description**: Soft-delete a user by setting `isActive` to `false`.
- **Access**: Admin-only.
- **Path Parameters**:
  - `id`: User ID.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "User deactivated successfully"
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "User not found",
      "code": "NOT_FOUND"
    }
    ```

#### GET /admin/users/:id/items
- **Description**: Fetch items posted by a specific user with pagination.
- **Access**: Admin-only.
- **Path Parameters**:
  - `id`: User ID.
- **Query Parameters**:
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 10): Number of items per page.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "User items fetched successfully",
      "items": [
        {
          "_id": "string",
          "title": "string",
          "status": "string",
          "postedBy": {
            "_id": "string",
            "name": "string"
          },
          "category": {
            "_id": "string",
            "name": "string"
          },
          "createdAt": "string",
          "isActive": "boolean"
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "total": "number"
      }
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "User not found",
      "code": "NOT_FOUND"
    }
    ```

#### GET /admin/items
- **Description**: Fetch all items with pagination.
- **Access**: Admin-only.
- **Query Parameters**:
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 10): Number of items per page.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Items fetched successfully",
      "items": [
        {
          "_id": "string",
          "title": "string",
          "status": "string",
          "postedBy": {
            "_id": "string",
            "name": "string"
          },
          "category": {
            "_id": "string",
            "name": "string"
          },
          "createdAt": "string",
          "isActive": "boolean"
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "total": "number"
      }
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to fetch items",
      "code": "FETCH_ERROR"
    }
    ```

#### GET /admin/items/:id
- **Description**: Fetch a specific item by ID.
- **Access**: Admin-only.
- **Path Parameters**:
  - `id`: Item ID.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Item fetched successfully",
      "item": {
        "_id": "string",
        "title": "string",
        "description": "string",
        "status": "string",
        "postedBy": {
          "_id": "string",
          "name": "string"
        },
        "category": {
          "_id": "string",
          "name": "string"
        },
        "createdAt": "string",
        "isActive": "boolean"
      }
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "Item not found",
      "code": "NOT_FOUND"
    }
    ```

#### DELETE /admin/items/:id
- **Description**: Soft-delete an item by setting `isActive` to `false`.
- **Access**: Admin-only.
- **Path Parameters**:
  - `id`: Item ID.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Item deactivated successfully"
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "Item not found",
      "code": "NOT_FOUND"
    }
    ```

#### GET /admin/conversations
- **Description**: Fetch all conversations with pagination.
- **Access**: Admin-only.
- **Query Parameters**:
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 10): Number of conversations per page.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Conversations fetched successfully",
      "conversations": [
        {
          "_id": "string",
          "item": {
            "_id": "string",
            "title": "string",
            "status": "string"
          },
          "participants": [
            {
              "_id": "string",
              "name": "string"
            }
          ],
          "messages": [
            {
              "_id": "string",
              "sender": {
                "_id": "string",
                "name": "string"
              },
              "content": "string",
              "createdAt": "string"
            }
          ],
          "lastMessage": {
            "content": "string",
            "createdAt": "string"
          }
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "total": "number"
      }
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to fetch conversations",
      "code": "FETCH_ERROR"
    }
    ```

---

### Categories

#### GET /categories
- **Description**: Fetch all active categories with pagination (public endpoint).
- **Access**: Public.
- **Query Parameters**:
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 10): Number of categories per page.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Categories fetched successfully",
      "categories": [
        {
          "_id": "string",
          "name": "string",
          "description": "string",
          "isActive": true,
          "createdAt": "string"
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "total": "number"
      }
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to fetch categories",
      "code": "FETCH_ERROR"
    }
    ```

#### GET /categories/admin
- **Description**: Fetch all categories (active and inactive) with pagination (admin-only).
- **Access**: Admin-only.
- **Query Parameters**:
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 10): Number of categories per page.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "All categories fetched successfully for admin",
      "categories": [
        {
          "_id": "string",
          "name": "string",
          "description": "string",
          "isActive": "boolean",
          "createdAt": "string"
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "total": "number"
      }
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to fetch categories for admin",
      "code": "FETCH_ERROR"
    }
    ```

#### POST /categories
- **Description**: Add a new category.
- **Access**: Admin-only.
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response**:
  - **201 Created**:
    ```json
    {
      "message": "Category added successfully",
      "category": {
        "_id": "string",
        "name": "string",
        "description": "string",
        "isActive": true,
        "createdAt": "string"
      }
    }
    ```
  - **400 Bad Request**:
    ```json
    {
      "message": "Category already exists",
      "code": "CATEGORY_EXISTS"
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to add category",
      "code": "SERVER_ERROR"
    }
    ```

#### PUT /categories/:id
- **Description**: Update an existing category.
- **Access**: Admin-only.
- **Path Parameters**:
  - `id`: Category ID.
- **Request Body**:
  ```json
  {
    "name": "string", // optional
    "description": "string", // optional
    "isActive": "boolean" // optional
  }
  ```
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Category updated successfully",
      "category": {
        "_id": "string",
        "name": "string",
        "description": "string",
        "isActive": "boolean",
        "createdAt": "string"
      }
    }
    ```
  - **400 Bad Request**:
    ```json
    {
      "message": "Category name already exists",
      "code": "CATEGORY_EXISTS"
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "Category not found",
      "code": "NOT_FOUND"
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to update category",
      "code": "SERVER_ERROR"
    }
    ```

#### DELETE /categories/:id
- **Description**: Soft-delete a category by setting `isActive` to `false`.
- **Access**: Admin-only.
- **Path Parameters**:
  - `id`: Category ID.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Category deactivated successfully"
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "Category not found",
      "code": "NOT_FOUND"
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to deactivate category",
      "code": "SERVER_ERROR"
    }
    ```

---

### Keepers

#### GET /keepers
- **Description**: Fetch all keepers.
- **Access**: Admin-only.
- **Query Parameters**:
  - None.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Keepers fetched successfully",
      "keepers": [
        {
          "_id": "string",
          "name": "string",
          "email": "string",
          "role": "keeper"
        }
      ]
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Failed to fetch keepers",
      "code": "FETCH_ERROR"
    }
    ```

---

### User-Specific Endpoints

#### GET /users/me/items
- **Description**: Fetch items posted by the logged-in user with pagination.
- **Access**: Authenticated users (non-admin).
- **Query Parameters**:
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 10): Number of items per page.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "User items fetched successfully",
      "items": [
        {
          "_id": "string",
          "title": "string",
          "status": "string",
          "postedBy": {
            "_id": "string",
            "name": "string"
          },
          "category": {
            "_id": "string",
            "name": "string"
          },
          "createdAt": "string",
          "isActive": "boolean"
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "total": "number"
      }
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "message": "Unauthorized",
      "code": "UNAUTHORIZED"
    }
    ```

#### GET /conversations
- **Description**: Fetch conversations for the logged-in user with pagination.
- **Access**: Authenticated users (non-admin).
- **Query Parameters**:
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 10): Number of conversations per page.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Conversations fetched successfully",
      "conversations": [
        {
          "_id": "string",
          "item": {
            "_id": "string",
            "title": "string",
            "status": "string"
          },
          "participants": [
            {
              "_id": "string",
              "name": "string"
            }
          ],
          "messages": [
            {
              "_id": "string",
              "sender": {
                "_id": "string",
                "name": "string"
              },
              "content": "string",
              "createdAt": "string"
            }
          ],
          "lastMessage": {
            "content": "string",
            "createdAt": "string"
          }
        }
      ],
      "pagination": {
        "currentPage": "number",
        "totalPages": "number",
        "total": "number"
      }
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "message": "Unauthorized",
      "code": "UNAUTHORIZED"
    }
    ```

---

### Notes
- **Soft Deletes**: Deactivation (soft delete) sets the `isActive` field to `false` for users, items, and categories.
- **Pagination**: Paginated endpoints return a `pagination` object with `currentPage`, `totalPages`, and `total`.
- **Error Handling**: All endpoints return a `code` field in error responses to help identify the issue.
- **Missing Endpoints**: Some user-specific endpoints (e.g., `POST /items`, `PUT /items/:id`, `DELETE /items/:id`, `POST /conversations`, `POST /items/:id/claim`) are referenced in the frontend but not yet documented here. These will need to be added as we implement the corresponding backend routes.