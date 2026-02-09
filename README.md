ReWear ♻️

A full-stack web application for swapping unused clothing items to promote sustainable fashion.

Tech Stack

Frontend: React, TypeScript, Vite, Tailwind CSS

Backend: Node.js, Express, MongoDB

Auth: JWT, Email Verification

Uploads: Cloudinary

Emails: Nodemailer

Project Structure
rewear/
├── backend/
├── frontend/
└── README.md

Prerequisites

Node.js (v18+)

MongoDB (local or Atlas)

Cloudinary account

Gmail App Password

Environment Variables

Create backend/.env
Copy all from the .env.example file and paste it into the .env file

Run Locally
Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev


Frontend: http://localhost:5173

Backend: http://localhost:5000

Notes

Email verification is required before login

Only verified users can create items and swaps

Images are uploaded to Cloudinary

License

Educational project
