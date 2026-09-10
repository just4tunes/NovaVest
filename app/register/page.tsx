"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { brand } from "@/lib/brand";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      router.push(
        data.user.role === "admin" ? "/admin" : "/dashboard"
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

          <h1>Start exploring with demo funds.</h1>

          <p>
            Create an educational account and explore the complete
            NovaVest dashboard without depositing real money.
          </p>
        </div>

        <small>
          Educational demonstration only. No real financial services.
        </small>
      </section>

      <section className="auth-form-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <p className="auth-label">Create an account</p>
            <h2>Welcome to NovaVest</h2>
            <span>
              Enter your information to create your demo account.
            </span>
          </div>

          {error && <div className="form-error">{error}</div>}

          <label>
            Full name

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              placeholder="Alex Thompson"
              autoComplete="name"
              required
            />
          </label>

          <label>
            Email address

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
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
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value,
                })
              }
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label>
            Confirm password

            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm({
                  ...form,
                  confirmPassword: event.target.value,
                })
              }
              placeholder="Enter the password again"
              autoComplete="new-password"
              minLength={8}
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
                Creating account
              </>
            ) : (
              "Create demo account"
            )}
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}