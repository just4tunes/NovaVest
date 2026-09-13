"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { brand } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Login failed."
        );
        return;
      }

      router.push(
        data.role === "admin"
          ? "/admin"
          : "/dashboard"
      );

      router.refresh();
    } catch {
      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="broker-auth-page">
      <section className="broker-auth-showcase">
        <Link
          href="/"
          className="broker-auth-back"
        >
          <ArrowLeft size={17} />
          Back to homepage
        </Link>

        <div className="broker-auth-brand">
          <span className="home-brand-mark">
            {brand.shortName || "NV"}
          </span>

          <span>{brand.name}</span>
        </div>

        <div className="broker-auth-copy">
          <span className="broker-auth-eyebrow">
            <ShieldCheck size={15} />
            Secure account access
          </span>

          <h1>
            Welcome back to your
            <em> investment portfolio.</em>
          </h1>

          <p>
            Sign in to monitor your
            investments, manage your balance
            and review your latest account
            activity.
          </p>

          <div className="broker-auth-benefits">
            <span>
              <CheckCircle2 size={17} />
              Monitor active investment plans
            </span>

            <span>
              <CheckCircle2 size={17} />
              Review deposits and withdrawals
            </span>

            <span>
              <CheckCircle2 size={17} />
              Track complete account activity
            </span>
          </div>
        </div>

        <div className="broker-auth-preview">
          <div className="broker-auth-preview-heading">
            <span>
              <small>Portfolio overview</small>
              <strong>Account performance</strong>
            </span>

            <BarChart3 size={21} />
          </div>

          <div className="broker-auth-preview-chart">
            <span style={{ height: "30%" }} />
            <span style={{ height: "44%" }} />
            <span style={{ height: "38%" }} />
            <span style={{ height: "57%" }} />
            <span style={{ height: "49%" }} />
            <span style={{ height: "70%" }} />
            <span style={{ height: "64%" }} />
            <span style={{ height: "85%" }} />
            <span style={{ height: "77%" }} />
            <span style={{ height: "100%" }} />
          </div>

          <div className="broker-auth-preview-result">
            <span>
              <TrendingUp size={16} />
              Portfolio growth
            </span>

            <strong>+12.37%</strong>
          </div>
        </div>

        <small className="broker-auth-security">
          <LockKeyhole size={14} />
          Your account session is securely
          protected.
        </small>
      </section>

      <section className="broker-auth-form-section">
        <form
          className="broker-auth-form"
          onSubmit={handleSubmit}
        >
          <div className="broker-auth-form-heading">
            <span>Account access</span>
            <h2>Sign in to NovaVest</h2>

            <p>
              Enter your registered email and
              password to continue.
            </p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="broker-auth-fields">
            <label>
              Email address

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="alex@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          <div className="broker-auth-options">
            <label>
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <span>Protected account access</span>
          </div>

          <button
            type="submit"
            className="broker-auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  className="loading-icon"
                  size={18}
                />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="broker-auth-switch">
            Don&apos;t have an account?{" "}
            <Link href="/register">
              Create an account
            </Link>
          </p>

          <p className="broker-auth-disclaimer">
            By continuing, you agree to the
            platform&apos;s terms and privacy
            policy.
          </p>
        </form>
      </section>
    </main>
  );
}