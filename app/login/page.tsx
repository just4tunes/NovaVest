"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { brand } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      router.push(
        data.role === "admin" ? "/admin" : "/dashboard"
      );

      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-information">
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={17} />
          Back to homepage
        </Link>

        <div>
          <div className="brand">
            <span className="brand-mark">N</span>
            <span>{brand.name}</span>
          </div>

          <h1>Welcome back to your demo portfolio.</h1>

          <p>
            Sign in to view your simulated balance, investments and
            account activity.
          </p>
        </div>

        <small>
          Educational demonstration only. No real financial services.
        </small>
      </section>

      <section className="auth-form-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <p className="auth-label">Account access</p>
            <h2>Sign in</h2>
            <span>Enter the details used during registration.</span>
          </div>

          {error && <div className="form-error">{error}</div>}

          <label>
            Email address

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="loading-icon" size={18} />
                Signing in
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <p className="auth-switch">
            Don’t have an account?{" "}
            <Link href="/register">Create one</Link>
          </p>
        </form>
      </section>
    </main>
  );
}