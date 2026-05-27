'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { getAccessToken } from '@/lib/authTokens'
import { clearTokens } from '@/lib/authTokens'
import { changeName, changePassword, verifyChangePassword } from '@/lib/api/auth'

type Tab = 'profile' | 'password'
type PwStep = 'form' | 'otp'

export default function SettingsPage() {
  const user = useCurrentUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  // ── Profile tab state ──────────────────────────────────────
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Populate editable fields once user data loads from API
  useEffect(() => {
    if (!user) return
    setFirstName(user.name?.split(' ')[0] ?? '')
    setLastName(user.name?.split(' ').slice(1).join(' ') ?? '')
    setCompanyName(user.companyName ?? '')
  }, [user])

  async function handleSaveProfile() {
    const token = getAccessToken()
    if (!token) return
    setSaveLoading(true)
    setSaveSuccess(false)
    setSaveError('')
    try {
      const fullName = [firstName, lastName].filter(Boolean).join(' ')
      await changeName({ name: fullName, companyName }, token)
      setSaveSuccess(true)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaveLoading(false)
    }
  }

  // ── Change Password tab state ──────────────────────────────
  const [pwStep, setPwStep] = useState<PwStep>('form')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [otp, setOtp] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')

  async function handleChangePassword() {
    const token = getAccessToken()
    if (!token) return
    setPwLoading(true)
    setPwError('')
    try {
      await changePassword({ oldPassword, newPassword }, token)
      setPwStep('otp')
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Request failed. Please try again.')
    } finally {
      setPwLoading(false)
    }
  }

  async function handleVerifyOtp() {
    const token = getAccessToken()
    if (!token) return
    setPwLoading(true)
    setPwError('')
    try {
      await verifyChangePassword({ otp }, token)
      // Password changed — log the user out and send them to login
      clearTokens()
      router.replace('/login')
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.')
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

          {/* Name row — editable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setSaveSuccess(false) }}
                placeholder="First name"
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setSaveSuccess(false) }}
                placeholder="Last name"
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Company — editable */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Company
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => { setCompanyName(e.target.value); setSaveSuccess(false) }}
              placeholder="Your company name"
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Email — read-only */}
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

          {/* Role + Phone row — read-only */}
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
                value={user?.phone ?? ''}
                disabled
                placeholder="Not set"
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Feedback */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              Profile updated successfully.
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Email and role can only be changed by an admin.
            </p>
            <button
              onClick={handleSaveProfile}
              disabled={saveLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saveLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

        </div>
      )}

      {/* ── Change Password Tab ──────────────────────────────── */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">

          {/* Step 1 — form */}
          {pwStep === 'form' && (
            <>
              <div>
                <h3 className="text-slate-800 font-medium text-sm mb-1">Change your password</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter your current password and a new one. We&apos;ll send a confirmation code to your email before making the change.
                </p>
              </div>

              {/* Old password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => { setOldPassword(e.target.value); setPwError('') }}
                    placeholder="Enter current password"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPwError('') }}
                    placeholder="Enter new password"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {pwError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  {pwError}
                </div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={pwLoading || !oldPassword || !newPassword}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors w-fit"
              >
                {pwLoading ? 'Sending code…' : 'Change Password'}
              </button>
            </>
          )}

          {/* Step 2 — OTP */}
          {pwStep === 'otp' && (
            <>
              <div>
                <h3 className="text-slate-800 font-medium text-sm mb-1">Check your email</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We&apos;ve sent a 6-digit confirmation code to <strong className="text-slate-600">{user?.email}</strong>. Enter it below to complete your password change.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setPwError('') }}
                  placeholder="000000"
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent tracking-widest w-40"
                />
              </div>

              {pwError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  {pwError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleVerifyOtp}
                  disabled={pwLoading || otp.length < 6}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  {pwLoading ? 'Verifying…' : 'Verify & Change Password'}
                </button>
                <button
                  onClick={() => { setPwStep('form'); setOtp(''); setPwError('') }}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Back
                </button>
              </div>
            </>
          )}

        </div>
      )}

    </div>
  )
}
