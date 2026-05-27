'use client'

import { useState } from 'react'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { forgotPassword } from '@/lib/api/auth'

type Tab = 'profile' | 'password'

export default function SettingsPage() {
  const user = useCurrentUser()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // Change Password tab state
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  // Derive first / last name from the full name in the JWT
  const firstName = user?.name?.split(' ')[0] ?? ''
  const lastName = user?.name?.split(' ').slice(1).join(' ') ?? ''

  async function handleSendResetLink() {
    if (!user?.email) return
    setPwLoading(true)
    setPwSuccess(false)
    setPwError('')
    try {
      await forgotPassword({ email: user.email })
      setPwSuccess(true)
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Page header */}
      <div>
        <h2 className="text-slate-800 font-semibold text-xl">Settings</h2>
        <p className="text-slate-400 text-sm mt-0.5">Manage your profile and account security.</p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'password'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Change Password
        </button>
      </div>

      {/* ── Profile Info Tab ─────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">

          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                disabled
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                disabled
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email — full width */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 cursor-not-allowed"
            />
          </div>

          {/* Role + Phone row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Role
              </label>
              <input
                type="text"
                value={user?.role ?? ''}
                disabled
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 cursor-not-allowed capitalize"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Phone
              </label>
              <input
                type="tel"
                value=""
                placeholder="Not set"
                disabled
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Company — full width */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Company
            </label>
            <input
              type="text"
              value=""
              placeholder="Not set"
              disabled
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
            />
          </div>

          {/* Footer note + disabled save button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              
            </p>
            <button
              disabled
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg opacity-40 cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>

        </div>
      )}

      {/* ── Change Password Tab ──────────────────────────────── */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">

          <div>
            <h3 className="text-slate-800 font-medium text-sm mb-1">Reset your password</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              For your security, we send a password reset link to your registered email address.
              Click the button below and check your inbox to set a new password.
            </p>
          </div>

          {/* Email preview — read-only, shows where the link goes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Reset link will be sent to
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 cursor-default"
            />
          </div>

          {/* Feedback messages */}
          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              Check your inbox — we&apos;ve sent a reset link to <strong>{user?.email}</strong>.
            </div>
          )}

          <button
            onClick={handleSendResetLink}
            disabled={pwLoading || pwSuccess || !user?.email}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors w-fit"
          >
            {pwLoading ? 'Sending…' : pwSuccess ? 'Link Sent' : 'Send Password Reset Link'}
          </button>

        </div>
      )}

    </div>
  )
}
