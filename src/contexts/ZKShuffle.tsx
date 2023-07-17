import { ReactNode, createContext, useEffect, useState } from "react";
// import useSigner from '../hooks/useSigner';
import { ZKShuffle } from "../utils/shuffle/zkShuffle";
import { useSigner } from "wagmi";
import { set, get, clear } from "idb-keyval";

import { dnld_crypto_files } from "../utils/shuffle/utility";
import { useContracts } from "../hooks/useContracts";

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : never;

export interface IZKShuffleContext {
  zkShuffle: ZKShuffle;
  isLoaded: boolean;
  getCacheData: (cardNumber: number) => Promise<void>;
  clearCache: () => void;
}

export const ZKShuffleContext = createContext<IZKShuffleContext>(null);

export function ZKShuffleProvider({ children }: { children: ReactNode }) {
  const { curChainConfig } = useContracts();
  const { data: signer } = useSigner();

  const [zkShuffle, setZkShuffle] = useState<ZKShuffle>();

  const isLoaded = !!zkShuffle;

  const cacheCryptoFiles = async (
    files: UnwrapPromise<ReturnType<typeof dnld_crypto_files>>
  ) => {
    const keys = Object.keys(files);
    const values = Object.values(files);
    keys.forEach((key, index) => {
      set(key, values[index]);
    });
  };

  const getCryptoFilesFromCache = async () => {
    const [encrypt_wasm, encrypt_zkey, decrypt_wasm, decrypt_zkey] =
      await Promise.all([
        get("encrypt_wasm"),
        get("encrypt_zkey"),
        get("decrypt_wasm"),
        get("decrypt_zkey"),
      ]);
    const isCached =
      encrypt_wasm && encrypt_zkey && decrypt_wasm && decrypt_zkey;
    return isCached
      ? { encrypt_wasm, encrypt_zkey, decrypt_wasm, decrypt_zkey }
      : null;
  };

  const clearCache = () => {
    clear();
  };

  // useEffect(() => {
  //   clear();
  // }, []);

  const getCacheData = async (cardNumber: number) => {
    try {
      const data = await getCryptoFilesFromCache();
      let res = null;
      if (!data) {
        res = await dnld_crypto_files(cardNumber);
        if (res) {
          await cacheCryptoFiles(res);
        } else {
          console.log("get crypto files error");
          return;
        }
      }
      const shuffleParams = data || res;
      let seed = await get("sk");
      seed = seed || (await ZKShuffle.generateShuffleSecret());
      const zkShuffle = await ZKShuffle.create(
        curChainConfig.SHUFFLE,
        signer,
        seed,
        shuffleParams.decrypt_wasm,
        shuffleParams.decrypt_zkey,
        shuffleParams.encrypt_wasm,
        shuffleParams.encrypt_zkey
      );

      setZkShuffle(zkShuffle);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!signer) return;
    getCacheData(30);

    return () => {};
  }, [signer]);

  return (
    <ZKShuffleContext.Provider
      value={{
        zkShuffle,
        isLoaded,
        getCacheData,
        clearCache,
      }}
    >
      {children}
    </ZKShuffleContext.Provider>
  );
}
