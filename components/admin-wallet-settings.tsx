"use client";

import {
  Check,
  Copy,
  LoaderCircle,
  Save,
  WalletCards,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type WalletItem = {
  _id: string;
  key: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  enabled: boolean;
  sortOrder: number;
};

export function AdminWalletSettings() {
  const [wallets, setWallets] = useState<
    WalletItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [savingKey, setSavingKey] =
    useState("");

  const [copiedKey, setCopiedKey] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] = useState("");

  const loadWallets = useCallback(
    async () => {
      try {
        const response = await fetch(
          "/api/admin/wallets",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load wallet settings."
          );
        }

        setError("");
        setWallets(data.wallets || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load wallet settings."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWallets();
  }, [loadWallets]);

  function updateWallet(
    key: string,
    field: "network" | "address" | "enabled",
    value: string | boolean
  ) {
    setWallets((currentWallets) =>
      currentWallets.map((wallet) =>
        wallet.key === key
          ? {
              ...wallet,
              [field]: value,
            }
          : wallet
      )
    );
  }

  async function saveWallet(
    wallet: WalletItem
  ) {
    try {
      setSavingKey(wallet.key);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/admin/wallets",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: wallet.key,
            network: wallet.network,
            address: wallet.address,
            enabled: wallet.enabled,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save wallet."
        );
      }

      setMessage(data.message);
      await loadWallets();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save wallet."
      );
    } finally {
      setSavingKey("");
    }
  }

  async function copyAddress(
    wallet: WalletItem
  ) {
    await navigator.clipboard.writeText(
      wallet.address
    );

    setCopiedKey(wallet.key);

    window.setTimeout(() => {
      setCopiedKey("");
    }, 1600);
  }

  if (loading) {
    return (
      <div className="dashboard-state">
        <LoaderCircle
          className="spin"
          size={30}
        />

        <p>Loading wallet settings...</p>
      </div>
    );
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

      <section className="wallet-settings-grid">
        {wallets.map((wallet) => (
          <article
            className="wallet-setting-card"
            key={wallet.key}
          >
            <div className="wallet-setting-heading">
              <span className="crypto-symbol">
                {wallet.symbol}
              </span>

              <span>
                <strong>{wallet.name}</strong>
                <small>{wallet.key}</small>
              </span>

              <label className="wallet-toggle">
                <input
                  type="checkbox"
                  checked={wallet.enabled}
                  onChange={(event) =>
                    updateWallet(
                      wallet.key,
                      "enabled",
                      event.target.checked
                    )
                  }
                />

                <span />

                {wallet.enabled
                  ? "Enabled"
                  : "Disabled"}
              </label>
            </div>

            <div className="wallet-settings-form">
              <label>
                Network

                <input
                  type="text"
                  value={wallet.network}
                  onChange={(event) =>
                    updateWallet(
                      wallet.key,
                      "network",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Demo/testnet wallet address

                <div className="wallet-input-group">
                  <input
                    type="text"
                    value={wallet.address}
                    onChange={(event) =>
                      updateWallet(
                        wallet.key,
                        "address",
                        event.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      copyAddress(wallet)
                    }
                    aria-label="Copy address"
                  >
                    {copiedKey === wallet.key ? (
                      <Check size={17} />
                    ) : (
                      <Copy size={17} />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="button"
                className="wallet-save-button"
                disabled={
                  savingKey === wallet.key
                }
                onClick={() =>
                  saveWallet(wallet)
                }
              >
                {savingKey === wallet.key ? (
                  <>
                    <LoaderCircle
                      className="spin"
                      size={17}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save wallet
                  </>
                )}
              </button>
            </div>
          </article>
        ))}
      </section>

      {wallets.length === 0 && (
        <div className="admin-empty-state">
          <WalletCards size={27} />
          <h3>No wallet methods found</h3>
        </div>
      )}
    </>
  );
}