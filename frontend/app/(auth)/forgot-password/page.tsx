"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card forgot">
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
          <h2>Reset Your Password</h2>
          <p>No worries! Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        <div className="illustration">
          <div className="platform p3" />
          <div className="platform p2" />
          <div className="platform p1" />
          <div className="glow" />
          <div className="hero-object">
            <div className="lock-graphic">
              <div className="lock-shackle" />
              <div className="lock-body">
                <div className="keyhole" />
              </div>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          Remember your password? <Link href="/login">Login</Link>
        </div>
      </aside>

      <main className="form-pane">
        <div className="form-head forgot-head">
          <h3>Forgot Password</h3>
          <p>
            Enter your work email and we&apos;ll send you instructions to reset
            your password.
          </p>
        </div>

        <form className="form-stack forgot-stack" onSubmit={handleSubmit}>
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

          <div className="notice">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="M12 11v6M12 7h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span>
              We&apos;ll send a password reset link to your email address
              associated with your account.
            </span>
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && (
            <p className="success-msg">
              Reset link sent! Check your inbox.
            </p>
          )}

          <button className="primary-btn" type="submit" disabled={loading || success}>
            {loading ? "Sending…" : success ? "Link Sent" : "Send Reset Link"}
          </button>

          <Link className="secondary-btn" href="/login">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 18 9 12l6-6M9 12h12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Back to Login
          </Link>
        </form>
      </main>
    </section>
  );
}
