# Lost & Found - College Cornerstone Project

A full-stack MERN-based Lost and Found management system built for college campuses. Users can report lost or found items, communicate with finders/owners, and manage item data with admin support.

---

## 📁 Project Structure

```
📦Lost_And_Found
 ┣ 📂backend      ← Node.js Express API
 ┗ 📂frontend     ← React Vite frontend
```

---

## 🚀 Features

- 🔐 Authentication with roles (User, Admin)
- 📦 CRUD for Lost/Found items
- 💬 Messaging between users
- 🔔 Notifications
- 📁 Image uploads with Cloudinary
- 🧠 Smart search and filters
- 🧑‍💻 Admin panel to manage users/items

---

## ⚙️ Prerequisites

- Node.js (v18+)
- MongoDB (Atlas/local)
- Cloudinary Account (for image uploads)
- Git

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Swastik007sharma/Lost_And_Found.git
cd Lost_And_Found
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

#### ✅ Configure Environment Variables

Create a `.env` file in `/backend` with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

> 🔒 *Never commit your actual credentials.*

#### 🚀 Run the Backend Server

```bash
npm run dev
```

---

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
```

#### ✅ Configure Environment Variables

Create a `.env` file in `/frontend` with the following:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

#### 🚀 Run the Frontend App

```bash
npm run dev
```

---

## 📸 Screenshots

> _Coming Soon!_

---

## 📚 Docs

- [API Documentation](backend/API_Documentation.md)
- [Frontend Guide](backend/DocForFrontendDev.md)
- [Routes Overview](FinalRoutes.md)

---

## 👨‍💻 Author

Made with ❤️ by [Swastik Sharma](https://github.com/Swastik007sharma)

---

## 📝 License

MIT License

