import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { brand } from "@/lib/brand";

const features = [
  {
    icon: WalletCards,
    title: "Demo portfolio",
    description:
      "Practice deposits, withdrawals and investments with simulated funds.",
  },
  {
    icon: BarChart3,
    title: "Clear performance",
    description:
      "Monitor balances, activity and plan progress from one dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Audited actions",
    description:
      "Administrative balance adjustments will have reasons and timestamps.",
  },
];

const chartHeights = [28, 46, 38, 63, 55, 78, 68, 92, 82, 100, 88, 112];

export default function Home() {
  return (
    <main className="landing-page">
      <div className="demo-banner">
        Educational demo · No real funds or financial services
      </div>

      <nav className="landing-nav container">
        <Link href="/" className="brand">
          <span className="brand-mark">N</span>
          <span>{brand.name}</span>
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">How it works</a>
          <a href="#security">Security</a>
        </div>

        <Link href="/login" className="nav-button">
          Sign in
        </Link>
      </nav>

      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} />A safer way to learn investment software
          </div>

          <h1>
            Learn the flow.
            <span>Risk nothing.</span>
          </h1>

          <p>
            Explore an investment-style dashboard using demo funds. Submit
            requests, monitor activity and understand account operations.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="primary-button">
              Create demo account
              <ArrowRight size={18} />
            </Link>

            <Link href="/admin" className="outline-button">
              View admin demo
            </Link>
          </div>

          <div className="hero-statistics">
            <div>
              <strong>100%</strong>
              <span>Simulated</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Practice access</span>
            </div>

            <div>
              <strong>0</strong>
              <span>Real-money risk</span>
            </div>
          </div>
        </div>

        <div className="portfolio-preview">
          <div className="preview-heading">
            <span>Demo portfolio</span>
            <span className="active-pill">Active simulation</span>
          </div>

          <p className="balance-label">Total demo balance</p>
          <h2>{brand.currencySymbol}24,680.50</h2>

          <div className="chart-bars">
            {chartHeights.map((height, index) => (
              <span key={index} style={{ height }} />
            ))}
          </div>

          <div className="preview-metrics">
            <div>
              <span>Demo profit</span>
              <strong>+$2,480.20</strong>
            </div>

            <div>
              <span>Active plans</span>
              <strong>3 plans</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <p className="section-label">Built for guided practice</p>

          <h2 className="section-title">
            Everything needed to understand the workflow.
          </h2>

          <div className="feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="feature-card" key={feature.title}>
                  <Icon size={25} />
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-content">
          <span>© 2026 {brand.name}</span>
          <span>Demo platform — no real funds</span>
        </div>
      </footer>
    </main>
  );
}
