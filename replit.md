# Workspace

## Overview

PashuDoc — একটি ভেটেরিনারি ডাক্তার খোঁজার ওয়েব অ্যাপ্লিকেশন। বাংলাদেশের কৃষক ও পশুপালকরা তাদের পশু-পাখির জন্য কাছের ভেটেরিনারি ডাক্তার খুঁজে পাবেন এবং অ্যাপয়েন্টমেন্ট বুক করতে পারবেন।

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Auth**: JWT (bcryptjs + jsonwebtoken)

## Artifacts

- **pashudoc** (`/`) — Main web app (React + Vite)
- **api-server** (`/api`) — Express backend API

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- **users** — farmers, doctors, and admin users (role enum: farmer/doctor/admin)
- **doctors** — doctor profiles with specialties, district, status (pending/approved/rejected)
- **appointments** — bookings between farmers and doctors
- **reviews** — star ratings and comments for doctors

## Seed Data

- Admin: phone=01700000000, password=admin123 (role: admin)
- Dr. Mohammad Ali: phone=01711111111, password=doctor123 (Dhaka, cow/goat)
- Dr. Sumaiya Begum: phone=01722222222, password=doctor123 (Chittagong, dog/cat/poultry)
- Dr. Karim Uddin: phone=01733333333, password=doctor123 (Rajshahi, cow/buffalo)
- Dr. Nasrin Sultana: phone=01744444444, password=doctor123 (Khulna, goat/sheep/duck)
- Rahim Farmer: phone=01755555555, password=farmer123 (farmer)

## Business Logic

- Doctors self-register and wait for admin approval
- Farmers browse approved doctors by district/specialty
- Farmers book appointments and write reviews after completion
- Admin approves/rejects doctors and can mark them as featured
- Featured doctors appear on the home page

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
