import { Chain } from "wagmi";

export const HarmanyTestnet: Chain = {
  id: 1666700000,
  name: "Harmony Testnet",
  network: "harmony",
  nativeCurrency: {
    name: "ONE",
    symbol: "ONE",
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ["https://api.s0.b.hmny.io"],
    },
    default: {
      http: ["https://api.s0.b.hmny.io"],
    },
  },
  blockExplorers: {
    etherscan: { name: "Harmony", url: "https://explorer.pops.one" },
    default: { name: "Harmony", url: "https://explorer.pops.one" },
  },

  testnet: true,
};

export const mantaTest: Chain = {
  id: 3441005,
  name: "manta-testnet",
  network: "manta",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ["https://manta-testnet.calderachain.xyz/http"],
    },
    default: {
      http: ["https://manta-testnet.calderachain.xyz/http"],
    },
  },

  testnet: true,
};

export const supChains = {
  HarmanyTestnet,
  mantaTest,
};
