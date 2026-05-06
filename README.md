# ShopSphere Ecommerce Platform

A professional full-stack ecommerce solution built with modern web technologies.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Payments:** Stripe Integration

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (Local or Atlas)

### Installation
1. Clone the repository
2. Install dependencies for both frontend and backend:
   ```bash
   # Root directory
   npm install --prefix frontend
   npm install --prefix backend
   ```
3. Configure environment variables (`.env` files in both folders).

### Running the Application
To run both the frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:5000](http://localhost:5000)

## Features
- Dynamic product catalog with category and brand filtering.
- Secure customer and seller authentication.
- Real-time product moderation system for administrators.
- Full checkout flow integrated with Stripe.
- Professional seller dashboard for product and sales management.

## Admin Access
- **Email:** `admin@site.com`
- **Password:** `demo123`