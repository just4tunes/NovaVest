import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bitcoin,
  Building2,
  Check,
  CircleDollarSign,
  Globe2,
  Handshake,
  Headphones,
  Landmark,
  LineChart,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";

import { brand } from "@/lib/brand";
import { LandingScrollAnimations } from "@/components/landing-scroll-animations";

const marketAssets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$78,420.00",
    change: "+2.84%",
    positive: true,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$4,185.40",
    change: "+1.92%",
    positive: true,
  },
  {
    symbol: "SPX",
    name: "S&P 500",
    price: "6,412.08",
    change: "-0.37%",
    positive: false,
  },
  {
    symbol: "XAU",
    name: "Gold",
    price: "$2,685.20",
    change: "+0.74%",
    positive: true,
  },
];

const services = [
  {
    icon: Bitcoin,
    title: "Digital assets",
    description:
      "Explore cryptocurrency-focused investment plans from one straightforward platform.",
  },
  {
    icon: Building2,
    title: "Real estate",
    description:
      "Discover property-backed opportunities across carefully selected markets.",
  },
  {
    icon: CircleDollarSign,
    title: "Fixed income",
    description:
      "Choose structured strategies designed around stable, clearly projected returns.",
  },
  {
    icon: LineChart,
    title: "Market strategies",
    description:
      "Access diversified plans covering stocks, commodities and global market themes.",
  },
  {
    icon: Landmark,
    title: "Infrastructure",
    description:
      "Participate in long-term strategies connected to essential industries.",
  },
  {
    icon: BarChart3,
    title: "Portfolio insights",
    description:
      "Monitor balances, investments and performance from your personal dashboard.",
  },
];

const hallmarks = [
  {
    icon: Users,
    title: "Personal guidance",
    description:
      "A clear account experience designed to make every step easy to understand.",
  },
  {
    icon: Globe2,
    title: "Diversified opportunities",
    description:
      "Investment plans across crypto, real estate, stocks and fixed-income strategies.",
  },
  {
    icon: ShieldCheck,
    title: "Secure account controls",
    description:
      "Protected authentication and administrator-reviewed financial requests.",
  },
  {
    icon: Headphones,
    title: "Dedicated support",
    description:
      "Notifications and administrative messages keep you informed about your account.",
  },
  {
    icon: Zap,
    title: "Fast operations",
    description:
      "Submit deposits, investments and withdrawals through an efficient workflow.",
  },
  {
    icon: Handshake,
    title: "Transparent management",
    description:
      "Follow every balance change, investment update and account transaction.",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <LandingScrollAnimations />
      <section className="home-hero" id="home">
        <nav className="home-navbar home-container">
          <Link href="/" className="home-brand">
            <span className="home-brand-mark">
              {brand.shortName || "NV"}
            </span>

            <span>{brand.name}</span>
          </Link>

          <div className="home-nav-links">
            <a href="#home">Home</a>
            <a href="#markets">Markets</a>
            <a href="#properties">Real estate</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
          </div>

          <div className="home-nav-actions">
            <Link href="/login" className="home-login-link">
              Log in
            </Link>

            <Link href="/register" className="home-nav-button">
              Create account
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <div className="home-hero-content home-container">
          <div className="home-hero-copy">
            <div className="home-kicker">
              <Sparkles size={15} />
              Modern investment platform
            </div>

            <h1>
              Build your portfolio across
              <span>global markets.</span>
            </h1>

            <p>
              Access investment strategies across digital assets,
              stocks, real estate and fixed income from one modern
              brokerage platform.
            </p>

            <div className="home-hero-actions">
              <Link href="/register" className="home-primary-button">
                Start investing
                <ArrowRight size={18} />
              </Link>

              <a href="#plans" className="home-secondary-button">
                View plans
              </a>
            </div>

            <div className="home-hero-trust">
              <span>
                <ShieldCheck size={17} />
                Secure accounts
              </span>

              <span>
                <Globe2 size={17} />
                Diverse markets
              </span>

              <span>
                <Headphones size={17} />
                Dedicated support
              </span>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-building">
              <div className="home-building-roof" />

              <div className="home-building-columns">
                {Array.from({ length: 6 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>

              <div className="home-building-steps" />
            </div>

            <div className="home-floating-card home-floating-investment">
              <Landmark size={19} />

              <span>
                <small>Investment strategy</small>
                <strong>Global portfolio</strong>
              </span>
            </div>

            <div className="home-floating-card home-floating-return">
              <TrendingUp size={19} />

              <span>
                <small>Portfolio growth</small>
                <strong>+12.37%</strong>
              </span>
            </div>

            <div className="home-floating-card home-floating-assets">
              <small>Portfolio assets</small>

              <div>
                <span>₿</span>
                <span>Ξ</span>
                <span>$</span>
                <span>G</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-steps">
        <div className="home-container">
          <div className="home-statistics">
            <div>
              <strong>$4B+</strong>
              <span>Account activity</span>
            </div>

            <div>
              <strong>3,000+</strong>
              <span>Investors</span>
            </div>

            <div>
              <strong>99.9%</strong>
              <span>Platform uptime</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Account access</span>
            </div>
          </div>

          <div className="home-section-heading home-centered-heading">
            <span>Simple account setup</span>

            <h2>
              Start investing in
              <em> three easy steps</em>
            </h2>

            <p>
              Create your account, fund your balance and select an
              investment strategy that matches your goals.
            </p>
          </div>

          <div className="home-step-grid">
            <article>
              <span className="home-step-number">01</span>
              <WalletCards size={28} />
              <h3>Create your account</h3>
              <p>
                Register and gain access to your personal brokerage
                dashboard.
              </p>
            </article>

            <article>
              <span className="home-step-number">02</span>
              <CircleDollarSign size={28} />
              <h3>Fund your balance</h3>
              <p>
                Select a supported asset and submit your deposit
                information.
              </p>
            </article>

            <article>
              <span className="home-step-number">03</span>
              <TrendingUp size={28} />
              <h3>Choose a strategy</h3>
              <p>
                Compare available plans and begin tracking your
                investment.
              </p>
            </article>
          </div>

          <Link href="/register" className="home-inline-button">
            Open an account
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="home-market-section" id="markets">
        <div className="home-container">
          <div className="home-section-heading home-market-heading">
            <span>Market intelligence</span>

            <h2>
              Follow the markets with
              <em> clearer insights.</em>
            </h2>

            <p>
              Monitor market movements, major assets and portfolio
              opportunities from one place.
            </p>
          </div>

          <div className="home-market-layout">
            <div className="home-market-chart-card">
              <div className="home-chart-top">
                <div>
                  <small>Market performance</small>
                  <strong>Global Market Index</strong>
                </div>

                <span className="home-market-positive">
                  <TrendingUp size={15} />
                  +12.6%
                </span>
              </div>

              <div className="home-line-chart">
                <span className="home-grid-line line-one" />
                <span className="home-grid-line line-two" />
                <span className="home-grid-line line-three" />

                <svg
                  viewBox="0 0 700 250"
                  role="img"
                  aria-label="Market performance chart"
                >
                  <defs>
                    <linearGradient
                      id="homeChartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#2c88ff"
                        stopOpacity="0.4"
                      />
                      <stop
                        offset="100%"
                        stopColor="#2c88ff"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    className="home-chart-area"
                    d="M0 210 C60 195 85 204 130 170 C175 136 210 164 255 125 C300 87 330 120 375 85 C420 48 455 103 500 62 C545 22 590 69 700 20 L700 250 L0 250 Z"
                  />

                  <path
                    className="home-chart-line"
                    d="M0 210 C60 195 85 204 130 170 C175 136 210 164 255 125 C300 87 330 120 375 85 C420 48 455 103 500 62 C545 22 590 69 700 20"
                  />
                </svg>

                <div className="home-chart-months">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                  <span>Sep</span>
                  <span>Nov</span>
                </div>
              </div>
            </div>

            <div className="home-watchlist-card">
              <div className="home-card-title">
                <span>
                  <small>Watchlist</small>
                  <strong>Top markets</strong>
                </span>

                <BarChart3 size={21} />
              </div>

              <div className="home-watchlist">
                {marketAssets.map((asset) => (
                  <div key={asset.symbol}>
                    <span className="home-asset-symbol">
                      {asset.symbol.slice(0, 2)}
                    </span>

                    <span>
                      <strong>{asset.name}</strong>
                      <small>{asset.symbol}</small>
                    </span>

                    <span className="home-asset-price">
                      <strong>{asset.price}</strong>

                      <small
                        className={
                          asset.positive
                            ? "home-market-positive"
                            : "home-market-negative"
                        }
                      >
                        {asset.change}
                      </small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-property-section" id="properties">
        <div className="home-container home-property-layout">
          <div className="home-property-visual">
            <div className="home-property-image">
              <Building2 size={72} />
              <span>Premium commercial property</span>
            </div>

            <div className="home-property-detail home-property-value">
              <small>Property value</small>
              <strong>$6,040,000</strong>
            </div>

            <div className="home-property-detail home-property-rating">
              <small>Asset rating</small>
              <strong>★★★★★</strong>
            </div>
          </div>

          <div className="home-section-heading">
            <span>Property investments</span>

            <h2>
              Real estate
              <em> opportunities.</em>
            </h2>

            <p>
              Explore property-focused strategies covering commercial,
              residential and development opportunities.
            </p>

            <ul className="home-check-list">
              <li>
                <Check size={17} />
                Carefully structured property strategies
              </li>

              <li>
                <Check size={17} />
                Clear investment durations and projected returns
              </li>

              <li>
                <Check size={17} />
                Performance available from your dashboard
              </li>
            </ul>

            <Link href="/register" className="home-primary-button">
              Explore investments
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-about-section" id="about">
        <div className="home-container home-about-layout">
          <div className="home-section-heading">
            <span>About the platform</span>

            <h2>
              Investing made
              <em> organised and accessible.</em>
            </h2>

            <p>
              {brand.name} brings account funding, investment
              strategies, portfolio monitoring and withdrawals into
              one carefully designed experience.
            </p>

            <p>
              Every account action is recorded, allowing users to
              understand their balances and follow their financial
              activity clearly.
            </p>

            <Link href="/register" className="home-primary-button">
              View investment plans
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="home-about-card">
            <div className="home-about-visual">
              <LineChart size={68} />
            </div>

            <div className="home-about-metrics">
              <div>
                <small>Investment options</small>
                <strong>Multiple markets</strong>
              </div>

              <div>
                <small>Account monitoring</small>
                <strong>Available anytime</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-tools-section">
        <div className="home-container home-tools-layout">
          <div className="home-section-heading home-dark-heading">
            <span>Trading technology</span>

            <h2>
              Professional
              <em> trading tools.</em>
            </h2>

            <p>
              Access portfolio information, account history and
              investment performance from an institutional-style
              interface.
            </p>

            <Link href="/register" className="home-primary-button">
              Access the platform
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="home-terminal">
            <div className="home-terminal-tabs">
              <span className="active">Overview</span>
              <span>Markets</span>
              <span>Performance</span>
            </div>

            <div className="home-terminal-chart">
              <svg
                viewBox="0 0 620 210"
                role="img"
                aria-label="Trading performance chart"
              >
                <path
                  d="M0 176 L42 158 L78 168 L119 125 L158 136 L196 88 L238 105 L280 66 L325 94 L370 44 L410 61 L454 31 L498 58 L542 20 L620 38"
                  fill="none"
                  stroke="#3c9cff"
                  strokeWidth="5"
                />
              </svg>
            </div>

            <div className="home-terminal-table">
              <span>ASSET</span>
              <span>PRICE</span>
              <span>CHANGE</span>

              <strong>BTC/USD</strong>
              <strong>$78,420</strong>
              <strong className="home-market-positive">
                +2.84%
              </strong>

              <strong>ETH/USD</strong>
              <strong>$4,185</strong>
              <strong className="home-market-positive">
                +1.92%
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="home-services-section" id="services">
        <div className="home-container">
          <div className="home-section-heading home-centered-heading">
            <span>What we provide</span>

            <h2>
              Our investment
              <em> services.</em>
            </h2>

            <p>
              A selection of strategies designed to give investors
              access to different markets and investment durations.
            </p>
          </div>

          <div className="home-services-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article key={service.title}>
                  <div className="home-service-icon">
                    <Icon size={24} />
                  </div>

                  <h3>{service.title}</h3>
                  <p>{service.description}</p>

                  <Link href="/register">
                    Learn more
                    <ArrowRight size={15} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-hallmarks-section">
        <div className="home-container">
          <div className="home-section-heading home-centered-heading">
            <span>Why choose NovaVest</span>

            <h2>
              The hallmarks of a
              <em> modern platform.</em>
            </h2>

            <p>
              Everything you need to manage investment activity with
              greater clarity.
            </p>
          </div>

          <div className="home-hallmarks-grid">
            {hallmarks.map((hallmark) => {
              const Icon = hallmark.icon;

              return (
                <article key={hallmark.title}>
                  <Icon size={25} />

                  <div>
                    <h3>{hallmark.title}</h3>
                    <p>{hallmark.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-plans-section" id="plans">
        <div className="home-container home-plans-layout">
          <div className="home-plans-preview">
            <div className="home-plan-preview-heading">
              <span>Investment plans</span>
              <span>Duration</span>
              <span>Target</span>
            </div>

            <div>
              <strong>Digital Asset Growth</strong>
              <span>30 days</span>
              <span>Flexible</span>
            </div>

            <div>
              <strong>Real Estate Portfolio</strong>
              <span>180 days</span>
              <span>Long-term</span>
            </div>

            <div>
              <strong>Balanced Market Strategy</strong>
              <span>90 days</span>
              <span>Moderate</span>
            </div>
          </div>

          <div className="home-section-heading home-dark-heading">
            <span>Start today</span>

            <h2>
              Ready to build
              <em> your portfolio?</em>
            </h2>

            <p>
              Create your NovaVest account, fund your balance and
              choose from available investment strategies.
            </p>

            <div className="home-hero-actions">
              <Link href="/register" className="home-primary-button">
                Create free account
                <ArrowRight size={18} />
              </Link>

              <a href="#plans" className="home-secondary-button">
                Explore plans
              </a>
            </div>

            <small className="home-plan-security">
              <LockKeyhole size={15} />
              Secure registration and protected account access
            </small>
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <div className="home-container">
          <span>Begin your investment journey</span>

          <h2>
            Build your future with
            <em> {brand.name}.</em>
          </h2>

          <p>
            Open your account and manage your complete investment
            experience from one platform.
          </p>

          <div className="home-hero-actions">
            <Link href="/register" className="home-primary-button">
              Get started
              <ArrowRight size={18} />
            </Link>

            <Link href="/login" className="home-secondary-button">
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-container home-footer-grid">
          <div>
            <Link href="/" className="home-brand">
              <span className="home-brand-mark">
                {brand.shortName || "NV"}
              </span>

              <span>{brand.name}</span>
            </Link>

            <p>
              A modern platform for portfolio management and
              investment strategies.
            </p>
          </div>

          <div>
            <strong>Company</strong>
            <a href="#about">About us</a>
            <a href="#services">Our services</a>
            <a href="#properties">Real estate</a>
            <a href="#markets">Markets</a>
          </div>

          <div>
            <strong>Platform</strong>
            <Link href="/register">Create account</Link>
            <Link href="/login">Log in</Link>
            <a href="#plans">Investment plans</a>
            <a href="#markets">Market insights</a>
          </div>

          <div>
            <strong>Account</strong>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/deposit">Deposit</Link>
            <Link href="/dashboard/investments">Investments</Link>
            <Link href="/dashboard/withdraw">Withdrawals</Link>
          </div>
        </div>

        <div className="home-container home-footer-bottom">
          <span>© 2026 {brand.name}. All rights reserved.</span>

          <span>Privacy Policy · Terms and Conditions</span>
        </div>
      </footer>
    </main>
  );
}
