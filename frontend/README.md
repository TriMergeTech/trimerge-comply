# TriMerge Comply — Frontend

HR Compliance Audit Platform for Government Clients, built for TriMerge Consulting Group, P.A.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **Icons:** Lucide React
- **Font:** Geist

---

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## Project Structure

frontend/
├── app/                        # App Router pages
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Redirects to /dashboard
│   ├── dashboard/              # Dashboard page
│   ├── audits/                 # Audits management page
│   ├── flags/                  # Compliance flags page
│   ├── upload/                 # Data upload page
│   ├── position-analysis/      # Position analysis page
│   └── pay-equity/             # Pay equity analysis page
├── components/
│   ├── sharedComponents/       # Reusable components across pages
│   │   ├── Sidebar.tsx         # Navigation sidebar (mobile responsive)
│   │   └── UserInfo.tsx        # Bell notification and user avatar
│   ├── dashboard/              # Dashboard specific components
│   │   ├── StatsCard.tsx       # Metric cards (Total Audits, Flags etc)
│   │   └── RecentAudits.tsx    # Recent audits table with status badges
│   └── ui/                     # shadcn/ui base components
│       ├── avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Table.tsx
├── lib/
│   └── utils.ts                # Utility functions
└── public/                     # Static assets



---

## Pages

| Route | Page | Status |
|---|---|---|
| `/dashboard` | Compliance Dashboard | ✅ Complete |
| `/audits` | Audit Management | 🔄 In Progress |
| `/flags` | Flag Review Queue | 🔄 In Progress |
| `/upload` | Data Upload & Validation | 🔄 In Progress |
| `/position-analysis` | Position Description Analysis | 🔄 In Progress |
| `/pay-equity` | Pay Equity Analysis | 🔄 In Progress |

---

## Features Built

- ✅ App Router setup with all routes
- ✅ Persistent sidebar with active link highlighting
- ✅ Mobile responsive layout with hamburger menu
- ✅ Dashboard with stats cards and recent audits table
- ✅ Role-based user info display (UserInfo component)
- ✅ Status badges with color coding

---

## Frontend Team

| Name | Branch | Scope |
|---|---|---|
| Jackenson Charles | `Dashboard-Frontend-Jackenson` | Dashboard, Audits, Flags, Upload, Position Analysis, Pay Equity |




This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
