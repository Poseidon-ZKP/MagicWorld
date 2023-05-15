import { useMemo } from 'react';
import { useNetwork, useSigner } from 'wagmi';
import { config } from '../config';
import { HiloGame__factory } from '../contracts/interface';

export const useContracts = () => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const contracts = useMemo(() => {
    if (!signer || !chain) return {};
    const curChainConfig = config[chain?.id];
    const hilo = HiloGame__factory.connect(curChainConfig.HILO, signer);
    const shuffle = HiloGame__factory.connect(curChainConfig.SHUFFLE, signer);
    return {
      hilo,
      shuffle,
    };
  }, [signer, chain]);
  return {
    ...contracts,
    // hilo,
    // shuffle,
  };
};
