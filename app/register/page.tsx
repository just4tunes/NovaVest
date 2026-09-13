"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe2,
  LineChart,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

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
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Your passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Registration failed."
        );
        return;
      }

      router.push(
        data.user.role === "admin"
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
            <TrendingUp size={15} />
            Start your investment journey
          </span>

          <h1>
            Build and manage your
            <em> investment portfolio.</em>
          </h1>

          <p>
            Create your NovaVest account and
            access investment strategies,
            portfolio tools and account
            management from one dashboard.
          </p>

          <div className="broker-auth-benefits">
            <span>
              <CheckCircle2 size={17} />
              Access multiple investment
              strategies
            </span>

            <span>
              <CheckCircle2 size={17} />
              Monitor balances and portfolio
              performance
            </span>

            <span>
              <CheckCircle2 size={17} />
              Receive important account updates
            </span>
          </div>
        </div>

        <div className="broker-auth-feature-grid">
          <article>
            <LineChart size={22} />

            <span>
              <small>Portfolio tools</small>
              <strong>
                Performance tracking
              </strong>
            </span>
          </article>

          <article>
            <Globe2 size={22} />

            <span>
              <small>Market access</small>
              <strong>
                Diverse strategies
              </strong>
            </span>
          </article>

          <article>
            <ShieldCheck size={22} />

            <span>
              <small>Account security</small>
              <strong>
                Protected access
              </strong>
            </span>
          </article>
        </div>

        <small className="broker-auth-security">
          <LockKeyhole size={14} />
          Secure registration and protected
          account access.
        </small>
      </section>

      <section className="broker-auth-form-section">
        <form
          className="broker-auth-form broker-register-form"
          onSubmit={handleSubmit}
        >
          <div className="broker-auth-form-heading">
            <span>Create your account</span>

            <h2>Join NovaVest</h2>

            <p>
              Enter your details to create your
              investment account.
            </p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="broker-auth-fields">
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
                    email:
                      event.target.value,
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
                    password:
                      event.target.value,
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
                value={
                  form.confirmPassword
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    confirmPassword:
                      event.target.value,
                  })
                }
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          </div>

          <div className="broker-password-note">
            <ShieldCheck size={16} />

            <span>
              Use at least eight characters
              for your password.
            </span>
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
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="broker-auth-switch">
            Already have an account?{" "}
            <Link href="/login">
              Sign in
            </Link>
          </p>

          <p className="broker-auth-disclaimer">
            By creating an account, you agree
            to the platform&apos;s terms and
            privacy policy.
          </p>
        </form>
      </section>
    </main>
  );
}