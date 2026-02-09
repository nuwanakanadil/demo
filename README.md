# ♻️ ReWear – Apparel Swap Platform

A full-stack apparel swapping platform built with **React**, **Node.js**, and **MongoDB** to promote **sustainable fashion** by enabling users to list, browse, and swap unused clothing items.

The application provides secure authentication, image uploads, and a structured swap system with a clean and user-friendly interface.

---

## 🚀 Tech Stack

### Backend
- Node.js
- Express
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
- Backend-enforced access control
- Verified-user-only actions

### Apparel Management
- Create apparel items with details (category, size, condition)
- Upload **multiple images per item**
- Edit and delete owned items
- Browse all available items
- View personal item listings

### Swap System
- Send swap requests for available items
- View incoming and outgoing swap requests
- Accept, reject, or complete swaps
- Ownership-based authorization

### Image Handling
- Image uploads handled via Multer
- Images stored securely in Cloudinary
- Stored as `{ url, public_id }`
- Supports future image deletion and updates

---

## 🧠 Design Decisions

- JWT authentication combined with backend route protection for security
- Email verification is mandatory to prevent misuse of the platform
- Cloudinary is used to reduce server storage overhead
- Business logic separated into controllers, services, and middlewares
- Email sending handled asynchronously (non-blocking)

---

## 📋 Requirements

### System Requirements
- Node.js **18 or higher**
- NPM (comes with Node.js)
- MongoDB (local or MongoDB Atlas)

### External Services
- Cloudinary account (image uploads)
- Gmail account with **App Password** enabled (email verification)

---

## ⚙️ Setup Instructions

```bash
git clone <repository-url>
cd rewear
