"use client";

import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  LoaderCircle,
  Save,
  UserRound,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { AppShell } from "@/components/app-shell";

type Profile = {
  name: string;
  email: string;
  phone: string;
  country: string;
  accountStatus: string;
  createdAt: string;
  passwordChangedAt: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(
          "/api/user/profile",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load your profile."
          );
        }

        setProfile(data.user);
        setName(data.user.name || "");
        setPhone(data.user.phone || "");
        setCountry(data.user.country || "");
      } catch (error) {
        setProfileError(
          error instanceof Error
            ? error.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleProfileUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setProfileError("");
    setProfileMessage("");

    try {
      setSavingProfile(true);

      const response = await fetch(
        "/api/user/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            country,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update your profile."
        );
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              name: data.user.name,
              phone: data.user.phone,
              country: data.user.country,
            }
          : current
      );

      setProfileMessage(data.message);
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    try {
      setSavingPassword(true);

      const response = await fetch(
        "/api/user/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to change your password."
        );
      }

      setPasswordMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Unable to change your password."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <AppShell mode="user">
        <div className="dashboard-state">
          <LoaderCircle
            className="spin"
            size={30}
          />

          <p>Loading your profile...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mode="user">
      <header className="dashboard-header">
        <div>
          <Link
            href="/dashboard"
            className="page-back-link"
          >
            <ArrowLeft size={16} />
            Back to overview
          </Link>

          <h1>Profile and security</h1>

          <p>
            Manage your personal information and
            password.
          </p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Personal information
              </span>

              <h2>Your profile</h2>
            </div>

            <UserRound size={23} />
          </div>

          {profileError && (
            <div className="form-message form-error">
              {profileError}
            </div>
          )}

          {profileMessage && (
            <div className="form-message form-success">
              {profileMessage}
            </div>
          )}

          <form
            className="dashboard-form"
            onSubmit={handleProfileUpdate}
          >
            <label>
              Full name

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />
            </label>

            <label>
              Email address

              <input
                type="email"
                value={profile?.email || ""}
                disabled
              />

              <small>
                Your login email cannot be changed
                from this page.
              </small>
            </label>

            <label>
              Phone number

              <input
                type="tel"
                placeholder="+234..."
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
              />
            </label>

            <label>
              Country

              <input
                type="text"
                placeholder="Nigeria"
                value={country}
                onChange={(event) =>
                  setCountry(event.target.value)
                }
              />
            </label>

            <div className="profile-meta">
              <span>
                Account status
                <strong>
                  {profile?.accountStatus}
                </strong>
              </span>

              <span>
                Member since
                <strong>
                  {profile?.createdAt
                    ? new Date(
                        profile.createdAt
                      ).toLocaleDateString()
                    : "—"}
                </strong>
              </span>
            </div>

            <button
              type="submit"
              className="dashboard-submit-button"
              disabled={savingProfile}
            >
              {savingProfile ? (
                <>
                  <LoaderCircle
                    className="spin"
                    size={18}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save profile
                </>
              )}
            </button>
          </form>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Account security
              </span>

              <h2>Change password</h2>

              <p>
                Your password is encrypted and cannot
                be viewed by administrators.
              </p>
            </div>

            <KeyRound size={23} />
          </div>

          {passwordError && (
            <div className="form-message form-error">
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div className="form-message form-success">
              {passwordMessage}
            </div>
          )}

          <form
            className="dashboard-form"
            onSubmit={handlePasswordChange}
          >
            <label>
              Current password

              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              New password

              <input
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                required
              />

              <small>
                Use at least 8 characters.
              </small>
            </label>

            <label>
              Confirm new password

              <input
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <button
              type="submit"
              className="dashboard-submit-button"
              disabled={savingPassword}
            >
              {savingPassword ? (
                <>
                  <LoaderCircle
                    className="spin"
                    size={18}
                  />
                  Changing password...
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  Change password
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}