import CryptoWallet from "@/models/CryptoWallet";

const defaultWallets = [
  {
    key: "BTC",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Testnet",
    address: "DEMO_BTC_TESTNET_ADDRESS",
    enabled: true,
    sortOrder: 1,
  },
  {
    key: "ETH",
    name: "Ethereum",
    symbol: "ETH",
    network: "Ethereum Sepolia",
    address: "DEMO_ETH_SEPOLIA_ADDRESS",
    enabled: true,
    sortOrder: 2,
  },
  {
    key: "USDT_TRC20",
    name: "Tether",
    symbol: "USDT",
    network: "TRON Nile Testnet",
    address: "DEMO_USDT_TRC20_ADDRESS",
    enabled: true,
    sortOrder: 3,
  },
  {
    key: "USDT_ERC20",
    name: "Tether",
    symbol: "USDT",
    network: "Ethereum Sepolia",
    address: "DEMO_USDT_ERC20_ADDRESS",
    enabled: true,
    sortOrder: 4,
  },
  {
    key: "USDC",
    name: "USD Coin",
    symbol: "USDC",
    network: "Ethereum Sepolia",
    address: "DEMO_USDC_TESTNET_ADDRESS",
    enabled: true,
    sortOrder: 5,
  },
  {
    key: "BNB",
    name: "BNB",
    symbol: "BNB",
    network: "BNB Chain Testnet",
    address: "DEMO_BNB_TESTNET_ADDRESS",
    enabled: true,
    sortOrder: 6,
  },
  {
    key: "SOL",
    name: "Solana",
    symbol: "SOL",
    network: "Solana Devnet",
    address: "DEMO_SOLANA_DEVNET_ADDRESS",
    enabled: true,
    sortOrder: 7,
  },
];

export async function ensureDefaultWallets() {
  await CryptoWallet.bulkWrite(
    defaultWallets.map((wallet) => ({
      updateOne: {
        filter: {
          key: wallet.key,
        },
        update: {
          $setOnInsert: wallet,
        },
        upsert: true,
      },
    })),
  );
}
