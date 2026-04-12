# ♻️ ReWear – Apparel Swap Platform

A full-stack apparel swapping platform built with **React**, **Node.js**, and **MongoDB** to promote sustainable fashion by enabling users to list, browse, and swap unused clothing items.

The application allows authenticated and verified users to manage apparel listings, upload images, and perform secure swap operations through a clean and user-friendly interface.

---

## Git Repository

Repository Link: `https://github.com/nuwanakanadil/demo.git`

---

## 🚀 Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Nodemailer
* Cloudinary
* Multer

### Frontend

* React + TypeScript
* Vite
* Tailwind CSS
* Axios

---

## ✨ Features

### Authentication & Security

* User registration and login
* JWT-based authentication
* Email verification required before login
* Backend-level route protection
* Verified-user-only actions

### Apparel Management

* Create apparel items with category, size, and condition
* Upload multiple images per item
* Edit and delete owned apparel items
* Browse all available apparel
* View personal apparel listings

### Swap Operations

* Send swap requests for available items
* View incoming and outgoing swap requests
* Accept, reject, or complete swaps
* Ownership-based authorization and validation

### Image Handling

* Image uploads handled via Multer
* Images stored securely in Cloudinary
* Stored as `{ url, public_id }`
* Supports future image removal and updates

---

## 🧠 Design Decisions

* JWT authentication combined with backend middleware ensures secure access control.
* Email verification is mandatory to prevent misuse of the platform.
* Cloudinary is used for image storage to reduce server load and improve scalability.
* Business logic is separated into controllers, services, and middlewares for maintainability.
* Email sending is handled asynchronously to avoid blocking API responses.

---

## 📋 System Requirements

* Node.js 18 or higher
* NPM
* MongoDB local instance or MongoDB Atlas
* Cloudinary account
* Gmail account with App Password enabled

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

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:5000`

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

* Images are uploaded using Multer middleware.
* Images are sent to Cloudinary for storage.
* The backend stores image details as:

  ```json
  { "url": "...", "public_id": "..." }
  ```
* Multiple images are supported per apparel item.

---

## 📡 API Endpoint Documentation

### Authentication Endpoints

#### Register User

* **Method:** `POST`
* **Endpoint:** `/api/auth/register`
* **Authentication:** Not required

Example Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

Example Response:

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email."
}
```

#### Login User

* **Method:** `POST`
* **Endpoint:** `/api/auth/login`
* **Authentication:** Not required

Example Request:

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

#### Verify Email

* **Method:** `GET`
* **Endpoint:** `/api/auth/verify-email/:token`
* **Authentication:** Not required

#### Get Current User

* **Method:** `GET`
* **Endpoint:** `/api/auth/me`
* **Authentication:** Required

---

### Apparel Endpoints

#### Create Apparel Item

* **Method:** `POST`
* **Endpoint:** `/api/items`
* **Authentication:** Required

#### Get All Apparel Items

* **Method:** `GET`
* **Endpoint:** `/api/items`
* **Authentication:** Not required

#### Get Single Apparel Item

* **Method:** `GET`
* **Endpoint:** `/api/items/:id`
* **Authentication:** Not required

#### Update Apparel Item

* **Method:** `PUT`
* **Endpoint:** `/api/items/:id`
* **Authentication:** Required

#### Delete Apparel Item

* **Method:** `DELETE`
* **Endpoint:** `/api/items/:id`
* **Authentication:** Required

#### Get My Apparel Items

* **Method:** `GET`
* **Endpoint:** `/api/items/me/mine`
* **Authentication:** Required

---

### Swap Endpoints

#### Create Swap Request

* **Method:** `POST`
* **Endpoint:** `/api/swaps`
* **Authentication:** Required and verified user

#### Get Incoming Swaps

* **Method:** `GET`
* **Endpoint:** `/api/swaps/incoming`
* **Authentication:** Required

#### Get Outgoing Swaps

* **Method:** `GET`
* **Endpoint:** `/api/swaps/outgoing`
* **Authentication:** Required

#### Get Swap Logistics

* **Method:** `GET`
* **Endpoint:** `/api/swaps/:id/logistics`
* **Authentication:** Required

#### Update Swap Logistics

* **Method:** `PUT`
* **Endpoint:** `/api/swaps/:id/logistics`
* **Authentication:** Required and verified user

#### Accept Swap

* **Method:** `PUT`
* **Endpoint:** `/api/swaps/:id/accept`
* **Authentication:** Required and verified user

#### Reject Swap

* **Method:** `PUT`
* **Endpoint:** `/api/swaps/:id/reject`
* **Authentication:** Required and verified user

#### Complete Swap

* **Method:** `PUT`
* **Endpoint:** `/api/swaps/:id/complete`
* **Authentication:** Required and verified user

---

### Notification Endpoints

#### Get My Notifications

* **Method:** `GET`
* **Endpoint:** `/api/notifications`
* **Authentication:** Required

#### Get Unread Notification Count

* **Method:** `GET`
* **Endpoint:** `/api/notifications/unread-count`
* **Authentication:** Required

#### Mark One Notification as Read

* **Method:** `PUT`
* **Endpoint:** `/api/notifications/:id/read`
* **Authentication:** Required

#### Mark All Notifications as Read

* **Method:** `PUT`
* **Endpoint:** `/api/notifications/read-all`
* **Authentication:** Required

---

## 🧪 Testing

Detailed testing artifacts are included separately in the repository:

* `Testing_Report.pdf`

  * Unit Testing
  * Integration Testing
  * Performance Testing
  * Testing environment setup and execution steps

---

## 🚀 Deployment

Detailed deployment documentation is included separately in the repository:

* `Deployment_Report.pdf`

  * Backend deployment platform and steps
  * Frontend deployment platform and steps
  * Environment variables used
  * Live URLs
  * Deployment evidence/screenshots

---

## 📌 Project Status

* Authentication and email verification completed
* Apparel CRUD completed
* Swap functionality completed
* Notification functionality completed
* Frontend-backend integration completed

---

## 📄 License

This project is developed for academic purposes.
