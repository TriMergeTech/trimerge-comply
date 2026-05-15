"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    setLoading(true);
    try {
      await signup({ name, email, password, phone });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card signup">
      <aside className="brand-pane">
        <div className="logo">
          <div className="logo-mark">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path
                d="M24 5 41 11v12c0 10.7-6.9 18.7-17 22-10.1-3.3-17-11.3-17-22V11L24 5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                d="m18 24 4 4 8-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <strong>TriMerge</strong>
            <span>COMPLY</span>
          </div>
        </div>

        <div className="brand-copy">
          <h2>Create Your Account</h2>
          <p>Join TriMerge Comply and streamline your HR compliance audits.</p>
        </div>

        <div className="illustration">
          <div className="platform p3" />
          <div className="platform p2" />
          <div className="platform p1" />
          <div className="glow" />
          <div className="hero-object">
            <div className="shield-graphic">
              <svg viewBox="0 0 180 210">
                <defs>
                  <linearGradient id="shield-signup" x1="0" x2="1" y1="0" y2="1">
                    <stop stopColor="#4ad4ff" />
                    <stop offset=".55" stopColor="#2876ff" />
                    <stop offset="1" stopColor="#6e43ff" />
                  </linearGradient>
                </defs>
                <path
                  d="M90 9 157 35v51c0 54-28 93-67 113-39-20-67-59-67-113V35L90 9Z"
                  fill="url(#shield-signup)"
                />
                <path
                  d="M90 25 140 44v43c0 39-19 70-50 89-31-19-50-50-50-89V44L90 25Z"
                  fill="#42c8ff"
                  opacity=".28"
                />
                <path
                  d="m58 101 24 25 44-56"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </aside>

      <main className="form-pane">
        <div className="form-head signup-head">
          <h3>Sign Up</h3>
          <p>Fill in your details to get started</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Full Name</span>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
              <input
                name="full-name"
                type="text"
                placeholder="Sarah Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Work Email</span>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <path d="m3 7 9 6 9-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <input
                name="work-email"
                type="email"
                placeholder="sarah.johnson@agency.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Phone Number</span>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                name="phone"
                type="tel"
                placeholder="+1 (305) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </label>


          <label className="field">
            <span>Password</span>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="10" width="16" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <path d="M8 10V7a4 4 0 1 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="icon-button"
                type="button"
                aria-label="Show password"
                onClick={() => setShowPassword((v) => !v)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
                </svg>
              </button>
            </div>
          </label>

          <label className="field">
            <span>Confirm Password</span>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="10" width="16" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <path d="M8 10V7a4 4 0 1 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                className="icon-button"
                type="button"
                aria-label="Show password"
                onClick={() => setShowConfirm((v) => !v)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
                </svg>
              </button>
            </div>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I agree to the <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </span>
          </label>

          {error && <p className="error-msg">{error}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="fine-print">We&apos;ll send a verification code to your email</p>
        </form>
      </main>
    </section>
  );
}
