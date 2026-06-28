# 🛍️ BagHub - Modern E-Commerce Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-indigo?style=for-the-badge&logo=stripe)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)

## 📌 Overview
BagHub is a full-stack, enterprise-grade e-commerce platform built with Next.js. It features a fully responsive design, secure user authentication, role-based access control (Admin/User), and seamless payment integrations. The platform is designed with a strong focus on security, performance, and user experience.

<img width="1896" height="871" alt="Screenshot 2026-06-22 103501" src="https://github.com/user-attachments/assets/eab6cbd9-1fb6-4a5d-8d8a-26d4b0796a8e" />

![image 2](image-1.png)
![image 3](image-2.png)
![image 4](image-3.png)
![image 5](image-4.png)
![image 6](image-5.png)
![image 7](image-6.png)
![image 8](image-7.png)
![image 9](image-8.png)
![image 10](image-9.png)
## ✨ Key Features
* **Secure Authentication:** Custom built authentication system with cryptographically secure password resets (`bcrypt` hashing & crypto tokens).
* **Role-Based Access Control (RBAC):** Dedicated Admin dashboard for managing products, categories, and customer orders.
* **Database Security:** Implemented PostgreSQL Row-Level Security (RLS) via Supabase to ensure robust data protection.
* **Payment Gateway:** Seamless and secure checkout process integrated with **Stripe**.
* **Automated Email Notifications:** Order confirmations and password reset emails powered by **Nodemailer**.
* **Modern UI/UX:** Built with Tailwind CSS for a highly responsive and beautiful user interface.

## 🛠️ Tech Stack
* **Frontend:** Next.js (App Router), React.js, Tailwind CSS
* **Backend:** Node.js (Next.js API Routes)
* **Database:** PostgreSQL (Supabase)
* **ORM:** Prisma Client
* **Authentication & Security:** Bcrypt, Crypto API
* **Third-Party Services:** Stripe API, Nodemailer

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation Steps

1. **Clone the repository:**
```bash
   git clone https://github.com/mashdias/baghub.git   
   cd baghub
Install dependencies:

Bash
   npm install
Set up Environment Variables:
Create a .env file in the root directory and add your keys:

Code snippet
   DATABASE_URL="your_supabase_connection_string"
   STRIPE_SECRET_KEY="your_stripe_secret_key"
   EMAIL_USER="your_email@gmail.com"
   EMAIL_PASS="your_app_password"
   # Add other required keys
Initialize the Database:
Push the schema to your Supabase database and generate the Prisma client:

Bash
   npx prisma db push
   npx prisma generate
Run the Development Server:

Bash
   npm run dev
Open http://localhost:3000 with your browser to see the result.

🔒 Security Highlights
Supabase RLS: Row-Level Security policies are actively enforced to prevent unauthorized data access via public APIs.

Password Hashing: User passwords are encrypted using bcrypt before storing them in the database.

Token Expiration: Password reset links use randomly generated cryptographic tokens that expire after 1 hour to prevent replay attacks.

👨‍💻 Developed By
Mash Dias

Full-Stack Developer

LinkedIn: https://www.linkedin.com/in/silila-hansika-68454940a/

