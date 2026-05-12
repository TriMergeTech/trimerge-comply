# TriMerge Comply — Frontend

HR Compliance Audit Platform for Government Clients, built for TriMerge Consulting Group, P.A.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **Icons:** Lucide React
- **Charts:** Recharts
- **Font:** Inter

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
├── app/                              # App Router pages
│   ├── (auth)/                       # Auth route group — no sidebar
│   │   ├── layout.tsx                # Auth layout
│   │   ├── login/                    # Login page
│   │   ├── signup/                   # Signup page
│   │   ├── forgot-password/          # Forgot password page
│   │   ├── verify-otp/               # OTP verification page
│   │   ├── reset-password/           # Reset password page
│   │   └── security/                 # Security page
│   ├── compliance/                   # Compliance dashboard page
│   ├── dashboard/                    # Main dashboard page
│   ├── audits/                       # Audits management page
│   ├── flags/                        # Adverse impact flag results
│   │   ├── queue/                    # Flag queue page
│   │   └── [id]/                     # Flag detail and decision page
│   ├── upload/                       # Data upload page
│   ├── position-analysis/            # Position analysis page
│   ├── pay-equity/                   # Pay equity analysis page
│   ├── reports/                      # Reports and export page
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout with sidebar
│   └── page.tsx                      # Redirects to /dashboard
├── components/
│   ├── sharedComponents/             # Reusable components across pages
│   │   ├── Sidebar.tsx               # Navigation sidebar (mobile responsive)
│   │   └── UserInfo.tsx              # Bell notification and user avatar
│   ├── dashboard/                    # Dashboard specific components
│   │   ├── StatsCard.tsx             # Metric cards (Total Audits, Flags etc)
│   │   └── RecentAudits.tsx          # Recent audits table with status badges
│   ├── audits/                       # Audits specific components
│   │   └── AuditsTable.tsx           # Audits table with search and filters
│   ├── flags/                        # Flags specific components
│   │   ├── FlagStatsSummary.tsx      # Flag stats summary cards
│   │   ├── FlagResultsTable.tsx      # Adverse impact results table
│   │   ├── FlagQueueTable.tsx        # Flag queue table
│   │   ├── FlagDetail.tsx            # Flag detail with tabs
│   │   └── DecisionPanel.tsx         # Analyst decision panel
│   ├── upload/                       # Upload specific components
│   │   ├── UploadZone.tsx            # Drag and drop upload zone
│   │   └── RecentUploads.tsx         # Recent uploads table
│   ├── position-analysis/            # Position analysis specific components
│   │   ├── DocumentsTable.tsx        # Documents table with filters
│   │   └── DocumentTabs.tsx          # Document filter tabs
│   ├── pay-equity/                   # Pay equity specific components
│   │   ├── PayEquityStats.tsx        # Pay equity summary stats
│   │   ├── PayGapsChart.tsx          # Pay gaps horizontal bar chart
│   │   └── DemographicGapsTable.tsx  # Demographic gaps table
│   ├── compliance/                   # Compliance dashboard specific components
│   │   ├── ComplianceStats.tsx       # Compliance summary stats
│   │   ├── FlagsByEngine.tsx         # Flags by engine donut chart
│   │   ├── FlagsBySeverity.tsx       # Flags by severity donut chart
│   │   └── RecentFlagActivity.tsx    # Recent flag activity table
│   ├── reports/                      # Reports specific components
│   │   ├── ExportPanel.tsx           # Export confirmed findings panel
│   │   └── ActivityLogTable.tsx      # Activity log table
│   └── ui/                           # shadcn/ui base components
│       ├── avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Table.tsx
├── lib/
│   └── utils.ts                      # Utility functions
└── public/                           # Static assets

---

## Pages

| Route | Page | Status |
|---|---|---|
| `/dashboard` | Main Dashboard | ✅ Complete |
| `/compliance` | Compliance Dashboard | ✅ Complete |
| `/audits` | Audit Management | ✅ Complete |
| `/flags` | Adverse Impact Flag Results | ✅ Complete |
| `/flags/queue` | Flag Queue | ✅ Complete |
| `/flags/[id]` | Flag Detail & Decision | ✅ Complete |
| `/upload` | Data Upload & Validation | ✅ Complete |
| `/position-analysis` | Position Description Analysis | ✅ Complete |
| `/pay-equity` | Pay Equity Analysis | ✅ Complete |
| `/reports` | Reports & Export | ✅ Complete |
| `/login` | Login | ✅ Complete |
| `/signup` | Sign Up | ✅ Complete |
| `/forgot-password` | Forgot Password | ✅ Complete |
| `/verify-otp` | OTP Verification | ✅ Complete |
| `/reset-password` | Reset Password | ✅ Complete |

---

## Features Built

- ✅ App Router setup with all routes
- ✅ Persistent sidebar with active link highlighting
- ✅ Mobile responsive layout with hamburger menu
- ✅ Dashboard with stats cards and recent audits table
- ✅ Compliance dashboard with donut charts and activity log
- ✅ Audits page with search and filters
- ✅ Upload page with drag and drop and step indicator
- ✅ Flags — Adverse Impact Results, Flag Queue, Flag Detail & Decision
- ✅ Position Analysis with document tabs and filtering
- ✅ Pay Equity with bar chart and demographic gaps table
- ✅ Reports & Export with audit selector and activity log
- ✅ Authentication flow — Login, Signup, OTP, Forgot Password, Reset Password
- ✅ Role-based user info display
- ✅ Status and severity badges with color coding

---

## Frontend Team

| Name | Branch | Scope |
|---|---|---|
| Jackenson Charles | `Dashboard-Frontend-Jackenson` | Dashboard, Compliance, Audits, Flags, Upload, Position Analysis, Pay Equity, Reports |
| [Partner Name] | `Dashboard-Frontend-Jackenson` | Authentication Flow (Login, Signup, OTP, Forgot Password, Reset Password) |

---

## Backend

See the `/src` directory at the root of the repo for backend code.



---

## Notes

- Static/mock data is used throughout the UI — will be replaced with real API data once backend endpoints are ready
- Auth integration pending — user info is currently hardcoded
- Activity Log page is pending scope confirmation from lead
- Compliance Dashboard and Reports & Export pages are currently accessible via sidebar — final placement pending lead confirmation




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
