"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  LoaderCircle,
  Upload,
  Wallet,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { AppShell } from "@/components/app-shell";

type WalletOption = {
  network: string;
  address: string;
};

type WalletCollection = Record<
  string,
  WalletOption
>;

const walletNames: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT_TRC20: "Tether",
  USDT_ERC20: "Tether",
  USDC: "USD Coin",
  BNB: "BNB",
  SOL: "Solana",
};

export default function DepositPage() {
  const [wallets, setWallets] =
    useState<WalletCollection>({});

  const [walletKey, setWalletKey] =
    useState("");

  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] =
    useState("");

  const [receiptUrl, setReceiptUrl] =
    useState("");

  const [receiptName, setReceiptName] =
    useState("");

  const [loadingWallets, setLoadingWallets] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadWallets() {
      try {
        const response = await fetch(
          "/api/deposits",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load deposit methods."
          );
        }

        setWallets(data.wallets || {});

        const firstWallet = Object.keys(
          data.wallets || {}
        )[0];

        if (firstWallet) {
          setWalletKey(firstWallet);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load deposit methods."
        );
      } finally {
        setLoadingWallets(false);
      }
    }

    loadWallets();
  }, []);

  const selectedWallet = wallets[walletKey];

  async function handleCopy() {
    if (!selectedWallet) {
      return;
    }

    await navigator.clipboard.writeText(
      selectedWallet.address
    );

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  function handleReceipt(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const file = event.target.files?.[0];

    if (!file) {
      setReceiptName("");
      setReceiptUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "The receipt must be an image file."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setError(
        "The receipt image must be smaller than 1 MB."
      );
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setReceiptUrl(String(reader.result || ""));
      setReceiptName(file.name);
    };

    reader.onerror = () => {
      setError("Unable to read the receipt image.");
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!receiptUrl) {
      setError(
        "Upload your demo payment receipt."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/deposits",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletKey,
            amount,
            transactionHash,
            receiptUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit your deposit."
        );
      }

      setSuccess(
        "Your demo deposit was submitted successfully and is now processing."
      );

      setAmount("");
      setTransactionHash("");
      setReceiptName("");
      setReceiptUrl("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit your deposit."
      );
    } finally {
      setSubmitting(false);
    }
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

          <h1>Make a demo deposit</h1>

          <p>
            Select a testnet asset and submit your
            simulated payment information.
          </p>
        </div>
      </header>

      <div className="deposit-page-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Deposit method
              </span>

              <h2>Select a crypto asset</h2>
            </div>

            <Wallet size={23} />
          </div>

          {loadingWallets ? (
            <div className="small-loading-state">
              <LoaderCircle
                className="spin"
                size={25}
              />
              Loading deposit methods...
            </div>
          ) : (
            <div className="crypto-option-grid">
              {Object.entries(wallets).map(
                ([key, wallet]) => (
                  <button
                    type="button"
                    key={key}
                    className={`crypto-option ${
                      walletKey === key
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setWalletKey(key)}
                  >
                    <span className="crypto-symbol">
                      {key.startsWith("USDT")
                        ? "USDT"
                        : key}
                    </span>

                    <span>
                      <strong>
                        {walletNames[key] || key}
                      </strong>

                      <small>{wallet.network}</small>
                    </span>
                  </button>
                )
              )}
            </div>
          )}

          {selectedWallet && (
            <div className="wallet-address-box">
              <span>Demo/testnet wallet address</span>

              <div>
                <code>
                  {selectedWallet.address}
                </code>

                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy wallet address"
                >
                  {copied ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>

              <small>
                Network: {selectedWallet.network}
              </small>
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Payment evidence
              </span>

              <h2>Submit your deposit</h2>

              <p>
                The balance remains unchanged until
                administration approves this request.
              </p>
            </div>
          </div>

          {error && (
            <div className="form-message form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-message form-success">
              {success}

              <Link href="/dashboard">
                Return to dashboard
              </Link>
            </div>
          )}

          <form
            className="dashboard-form"
            onSubmit={handleSubmit}
          >
            <label>
              Deposit amount in USD

              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Example: 500"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                required
              />
            </label>

            <label>
              Demo transaction reference

              <input
                type="text"
                placeholder="Enter a unique transaction ID"
                value={transactionHash}
                onChange={(event) =>
                  setTransactionHash(
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              Payment receipt

              <span className="receipt-upload">
                <Upload size={21} />

                <span>
                  <strong>
                    {receiptName ||
                      "Choose receipt image"}
                  </strong>

                  <small>
                    JPG, PNG or WEBP · Maximum 1 MB
                  </small>
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleReceipt}
                />
              </span>
            </label>

            <button
              type="submit"
              className="dashboard-submit-button"
              disabled={
                submitting || loadingWallets
              }
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    className="spin"
                    size={18}
                  />
                  Submitting...
                </>
              ) : (
                "Submit demo deposit"
              )}
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}