import { useMemo } from 'react';
import { useContract, useNetwork, useProvider, useSigner } from 'wagmi';
import { config } from '../config';
import {
  HiloGame__factory,
  ShuffleManager__factory,
} from '../contracts/interface';

export const useContracts = () => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const curChainConfig = config[chain?.id];
  const hilo = useContract({
    address: curChainConfig?.HILO,
    abi: HiloGame__factory.abi,
    signerOrProvider: signer,
  });
  const shuffle = useContract({
    address: curChainConfig?.SHUFFLE,
    abi: ShuffleManager__factory.abi,
    signerOrProvider: signer,
  });

  return {
    // ...contracts,
    curChainConfig,
    hilo,
    shuffle,
  };
};
