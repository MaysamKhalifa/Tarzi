# Tarzi – Your Tailor, Your Style

A production-ready web app for connecting users with skilled Dubai tailors for alterations, bespoke clothing, and upcycling. Built mobile-first, fully prepared for conversion to React Native / Expo.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS v4 + custom CSS |
| Icons | Lucide React |
| Backend | Supabase (Auth, Database, Storage, Realtime) |
| Deployment | Vercel |

## Features

- **Authentication** – Sign up, login, session management via Supabase Auth
- **Home** – Male/Female selection, service cards, nearby tailors
- **Services** – Alterations, From Scratch, Upcycling with gender-specific garment dropdowns
- **Measurements** – Self-measured profiles + tailor home visit booking
- **Nearby Tailors** – 6 real Dubai tailors, searchable/filterable
- **Tailor Profiles** – Ratings, reviews, availability, book/call
- **Bag/Cart** – Multi-item cart, pickup date/time/address, AED checkout
- **Orders** – In-Progress / Done tabs with status tracking
- **Delivery Tracking** – Visual step-by-step order progress
- **Real-time Chat** – Supabase Realtime WebSocket chat per order
- **Profile** – Name editing, address management, logout

## Setup

### 1. Install
```bash
git clone https://github.com/YOUR_USERNAME/tarzi-app.git
cd tarzi-app
npm install
```

### 2. Environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase setup
1. Run `supabase/schema.sql` in your Supabase SQL Editor
2. Create storage buckets: `garment-images`, `avatars`, `tailor-work` (set to Public)
3. Enable Realtime for the `chat_messages` table

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |

## Supabase Schema

### Tables
- **profiles** – User profile (auto-created on signup via DB trigger)
- **measurements** – Named measurement sets per user (chest, waist, etc.)
- **tailors** – Tailor directory with location, expertise, availability
- **tailor_reviews** – Reviews linked to tailors
- **orders** – Bookings with status, pickup details, price
- **chat_messages** – Realtime messages per order
- **user_addresses** – Saved pickup/delivery addresses
- **saved_tailors** – User bookmarks for tailors

### Storage Buckets
- `garment-images` – User garment photos
- `avatars` – Profile pictures
- `tailor-work` – Tailor portfolio

## Pages

| Route | Page |
|---|---|
| `/login` | Login |
| `/signup` | Create Account |
| `/home` | Home |
| `/measurements` | Measurements Landing |
| `/measurements/self` | Measure by Myself |
| `/measurements/tailor` | Measurement by Tailor |
| `/tailors` | Nearby Tailors |
| `/tailors/[id]` | Tailor Profile |
| `/booking/[service]` | Booking (alterations / from_scratch / upcycling) |
| `/bag` | Bag + Checkout |
| `/orders` | My Orders |
| `/delivery` | Delivery Tracking |
| `/chat/[orderId]` | Real-time Chat |
| `/profile` | User Profile |
| `/location` | Manage Addresses |

## Deployment (Vercel)
```bash
vercel deploy
```
Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel environment variables.

## Mobile App Conversion
The Supabase backend works identically in React Native / Expo. Replace Next.js with React Navigation and HTML with React Native components — no backend changes needed.

## Improvements vs PDF
1. Kids section removed — Male/Female only
2. Real Supabase authentication (signup, login, sessions)
3. Functional search filtering tailors/services
4. Real image upload to Supabase Storage
5. All prices in AED with correct currency formatting
6. 6 realistic Dubai tailor profiles with full data
7. Real-time chat via Supabase Realtime (WebSockets)
8. Persistent cart with localStorage + Supabase order creation
9. Visual delivery tracking with step progress
10. Multiple named measurement profiles per user
11. Auto-fill redirects to measurements page if none exist
12. Gender-specific garment dropdowns (male: kandoora, suit…; female: abaya, dress…)
13. Cart badge count on bottom navigation bag icon
14. Inline profile name editing + address management

## Suggested Enhancements
1. Tailor admin portal for managing orders
2. Push notifications for order status changes
3. Payment gateway (Stripe / PayTabs)
4. GPS auto-detect for distance sorting
5. Tailor portfolio gallery
6. Post-order review/rating system
7. Discount codes and promotions
8. WhatsApp deep-link integration
9. Tailor real-time availability calendar
10. Multilingual support (Arabic/English)
