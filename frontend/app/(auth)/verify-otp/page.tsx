"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp, resendOtp } from "@/lib/api/auth";
import { Suspense } from "react";

function VerifyOTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(45);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  function handleInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      router.push("/login?verified=1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError("");
    try {
      await resendOtp({ email });
      setSeconds(45);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  }

  const countdown = `(00:${String(seconds).padStart(2, "0")})`;

  return (
    <section className="auth-card otp">
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
          <h2>Verify Your Email</h2>
          <p>We&apos;ve sent a 6-digit verification code to your email address.</p>
        </div>

        <div className="illustration">
          <div className="platform p3" />
          <div className="platform p2" />
          <div className="platform p1" />
          <div className="glow" />
          <div className="hero-object">
            <div className="envelope-graphic">
              <div className="paper">
                <span /><span /><span />
              </div>
              <div className="envelope-front" />
            </div>
          </div>
          <div className="success-badge">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="m8 12 3 3 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="brand-footer">
          Didn&apos;t receive the code?{" "}
          {seconds > 0 ? (
            <span style={{ color: "#d4d8ff" }}>Resend {countdown}</span>
          ) : (
            <button
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#05c9ff", fontWeight: 700, fontSize: "inherit" }}
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending…" : "Resend"}
            </button>
          )}
        </div>
      </aside>

      <main className="form-pane">
        <div className="form-head otp-head">
          <h3>Enter Verification Code</h3>
          <p>
            Please enter the 6-digit code sent to<br />
            {email}
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="otp-boxes">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                maxLength={1}
                inputMode="numeric"
                value={d}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={d ? "active" : ""}
              />
            ))}
          </div>

          <div className="notice">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="M12 11v6M12 7h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span>The code will expire in 10 minutes for security reasons.</span>
          </div>

          {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}

          <button className="primary-btn big-space" type="submit" disabled={loading}>
            {loading ? "Verifying…" : "Verify Code"}
          </button>
        </form>

        <Link className="secondary-btn" href="/signup" style={{ marginTop: 12, display: "inline-flex" }}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 18 9 12l6-6M9 12h12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          Back to Sign Up
        </Link>
      </main>
    </section>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense>
      <VerifyOTPForm />
    </Suspense>
  );
}
