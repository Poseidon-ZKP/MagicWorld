import { useContract, useNetwork, useSigner } from 'wagmi';
import { config } from '../config';
import {
  MagicWorld__factory,
  ShuffleManager__factory,
} from '../contracts/interface';

export const useContracts = () => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const curChainConfig = config[chain?.id];
  const shuffle = useContract({
    address: curChainConfig?.SHUFFLE,
    abi: ShuffleManager__factory.abi,
    signerOrProvider: signer,
  });

  const mw = useContract({
    address: curChainConfig?.MagicWorld,
    abi: MagicWorld__factory.abi,
    signerOrProvider: signer,
  });

  return {
    curChainConfig,
    shuffle,
    mw,
  };
};
