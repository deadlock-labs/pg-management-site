# PG Management System

A comprehensive web application for managing Paying Guest (PG) house operations — track bills, manage rooms, split expenses, and handle payments.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Prisma (SQLite)**, and **NextAuth.js**.

## Features

- **Authentication**: Google OAuth and email/password login via NextAuth.js
- **Room Management**: Create rooms, set capacity/floor/rent, assign occupants
- **Bill Management (CMS)**: Admin dashboard to create and manage bills
  - Bill types: Electricity ⚡, Water 💧, Maintenance 🔧, Rent 🏠, Internet 🌐, and custom types
  - **Automatic bill splitting** among room occupants
  - Split preview before creating a bill
- **Payment Gateway**: Razorpay integration for online payments
- **Email Notifications**: Automated email alerts when new bills are added
- **User Dashboard**: View assigned bills, payment status, and make payments
- **Role-based Access**: Admin and User roles with appropriate permissions

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/deadlock-labs/pg-management-site.git
cd pg-management-site

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login Credentials

After seeding:
- **Admin**: admin@pg.com / admin123
- **Users**: rahul@example.com, priya@example.com, amit@example.com (password: user123)

## Environment Variables

See `.env.example` for all required environment variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite database path |
| `NEXTAUTH_URL` | App URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Random secret for session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | Sender email address |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite via Prisma ORM
- **Authentication**: NextAuth.js (Google OAuth + Credentials)
- **Payments**: Razorpay
- **Email**: Nodemailer

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin pages (rooms, bills, bill-types, users)
│   ├── api/            # API routes
│   ├── auth/           # Login and register pages
│   ├── dashboard/      # User/admin dashboard
│   └── page.tsx        # Landing page
├── components/         # Shared components (Navbar, PaymentButton, etc.)
├── lib/                # Utilities (prisma, auth, email)
└── types/              # TypeScript type definitions
prisma/
├── schema.prisma       # Database schema
├── migrations/         # Database migrations
└── seed.ts             # Seed script
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
