"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api/auth";
import { setTokens } from "@/lib/authTokens";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      setTokens(data.accessToken, data.refreshToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card login">
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
          <h2>Welcome Back!</h2>
          <p>Sign in to continue to your compliance dashboard.</p>
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
          Don&apos;t have an account?{" "}
          <Link href="/signup">Sign up</Link>
        </div>
      </aside>

      <main className="form-pane">
        <div className="form-head login-head">
          <h3>Login</h3>
          <p>Enter your credentials to access your account</p>
        </div>

        <form className="form-stack login-stack" onSubmit={handleSubmit}>
          {verified && (
            <p className="success-msg">
              Your email has been verified. You can now sign in.
            </p>
          )}

          <label className="field">
            <span>Work Email</span>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <path d="m3 7 9 6 9-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <input
                name="email"
                type="email"
                placeholder="sarah.johnson@agency.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          <div className="login-options">
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password">Forgot Password?</Link>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </button>

          <div className="divider"><span>or</span></div>

          <button className="secondary-btn" type="button">
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
            Login with SSO
          </button>
        </form>
      </main>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
