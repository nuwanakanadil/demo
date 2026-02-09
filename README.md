# ♻️ ReWear – Apparel Swap Platform

A full-stack apparel swapping platform built with **React**, **Node.js**, and **MongoDB** to promote sustainable fashion by enabling users to list, browse, and swap unused clothing items.

The application allows authenticated and verified users to manage apparel listings, upload images, and perform secure swap operations through a clean and user-friendly interface.

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
- **Email verification required before login**
- Backend-level route protection
- Verified-user-only actions

### Apparel Management
- Create apparel items with category, size, and condition
- Upload **multiple images per item**
- Edit and delete owned apparel items
- Browse all available apparel
- View personal apparel listings

### Swap Operations
- Send swap requests for available items
- View incoming and outgoing swap requests
- Accept, reject, or complete swaps
- Ownership-based authorization and validation

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

---

## 📋 Requirements

To run this application locally, ensure you have the following installed:

### System Requirements
- Node.js **18 or higher**
- NPM (comes with Node.js)
- MongoDB (**local instance or MongoDB Atlas**)

### External Services
- Cloudinary account (for image uploads)
- Gmail account with **App Password** enabled (for email verification)

---

## ⚙️ Setup Instructions

```bash
git clone <repository-url>
cd rewear

Backend Setup

cd backend
npm install
cp .env.example .env
# Configure environment variables in .env
npm run dev
Backend runs at:
http://localhost:5000

Frontend Setup

Open a new terminal window:
cd frontend
npm install
npm run dev
Frontend runs at:
http://localhost:5173

🔒 Authentication Flow

User registers an account
Verification email is sent
User verifies their email
Login is enabled
Only verified users can:
Create apparel items
Upload images
Send swap requests
All restrictions are enforced at the backend level.

🖼 Image Uploads

Images are uploaded using Multer
Stored in Cloudinary
Saved as { url, public_id }
Multiple images supported per apparel item

🚧 Development Status

✅ Authentication & Email Verification
✅ Apparel CRUD with image uploads
✅ Swap request system
✅ Secure backend route protection

📄 License
This project is developed for educational and learning purposes.


---