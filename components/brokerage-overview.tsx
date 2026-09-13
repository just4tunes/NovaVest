"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, TrendingDown, TrendingUp } from "lucide-react";

type BrokerageOverviewProps = {
  depositBalance: number;
  profitBalance: number;
  investmentBalance: number;
};

const marketChartData = [
  { month: "Jan", market: 62 },
  { month: "Feb", market: 65 },
  { month: "Mar", market: 61 },
  { month: "Apr", market: 69 },
  { month: "May", market: 73 },
  { month: "Jun", market: 71 },
  { month: "Jul", market: 78 },
  { month: "Aug", market: 82 },
  { month: "Sep", market: 87 },
  { month: "Oct", market: 84 },
  { month: "Nov", market: 91 },
  { month: "Dec", market: 96 },
];

const assetPerformance = [
  { name: "BTC", change: 8.4 },
  { name: "ETH", change: 5.8 },
  { name: "S&P", change: 3.2 },
  { name: "Gold", change: 2.4 },
  { name: "SOL", change: 6.7 },
];

const watchlist = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: "$78,420.00",
    change: "+2.84%",
    positive: true,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    price: "$4,185.40",
    change: "+1.92%",
    positive: true,
  },
  {
    name: "S&P 500",
    symbol: "SPX",
    price: "6,412.08",
    change: "-0.37%",
    positive: false,
  },
  {
    name: "Gold",
    symbol: "XAU",
    price: "$2,685.20",
    change: "+0.74%",
    positive: true,
  },
];

const chartColours = ["#1f715c", "#72d6ad", "#d7a84b"];

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function BrokerageOverview({
  depositBalance,
  profitBalance,
  investmentBalance,
}: BrokerageOverviewProps) {
  const portfolioData = [
    {
      name: "Deposit balance",
      value: depositBalance,
    },
    {
      name: "Profit balance",
      value: profitBalance,
    },
    {
      name: "Active investments",
      value: investmentBalance,
    },
  ];

  const hasPortfolio = depositBalance + profitBalance + investmentBalance > 0;

  return (
    <section className="brokerage-section">
      <div className="brokerage-section-heading">
        <div>
          <span className="panel-eyebrow">Brokerage overview</span>

          <h2>Markets and portfolio</h2>

          <p>Simulated market information for educational purposes.</p>
        </div>

        <span className="simulated-market-badge">Demo market</span>
      </div>

      <div className="brokerage-market-grid">
        <article className="dashboard-panel market-chart-panel">
          <div className="market-panel-heading">
            <div>
              <span>Market index</span>
              <strong>96.40</strong>
              <small className="market-positive">
                <TrendingUp size={15} />
                +12.6% this year
              </small>
            </div>

            <BarChart3 size={22} />
          </div>

          <div className="brokerage-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={marketChartData}
                margin={{
                  top: 15,
                  right: 10,
                  left: -25,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="marketGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#1f715c" stopOpacity={0.36} />

                    <stop offset="95%" stopColor="#1f715c" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#dce8e3"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />

                <YAxis tickLine={false} axisLine={false} fontSize={12} />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #dce8e3",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="market"
                  stroke="#1f715c"
                  strokeWidth={3}
                  fill="url(#marketGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel watchlist-panel">
          <div className="market-panel-heading">
            <div>
              <span>Market watchlist</span>
              <strong>Top assets</strong>
            </div>

            <Activity size={22} />
          </div>

          <div className="market-watchlist">
            {watchlist.map((asset) => (
              <div className="market-watchlist-row" key={asset.symbol}>
                <span className="market-symbol">
                  {asset.symbol.slice(0, 2)}
                </span>

                <span>
                  <strong>{asset.name}</strong>
                  <small>{asset.symbol}</small>
                </span>

                <span className="market-price">
                  <strong>{asset.price}</strong>

                  <small
                    className={
                      asset.positive ? "market-positive" : "market-negative"
                    }
                  >
                    {asset.positive ? (
                      <TrendingUp size={13} />
                    ) : (
                      <TrendingDown size={13} />
                    )}

                    {asset.change}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel allocation-panel">
          <div className="market-panel-heading">
            <div>
              <span>Your account</span>
              <strong>Portfolio mix</strong>
            </div>
          </div>

          {hasPortfolio ? (
            <>
              <div className="allocation-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={4}
                    >
                      {portfolioData.map((item, index) => (
                        <Cell key={item.name} fill={chartColours[index]} />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => formatMoney(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="allocation-legend">
                <span>
                  <i className="allocation-deposit" />
                  Deposit
                  <strong>{formatMoney(depositBalance)}</strong>
                </span>

                <span>
                  <i className="allocation-profit" />
                  Profit
                  <strong>{formatMoney(profitBalance)}</strong>
                </span>

                <span>
                  <i className="allocation-investment" />
                  Invested
                  <strong>{formatMoney(investmentBalance)}</strong>
                </span>
              </div>
            </>
          ) : (
            <div className="chart-empty">No portfolio activity yet</div>
          )}
        </article>

        <article className="dashboard-panel asset-performance-panel">
          <div className="market-panel-heading">
            <div>
              <span>Market movement</span>
              <strong>Simulated performance</strong>
            </div>
          </div>

          <div className="asset-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={assetPerformance}
                margin={{
                  top: 10,
                  right: 5,
                  left: -25,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#dce8e3"
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />

                <YAxis tickLine={false} axisLine={false} fontSize={12} />

                <Tooltip />

                <Bar dataKey="change" fill="#1f715c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}
