import UserInfo from '@/components/sharedComponents/UserInfo'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentAudits from '@/components/dashboard/RecentAudits'

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">

      {/* Dashboard header */}
      <div className="flex items-center justify-between">

        {/* Welcome message */}
        <div>
          <h2 className="text-slate-800 font-semibold text-xl">
            Welcome, Sarah Analyst
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Good morning! Here&apos;s what&apos;s happening with your audits.
          </p>
        </div>

        {/* Right side — user info and new audit button */}
        <div className="flex items-center gap-4">
          <UserInfo />
        </div>

      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="Total Audits" value={3} linkText="View all audits" linkHref="/audits" />
        <StatsCard label="Pending Flags" value={0} linkText="No pending reviews" linkHref="/flags" />
        <StatsCard label="Confirmed Findings" value={0} linkText="No findings yet" linkHref="/flags" />
        <StatsCard label="Open Tasks" value={0} linkText="Nothing assigned" linkHref="/audits" />
      </div>

       {/* Recent audits table */}
      <RecentAudits />

    </div>
  )
}