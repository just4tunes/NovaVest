export const investmentPlans = [
  {
    key: "starter-growth",
    name: "Starter Growth",
    category: "Crypto portfolio",
    minimumAmount: 500,
    durationDays: 30,
    targetRate: 8,
    riskLevel: "Moderate",
    description:
      "A simulated starter portfolio spread across major digital assets.",
  },
  {
    key: "balanced-investor",
    name: "Balanced Investor",
    category: "Mixed assets",
    minimumAmount: 2500,
    durationDays: 90,
    targetRate: 15,
    riskLevel: "Balanced",
    description:
      "A simulated combination of crypto, stocks, indexes and cash positions.",
  },
  {
    key: "real-estate-growth",
    name: "Real Estate Growth",
    category: "Property portfolio",
    minimumAmount: 10000,
    durationDays: 180,
    targetRate: 20,
    riskLevel: "Moderate",
    description:
      "A simulated portfolio based on commercial and residential property markets.",
  },
  {
    key: "elite-markets",
    name: "Elite Markets",
    category: "Global markets",
    minimumAmount: 30000,
    durationDays: 365,
    targetRate: 28,
    riskLevel: "High",
    description:
      "A simulated long-term portfolio covering stocks, digital assets and commodities.",
  },
] as const;

export type InvestmentPlanKey =
  (typeof investmentPlans)[number]["key"];

export function findInvestmentPlan(
  key: string
) {
  return investmentPlans.find(
    (plan) => plan.key === key
  );
}