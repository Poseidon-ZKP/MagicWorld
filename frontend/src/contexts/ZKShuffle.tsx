import { ReactNode, createContext, useEffect, useState } from 'react';
import { ZKShuffle } from '../utils/shuffle/zkShuffle';
import { dnld_crypto_files } from '../utils/shuffle/utility';
import { useContracts } from '../hooks/useContracts';
import { useSigner } from 'wagmi';
import { set, get, clear } from 'idb-keyval';

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : never;

export interface IZKShuffleContext {
  zkShuffle: ZKShuffle;
  isLoaded: boolean;
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
        get('encrypt_wasm'),
        get('encrypt_zkey'),
        get('decrypt_wasm'),
        get('decrypt_zkey'),
      ]);
    const isCached =
      encrypt_wasm && encrypt_zkey && decrypt_wasm && decrypt_zkey;
    return isCached
      ? { encrypt_wasm, encrypt_zkey, decrypt_wasm, decrypt_zkey }
      : null;
  };

  const cacheSk = (sk: string) => {
    set('sk', sk);
  };

  const clearCache = () => {
    clear();
  };

  // useEffect(() => {
  //   clear();
  // }, []);

  useEffect(() => {
    const getCacheData = async () => {
      try {
        const data = await getCryptoFilesFromCache();
        let res = null;
        if (!data) {
          res = await dnld_crypto_files(30);
          if (res) {
            await cacheCryptoFiles(res);
          } else {
            console.log('get crypto files error');
            return;
          }
        }
        const shuffleParams = data || res;
        let seed = await get('sk');
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
        console.log('error', error);
      }
    };
    if (!signer) return;
    getCacheData();
  }, [signer]);

  return (
    <ZKShuffleContext.Provider
      value={{
        zkShuffle,
        isLoaded,
        clearCache,
      }}
    >
      {children}
    </ZKShuffleContext.Provider>
  );

  // return {
  //   zkShuffle,
  //   cacheCryptoFiles,
  //   getCryptoFilesFromCache,
  // };
}
