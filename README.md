# ♻️ ReWear – Apparel Swap Platform

A full-stack apparel swapping platform built with **React**, **Node.js**, and **MongoDB** to promote sustainable fashion by enabling users to list, browse, and swap unused clothing items.

The application allows authenticated and verified users to manage apparel listings, upload images, and perform secure swap operations through a clean and user-friendly interface.

---

## Git Repository

Repository Link: `https://github.com/nuwanakanadil/demo.git`

---

## 🚀 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Nodemailer
- Cloudinary
- Multer

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Axios

---

## ✨ Features

### Authentication & Security
- User registration and login
- JWT-based authentication
- Email verification required before login
- Backend-level route protection
- Verified-user-only actions

### Apparel Management
- Create apparel items with category, size, and condition
- Upload multiple images per item
- Edit and delete owned apparel items
- Browse all available apparel
- View personal apparel listings

### Swap Operations
- Send swap requests for available items
- View incoming and outgoing swap requests
- Accept, reject, or complete swaps
- Ownership-based authorization and validation
- Swap logistics handling and completion tracking

### Notifications
- View notifications for authenticated users
- Mark one notification as read
- Mark all notifications as read
- View unread notification count

### Admin Features
- Admin dashboard statistics
- Manage users and user account status
- View and manage items, swaps, and reviews
- Block or unblock items

### Image Handling
- Image uploads handled via Multer
- Images stored securely in Cloudinary
- Stored as `{ url, public_id }`
- Supports future image removal and updates

---

## 🧠 Design Decisions

- JWT authentication combined with backend middleware ensures secure access control.
- Email verification is mandatory to prevent misuse of the platform.
- Cloudinary is used for image storage to reduce server load and improve scalability.
- Business logic is separated into controllers, services, and middlewares for maintainability.
- Email sending is handled asynchronously to avoid blocking API responses.
- MongoDB is used to support flexible schema design for apparel, swaps, reviews, and notifications.

---

## 📋 System Requirements

- Node.js 18 or higher
- NPM
- MongoDB local instance or MongoDB Atlas
- Cloudinary account
- Gmail account with App Password enabled

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/nuwanakanadil/demo.git
cd demo
```

### 2. Install dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 3. Configure environment variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Create a `.env` file inside the frontend directory if needed.

Example:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Run the project

#### Run full stack

```bash
npm run dev
```

#### Or run separately

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### 5. Access the application

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 🔐 Authentication Flow

1. User registers an account.
2. Verification email is sent.
3. User verifies their email.
4. User logs in.
5. JWT token is issued after successful login.
6. Protected routes require a valid token.
7. Verified users can create items and perform swap actions.

---

## 🖼 Image Upload Flow

- Images are uploaded using Multer middleware.
- Images are sent to Cloudinary for storage.
- The backend stores image details as:

  ```json
  { "url": "...", "public_id": "..." }
  ```
- Multiple images are supported per apparel item.

---

## 📡 API Endpoint Documentation

### Authentication Endpoints

#### Register User
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Authentication:** Not required

Example Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

#### Login User
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Authentication:** Not required

#### Verify Email
- **Method:** `GET`
- **Endpoint:** `/api/auth/verify-email/:token`
- **Authentication:** Not required

#### Get Current User
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Authentication:** Required

### Apparel Endpoints

#### Create Apparel Item
- **Method:** `POST`
- **Endpoint:** `/api/items`
- **Authentication:** Required

#### Get All Apparel Items
- **Method:** `GET`
- **Endpoint:** `/api/items`
- **Authentication:** Not required

#### Get Single Apparel Item
- **Method:** `GET`
- **Endpoint:** `/api/items/:id`
- **Authentication:** Not required

#### Update Apparel Item
- **Method:** `PUT`
- **Endpoint:** `/api/items/:id`
- **Authentication:** Required

#### Delete Apparel Item
- **Method:** `DELETE`
- **Endpoint:** `/api/items/:id`
- **Authentication:** Required

#### Get My Apparel Items
- **Method:** `GET`
- **Endpoint:** `/api/items/me/mine`
- **Authentication:** Required

### Swap Endpoints

#### Create Swap Request
- **Method:** `POST`
- **Endpoint:** `/api/swaps`
- **Authentication:** Required and verified user

#### Get Incoming Swaps
- **Method:** `GET`
- **Endpoint:** `/api/swaps/incoming`
- **Authentication:** Required

#### Get Outgoing Swaps
- **Method:** `GET`
- **Endpoint:** `/api/swaps/outgoing`
- **Authentication:** Required

#### Get Swap Logistics
- **Method:** `GET`
- **Endpoint:** `/api/swaps/:id/logistics`
- **Authentication:** Required

#### Update Swap Logistics
- **Method:** `PUT`
- **Endpoint:** `/api/swaps/:id/logistics`
- **Authentication:** Required and verified user

#### Accept Swap
- **Method:** `PUT`
- **Endpoint:** `/api/swaps/:id/accept`
- **Authentication:** Required and verified user

#### Reject Swap
- **Method:** `PUT`
- **Endpoint:** `/api/swaps/:id/reject`
- **Authentication:** Required and verified user

#### Complete Swap
- **Method:** `PUT`
- **Endpoint:** `/api/swaps/:id/complete`
- **Authentication:** Required and verified user

### Notification Endpoints

#### Get My Notifications
- **Method:** `GET`
- **Endpoint:** `/api/notifications`
- **Authentication:** Required

#### Get Unread Notification Count
- **Method:** `GET`
- **Endpoint:** `/api/notifications/unread-count`
- **Authentication:** Required

#### Mark One Notification as Read
- **Method:** `PUT`
- **Endpoint:** `/api/notifications/:id/read`
- **Authentication:** Required

#### Mark All Notifications as Read
- **Method:** `PUT`
- **Endpoint:** `/api/notifications/read-all`
- **Authentication:** Required

### Review Endpoints

#### Create or Update Review
- **Method:** `POST`
- **Endpoint:** `/api/users/:userId/reviews`
- **Authentication:** Required

#### Get Reviews for a User
- **Method:** `GET`
- **Endpoint:** `/api/users/:userId/reviews`
- **Authentication:** Not required

### Chat Endpoints

#### Create or Get Conversation
- **Method:** `POST`
- **Endpoint:** `/api/chats/conversations`
- **Authentication:** Required

#### Get Conversations
- **Method:** `GET`
- **Endpoint:** `/api/chats/conversations`
- **Authentication:** Required

#### Get Messages
- **Method:** `GET`
- **Endpoint:** `/api/chats/conversations/:id/messages`
- **Authentication:** Required

#### Send Message
- **Method:** `POST`
- **Endpoint:** `/api/chats/conversations/:id/messages`
- **Authentication:** Required

#### Mark Conversation as Read
- **Method:** `POST`
- **Endpoint:** `/api/chats/conversations/:id/read`
- **Authentication:** Required

### Wishlist Endpoints

#### Add to Wishlist
- **Method:** `POST`
- **Endpoint:** `/api/wishlist`
- **Authentication:** Required

#### Get Wishlist
- **Method:** `GET`
- **Endpoint:** `/api/wishlist`
- **Authentication:** Required

#### Remove from Wishlist
- **Method:** `DELETE`
- **Endpoint:** `/api/wishlist/:id`
- **Authentication:** Required

### Admin Endpoints

#### Get Dashboard Statistics
- **Method:** `GET`
- **Endpoint:** `/api/admin/dashboard`
- **Authentication:** Admin only

#### Manage Users
- **Methods:** `GET`, `POST`, `PATCH`
- **Endpoints:** `/api/admin/users`, `/api/admin/users/:email`, `/api/admin/users/active/:email`
- **Authentication:** Admin only

#### Manage Items
- **Methods:** `GET`, `PATCH`, `DELETE`
- **Endpoints:** `/api/admin/items`, `/api/admin/items/:id/block`, `/api/admin/items/:id`
- **Authentication:** Admin only

#### Manage Swaps
- **Method:** `GET`
- **Endpoint:** `/api/admin/swaps`
- **Authentication:** Admin only

#### Manage Reviews
- **Methods:** `GET`, `DELETE`
- **Endpoints:** `/api/admin/reviews`, `/api/admin/reviews/:id`
- **Authentication:** Admin only

---

## 🧪 Additional Documentation

Detailed testing and deployment artifacts are included separately in the repository:

- `Testing_Report.md`
- `Deployment_Report.md`

---

## 📌 Project Status

- Authentication and email verification completed
- Apparel CRUD completed
- Swap functionality completed
- Notification functionality completed
- Review, chat, wishlist, and admin functionality completed
- Frontend-backend integration completed

---

## 📄 License

This project is developed for academic purposes.
