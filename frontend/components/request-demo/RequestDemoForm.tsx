'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Lock, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const companySizes = ['1–10', '11–50', '51–200', '201–500', '500+']

const roles = [
  'HR Director',
  'Compliance Officer',
  'Legal Counsel',
  'People Analytics',
  'Executive / C-Suite',
  'Other',
]

const interests = [
  'Adverse Impact Analysis',
  'Pay Equity Analysis',
  'Position Description Review',
  'All of the Above',
]

export default function RequestDemoForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    jobTitle: '',
    phone: '',
    companySize: '',
    role: '',
    interests: [] as string[],
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggle = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!form.firstName) newErrors.firstName = 'Required'
    if (!form.lastName) newErrors.lastName = 'Required'
    if (!form.email) newErrors.email = 'Required'
    if (!form.organization) newErrors.organization = 'Required'
    if (!form.jobTitle) newErrors.jobTitle = 'Required'
    if (!form.companySize) newErrors.companySize = 'Required'
    if (!form.role) newErrors.role = 'Required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-[#eef2ff] flex items-center justify-center">
          <Calendar className="w-7 h-7 text-[#4f46e5]" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Request Received!</h2>
        <p className="text-slate-500 text-sm max-w-xs">
          Our team will reach out within one business day to schedule your personalized demo.
        </p>
        <Link href="/landing-page" className="mt-2 text-sm text-[#4f46e5] hover:underline font-medium">
          ← Back to home
        </Link>
      </div>
    )
  }

  const inputClass = (field: string) =>
    `border rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] w-full ${
      errors[field] ? 'border-red-400' : 'border-slate-200'
    }`

  const dropdownTriggerClass = (field: string) =>
    `w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm bg-white hover:bg-slate-50 transition-colors ${
      errors[field] ? 'border-red-400 text-slate-700' : 'border-slate-200 text-slate-600'
    }`

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Request Your Personalized Demo</h2>
        <p className="text-slate-400 text-sm mt-1">Fill out the form and our team will get back to you to schedule your demo.</p>
      </div>

      <div className="flex flex-col gap-4">

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter your first name"
              value={form.firstName}
              onChange={(e) => { setForm({ ...form, firstName: e.target.value }); setErrors({ ...errors, firstName: '' }) }}
              className={inputClass('firstName')}
            />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter your last name"
              value={form.lastName}
              onChange={(e) => { setForm({ ...form, lastName: e.target.value }); setErrors({ ...errors, lastName: '' }) }}
              className={inputClass('lastName')}
            />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Work Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            placeholder="Enter your work email"
            value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }}
            className={inputClass('email')}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Org + Job Title */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Organization <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter your organization"
              value={form.organization}
              onChange={(e) => { setForm({ ...form, organization: e.target.value }); setErrors({ ...errors, organization: '' }) }}
              className={inputClass('organization')}
            />
            {errors.organization && <p className="text-xs text-red-500">{errors.organization}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Job Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter your job title"
              value={form.jobTitle}
              onChange={(e) => { setForm({ ...form, jobTitle: e.target.value }); setErrors({ ...errors, jobTitle: '' }) }}
              className={inputClass('jobTitle')}
            />
            {errors.jobTitle && <p className="text-xs text-red-500">{errors.jobTitle}</p>}
          </div>
        </div>

        {/* Phone + Company Size */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass('phone')}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Company Size <span className="text-red-500">*</span></label>
            <DropdownMenu>
              <DropdownMenuTrigger className={dropdownTriggerClass('companySize')}>
                <span className={form.companySize ? 'text-slate-700' : 'text-slate-300'}>
                  {form.companySize || 'Select company size'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {companySizes.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => { setForm({ ...form, companySize: s }); setErrors({ ...errors, companySize: '' }) }}
                    className="cursor-pointer"
                  >
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {errors.companySize && <p className="text-xs text-red-500">{errors.companySize}</p>}
          </div>
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">What best describes your role? <span className="text-red-500">*</span></label>
          <DropdownMenu>
            <DropdownMenuTrigger className={dropdownTriggerClass('role')}>
              <span className={form.role ? 'text-slate-700' : 'text-slate-300'}>
                {form.role || 'Select your role'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {roles.map((r) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => { setForm({ ...form, role: r }); setErrors({ ...errors, role: '' }) }}
                  className="cursor-pointer"
                >
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
        </div>

        {/* Interests */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-600">What are you most interested in? (Select all that apply)</label>
          <div className="grid grid-cols-2 gap-2">
            {interests.map((interest) => (
              <label key={interest} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.interests.includes(interest)}
                  onChange={() => toggle(interest)}
                  className="accent-[#4f46e5] w-4 h-4"
                />
                <span className="text-sm text-slate-600">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Anything else we should know?</label>
          <textarea
            rows={3}
            placeholder="Tell us about your goals or any specific challenges."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-sm py-3 rounded-lg transition-colors mt-1"
        >
          <Calendar className="w-4 h-4" />
          Request Demo
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Lock className="w-3 h-3" />
          We respect your privacy. Your information will never be shared.
        </p>

      </div>
    </div>
  )
}
