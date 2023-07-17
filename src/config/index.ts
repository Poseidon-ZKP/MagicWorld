// import { arbitrumGoerli } from 'wagmi/dist/chains';
import { arbitrumGoerli } from "wagmi/chains";
import { mantaTest } from "./chains";

export const config = {
  [arbitrumGoerli.id]: {
    SHUFFLE: "0xc7DBe0744c1ADB37Fd74904639AD9d20294f449a",
    HILO: "0xbF97898A0e5d41B7cd8DA85769997D76a31f6964",
    KS: "0x7A0959d2196258855e6AE4a7F8fCD432C474e270",
  },
  [mantaTest.id]: {
    SHUFFLE: "0x8F8a52Ee35A15F29c789b7a635aA78bC10628B87",
    HILO: "",
    KS: "0x308d4d5d797D5120A2a6B89899abDCe475A8c33D",
  },
};
