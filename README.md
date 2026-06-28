# 🛍️ BagHub - Modern E-Commerce Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-indigo?style=for-the-badge&logo=stripe)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)

## 📌 Overview
BagHub is a full-stack, enterprise-grade e-commerce platform built with Next.js. It features a fully responsive design, secure user authentication, role-based access control (Admin/User), and seamless payment integrations. The platform is designed with a strong focus on security, performance, and user experience.

<img width="1895" height="858" alt="Screenshot 2026-06-22 102534" src="https://github.com/user-attachments/assets/a9567dc8-611e-4398-b91b-9f6288abc2b0" />
<img width="1890" height="845" alt="Screenshot 2026-06-22 103338" src="https://github.com/user-attachments/assets/9e8c62bb-eb35-4b7a-97ff-6a5388bf0cf0" />
<img width="1901" height="857" alt="Screenshot 2026-06-22 103437" src="https://github.com/user-attachments/assets/4c500efc-fd0a-400f-8ba8-7d946c6f9c4b" />
<img width="1896" height="871" alt="Screenshot 2026-06-22 103501" src="https://github.com/user-attachments/assets/2f574c89-05f7-4779-885a-b889c4dc45cc" />
<img width="1887" height="862" alt="Screenshot 2026-06-22 103550" src="https://github.com/user-attachments/assets/52de1aee-c2f4-47b3-bb26-fb81f6cb8f24" />
<img width="1221" height="650" alt="Screenshot 2026-06-22 103612" src="https://github.com/user-attachments/assets/d13a858c-105e-4f0e-85cc-991ce6cd669d" />
<img width="1877" height="835" alt="Screenshot 2026-06-22 103657" src="https://github.com/user-attachments/assets/f6574cf9-a416-4507-9596-489b1d1d744f" />
<img width="1881" height="827" alt="Screenshot 2026-06-22 103808" src="https://github.com/user-attachments/assets/4dafca11-3bbc-46f8-8896-89a1bf95b512" />
<img width="1876" height="850" alt="Screenshot 2026-06-22 103914" src="https://github.com/user-attachments/assets/f466249a-5692-47ed-8039-75f58682b5e1" />
<img width="1882" height="850" alt="Screenshot 2026-06-22 103948" src="https://github.com/user-attachments/assets/d1b7ca45-bfb4-4cb9-8bdf-75a255ca089c" />


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

