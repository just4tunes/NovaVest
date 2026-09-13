"use client";

import {
  Check,
  Edit3,
  LoaderCircle,
  Plus,
  Power,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type RiskLevel =
  | "Low"
  | "Moderate"
  | "High";

type InvestmentPlan = {
  _id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  minimumAmount: number;
  targetRate: number;
  durationDays: number;
  riskLevel: RiskLevel;
  features: string[];
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type PlanForm = {
  name: string;
  category: string;
  description: string;
  minimumAmount: string;
  targetRate: string;
  durationDays: string;
  riskLevel: RiskLevel;
  features: string;
  enabled: boolean;
  sortOrder: string;
};

const emptyForm: PlanForm = {
  name: "",
  category: "",
  description: "",
  minimumAmount: "",
  targetRate: "",
  durationDays: "",
  riskLevel: "Moderate",
  features: "",
  enabled: true,
  sortOrder: "0",
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function AdminInvestmentPlans() {
  const [plans, setPlans] =
    useState<InvestmentPlan[]>([]);

  const [form, setForm] =
    useState<PlanForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [workingId, setWorkingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/investment-plans?refresh=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load investment plans."
        );
      }

      setPlans(data.plans || []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load investment plans."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void loadPlans();
}, [loadPlans]);

  function updateForm<
    Key extends keyof PlanForm,
  >(key: Key, value: PlanForm[Key]) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editPlan(plan: InvestmentPlan) {
    setEditingId(plan._id);

    setForm({
      name: plan.name,
      category: plan.category,
      description: plan.description,
      minimumAmount: String(
        plan.minimumAmount
      ),
      targetRate: String(
        plan.targetRate
      ),
      durationDays: String(
        plan.durationDays
      ),
      riskLevel: plan.riskLevel,
      features:
        plan.features.join(", "),
      enabled: plan.enabled,
      sortOrder: String(
        plan.sortOrder
      ),
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function planPayload(
    planForm: PlanForm
  ) {
    return {
      name: planForm.name,
      category: planForm.category,
      description:
        planForm.description,
      minimumAmount: Number(
        planForm.minimumAmount
      ),
      targetRate: Number(
        planForm.targetRate
      ),
      durationDays: Number(
        planForm.durationDays
      ),
      riskLevel:
        planForm.riskLevel,
      features: planForm.features,
      enabled: planForm.enabled,
      sortOrder: Number(
        planForm.sortOrder || 0
      ),
    };
  }

  async function savePlan(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const endpoint = editingId
        ? `/api/admin/investment-plans/${editingId}`
        : "/api/admin/investment-plans";

      const response = await fetch(
        endpoint,
        {
          method: editingId
            ? "PATCH"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            planPayload(form)
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save investment plan."
        );
      }

      setMessage(data.message);
      resetForm();

      await loadPlans();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save investment plan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePlan(
    plan: InvestmentPlan
  ) {
    try {
      setWorkingId(plan._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/investment-plans/${plan._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...planPayload({
              name: plan.name,
              category: plan.category,
              description:
                plan.description,
              minimumAmount: String(
                plan.minimumAmount
              ),
              targetRate: String(
                plan.targetRate
              ),
              durationDays: String(
                plan.durationDays
              ),
              riskLevel:
                plan.riskLevel,
              features:
                plan.features.join(", "),
              enabled: !plan.enabled,
              sortOrder: String(
                plan.sortOrder
              ),
            }),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to change plan status."
        );
      }

      setMessage(
        plan.enabled
          ? "Investment plan disabled."
          : "Investment plan enabled."
      );

      await loadPlans();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Unable to change plan status."
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function deletePlan(
    plan: InvestmentPlan
  ) {
    const confirmation =
      window.confirm(
        `Delete "${plan.name}"? Plans with existing investments will be disabled instead.`
      );

    if (!confirmation) {
      return;
    }

    try {
      setWorkingId(plan._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/investment-plans/${plan._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete investment plan."
        );
      }

      setMessage(data.message);

      if (editingId === plan._id) {
        resetForm();
      }

      await loadPlans();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete investment plan."
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <>
      {error && (
        <div className="form-message form-error">
          {error}
        </div>
      )}

      {message && (
        <div className="form-message form-success">
          {message}
        </div>
      )}

      <section className="admin-plan-layout">
        <article className="dashboard-panel admin-plan-form-card">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Plan editor
              </span>

              <h2>
                {editingId
                  ? "Edit investment plan"
                  : "Create investment plan"}
              </h2>

              <p>
                Configure the strategy shown
                to users.
              </p>
            </div>

            {editingId ? (
              <Edit3 size={21} />
            ) : (
              <Plus size={21} />
            )}
          </div>

          <form
            className="admin-plan-form"
            onSubmit={savePlan}
          >
            <div className="admin-plan-field">
              <label htmlFor="plan-name">
                Plan name
              </label>

              <input
                id="plan-name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateForm(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Balanced Growth Strategy"
                required
              />
            </div>

            <div className="admin-plan-field">
              <label htmlFor="plan-category">
                Category
              </label>

              <input
                id="plan-category"
                type="text"
                value={form.category}
                onChange={(event) =>
                  updateForm(
                    "category",
                    event.target.value
                  )
                }
                placeholder="Mixed Assets"
                required
              />
            </div>

            <div className="admin-plan-field admin-plan-full-field">
              <label htmlFor="plan-description">
                Description
              </label>

              <textarea
                id="plan-description"
                value={form.description}
                onChange={(event) =>
                  updateForm(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Describe the simulated investment strategy."
                rows={4}
                required
              />
            </div>

            <div className="admin-plan-field">
              <label htmlFor="plan-minimum">
                Minimum investment
              </label>

              <input
                id="plan-minimum"
                type="number"
                min="1"
                step="0.01"
                value={
                  form.minimumAmount
                }
                onChange={(event) =>
                  updateForm(
                    "minimumAmount",
                    event.target.value
                  )
                }
                placeholder="500"
                required
              />
            </div>

            <div className="admin-plan-field">
              <label htmlFor="plan-target">
                Target return (%)
              </label>

              <input
                id="plan-target"
                type="number"
                min="0"
                step="0.01"
                value={form.targetRate}
                onChange={(event) =>
                  updateForm(
                    "targetRate",
                    event.target.value
                  )
                }
                placeholder="12"
                required
              />
            </div>

            <div className="admin-plan-field">
              <label htmlFor="plan-duration">
                Duration in days
              </label>

              <input
                id="plan-duration"
                type="number"
                min="1"
                step="1"
                value={
                  form.durationDays
                }
                onChange={(event) =>
                  updateForm(
                    "durationDays",
                    event.target.value
                  )
                }
                placeholder="90"
                required
              />
            </div>

            <div className="admin-plan-field">
              <label htmlFor="plan-risk">
                Risk level
              </label>

              <select
                id="plan-risk"
                value={form.riskLevel}
                onChange={(event) =>
                  updateForm(
                    "riskLevel",
                    event.target
                      .value as RiskLevel
                  )
                }
              >
                <option value="Low">
                  Low
                </option>

                <option value="Moderate">
                  Moderate
                </option>

                <option value="High">
                  High
                </option>
              </select>
            </div>

            <div className="admin-plan-field">
              <label htmlFor="plan-order">
                Display order
              </label>

              <input
                id="plan-order"
                type="number"
                step="1"
                value={form.sortOrder}
                onChange={(event) =>
                  updateForm(
                    "sortOrder",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="admin-plan-field admin-plan-full-field">
              <label htmlFor="plan-features">
                Plan features
              </label>

              <input
                id="plan-features"
                type="text"
                value={form.features}
                onChange={(event) =>
                  updateForm(
                    "features",
                    event.target.value
                  )
                }
                placeholder="Diversified portfolio, Weekly monitoring, Risk controls"
              />

              <small>
                Separate each feature with
                a comma.
              </small>
            </div>

            <label className="admin-plan-checkbox">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) =>
                  updateForm(
                    "enabled",
                    event.target.checked
                  )
                }
              />

              Show this plan to users
            </label>

            <div className="admin-plan-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="admin-plan-secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel editing
                </button>
              )}

              <button
                type="submit"
                className="investment-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle
                      className="spin"
                      size={17}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    {editingId
                      ? "Save changes"
                      : "Create plan"}
                  </>
                )}
              </button>
            </div>
          </form>
        </article>

        <article className="dashboard-panel admin-plan-list-card">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Available strategies
              </span>

              <h2>Investment plans</h2>

              <p>
                {plans.length}{" "}
                {plans.length === 1
                  ? "plan"
                  : "plans"}{" "}
                configured
              </p>
            </div>

            <button
              type="button"
              className="receipt-button"
              onClick={() =>
                void loadPlans()
              }
              disabled={loading}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="dashboard-state">
              <LoaderCircle
                className="spin"
                size={28}
              />

              <p>Loading plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="admin-empty-state">
              <Plus size={28} />

              <h3>No plans created</h3>

              <p>
                Use the form to create the
                first investment strategy.
              </p>
            </div>
          ) : (
            <div className="admin-plan-list">
              {plans.map((plan) => (
                <article
                  className="admin-plan-item"
                  key={plan._id}
                >
                  <div className="admin-plan-item-heading">
                    <div>
                      <span>
                        {plan.category}
                      </span>

                      <h3>{plan.name}</h3>
                    </div>

                    <span
                      className={`admin-plan-state ${
                        plan.enabled
                          ? "admin-plan-enabled"
                          : "admin-plan-disabled"
                      }`}
                    >
                      {plan.enabled
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>

                  <p>
                    {plan.description}
                  </p>

                  <div className="admin-plan-stat-grid">
                    <div>
                      <span>Minimum</span>
                      <strong>
                        {formatMoney(
                          plan.minimumAmount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Target</span>
                      <strong>
                        {plan.targetRate}%
                      </strong>
                    </div>

                    <div>
                      <span>Duration</span>
                      <strong>
                        {plan.durationDays} days
                      </strong>
                    </div>

                    <div>
                      <span>Risk</span>
                      <strong>
                        {plan.riskLevel}
                      </strong>
                    </div>
                  </div>

                  {plan.features.length >
                    0 && (
                    <ul className="admin-plan-features">
                      {plan.features.map(
                        (feature) => (
                          <li key={feature}>
                            {feature}
                          </li>
                        )
                      )}
                    </ul>
                  )}

                  <div className="admin-plan-item-actions">
                    <button
                      type="button"
                      onClick={() =>
                        editPlan(plan)
                      }
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void togglePlan(plan)
                      }
                      disabled={
                        workingId ===
                        plan._id
                      }
                    >
                      <Power size={16} />
                      {plan.enabled
                        ? "Disable"
                        : "Enable"}
                    </button>

                    <button
                      type="button"
                      className="admin-plan-delete-button"
                      onClick={() =>
                        void deletePlan(plan)
                      }
                      disabled={
                        workingId ===
                        plan._id
                      }
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </>
  );
}