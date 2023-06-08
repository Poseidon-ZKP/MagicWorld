import { PropsWithChildren } from "react";
import { publicProvider } from "wagmi/providers/public";
import { arbitrumGoerli } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export const chainsParams = [arbitrumGoerli];

const { chains, provider } = configureChains(chainsParams, [
  jsonRpcProvider({
    rpc: () => ({
      http: `https://endpoints.omniatech.io/v1/arbitrum/goerli/public`,
    }),
  }),
  publicProvider(),
]);

export const connectors = [
  new InjectedConnector({
    chains: chains,
  }),
];

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#7b3fe4",
          accentColorForeground: "#DABEF1",
          borderRadius: "small",
          fontStack: "system",
          overlayBlur: "small",
        })}
        chains={chains}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WalletProvider;
