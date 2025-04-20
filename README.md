# ThriftiNUSV2

A mobile‑first marketplace app for NUS students, built on the T3 Stack and bootstrapped with `create-t3-app`. Browse, list, and chat about pre‑loved items—all with secure authentication, image uploads, and a robust reporting system.

---

## Tech Stack

- **Next.js** (App Router + React Server Components)
- **TypeScript**
- **tRPC** (end‑to‑end typesafe API)
- **Prisma** (PostgreSQL ORM and migrations)
- **NextAuth.js** (OAuth‑based authentication)
- **Tailwind CSS**
- **Uploadthing** (file‑upload handling)

---

## Features

- **User Authentication** via email and OAuth providers
- **Marketplace Listings**
  - Create, edit, search, and filter items
  - Offer and counter‑offer flows
  - Real‑time messaging between buyer and seller
- **Image Upload**
  - **SingleImageUploader** for profile pictures (1 file, ≤ 4 MB, JPEG/PNG)
  - **MultiImageUploader** for listings (up to 5 files, ≤ 4 MB each, JPEG/PNG)
  - Thumbnail‑vs‑full‑size strategy for fast page loads and high‑res previews
- **Reporting System**
  - **ListingReport**: track user reports on listings (reporterId, reporteeId, listingId)
  - **ProfileReport**: track user‑to‑user reports (reporterId, reporteeId)
  - Spam‑prevention logic: only one open report per tuple, admin can close and re‑open
- **Admin Dashboard** for reviewing and closing reports
- **Responsive Design** optimized for mobile and desktop

---

## Project Structure

.
├── README.md
├── package.json
├── .env.example
├── prisma
│ └── schema.prisma
├── public
├── src
| ├── \_components
│ ├── server
│ │ └── db.ts
│ ├── app
│ │ ├── api
│ │ │ ├── auth
│ │ │ │ └── [...nextauth]/route.ts
│ │ │ └── trpc
│ │ │ └── [trpc]/route.ts
│ │ ├── layout.tsx
│ │ └── page.tsx
│ ├── components
│ │ ├── SingleImageUploader.tsx
│ │ └── MultiImageUploader.tsx
│ └── server
│ └── api
│ └── routers
│ └── root.ts
│ └── trpc.ts
| └── auth
├── config
├── hooks
├── lib
└── styles
└── trpc
└── utils

## Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/shawntan0301/thriftiNUSV2.git
   cd thriftiNUSV2

   ```

2. **Install Dependencies**  
   npm install

3. **Example env**
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   NEXTAUTH_SECRET=your_nextauth_secret
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_FILE_ROUTE_SINGLE=singleImageRoute
   UPLOADTHING_FILE_ROUTE_MULTI=multiImageRoute

4. **Run database migrations**
   npx prisma migrate dev

5. **Start Server**
   npm run dev
