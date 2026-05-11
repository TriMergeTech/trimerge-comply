"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import { Suspense } from "react";

function getStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card reset">
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
          <h2>Create New Password</h2>
          <p>Choose a strong password for your account.</p>
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
                  <linearGradient id="shield-reset" x1="0" x2="1" y1="0" y2="1">
                    <stop stopColor="#4ad4ff" />
                    <stop offset=".55" stopColor="#2876ff" />
                    <stop offset="1" stopColor="#6e43ff" />
                  </linearGradient>
                </defs>
                <path
                  d="M90 9 157 35v51c0 54-28 93-67 113-39-20-67-59-67-113V35L90 9Z"
                  fill="url(#shield-reset)"
                />
                <path
                  d="M90 25 140 44v43c0 39-19 70-50 89-31-19-50-50-50-89V44L90 25Z"
                  fill="#42c8ff"
                  opacity=".28"
                />
                <g
                  transform="translate(43 63)"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="32" cy="55" r="22" />
                  <path d="m50 39 45-45M78 11l20 20M66 23l14 14" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        <div className="brand-footer" />
      </aside>

      <main className="form-pane">
        <div className="form-head reset-head">
          <h3>Reset Password</h3>
          <p>Enter your new password below.</p>
        </div>

        <form className="form-stack reset-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>New Password</span>
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

          {password.length > 0 && (
            <>
              <div className="strength">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={i < strength ? "on" : ""} />
                ))}
                <b>{STRENGTH_LABELS[strength]}</b>
              </div>

              <div className="rules">
                <p>Password must contain:</p>
                <div><span>{password.length >= 8 ? "✓" : "·"}</span>At least 8 characters</div>
                <div><span>{/[A-Z]/.test(password) && /[a-z]/.test(password) ? "✓" : "·"}</span>Uppercase and lowercase letters</div>
                <div><span>{/\d/.test(password) ? "✓" : "·"}</span>At least one number</div>
                <div><span>{/[^A-Za-z0-9]/.test(password) ? "✓" : "·"}</span>At least one special character</div>
              </div>
            </>
          )}

          <label className="field">
            <span>Confirm New Password</span>
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

          {error && <p className="error-msg">{error}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
