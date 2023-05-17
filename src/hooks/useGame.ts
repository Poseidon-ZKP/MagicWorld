import { ShuffleContext } from './../utils/sdk/context';
import { useEffect, useState } from 'react';
import { useContracts } from './useContracts';
import useEvent from './useEvent';
import { useNetwork, useSigner } from 'wagmi';

import { config } from '../config';

// export interface UseGame {
//   creator: string;
//   joiner: string;
// }

export enum IGameStatus {
  WAIT_START,
  CREATED,
  JOINED,
}

function useGame(creator: string, joiner: string, address: string) {
  const { hilo, shuffle } = useContracts();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const [gameStatus, setGameStatus] = useState<IGameStatus>(
    IGameStatus.WAIT_START
  );
  const createGameListener = useEvent({
    contract: hilo,
    filter: hilo?.filters?.CreateGame(null, null, null),
    isStop: true,
    addressIndex: 2,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  const curChainConfig = config[chain?.id];
  const hiloId = createGameListener?.creator?.[0]?.toString();
  const shuffleId = createGameListener?.creator?.[1]?.toString();

  useEffect(() => {
    if (createGameListener?.creator) {
      setGameStatus(IGameStatus.CREATED);
    }
  }, [createGameListener?.creator]);

  useEffect(() => {
    if (!signer || !shuffle) return;
    console.log('resource');
    const shuffleContext = new ShuffleContext(curChainConfig.SHUFFLE, signer);
    console.log('shuffleContext', shuffleContext);
    shuffleContext.init();
    return () => {};
  }, [signer, shuffle]);

  console.log('hiloId', shuffleId, hiloId);
  return { hiloId, shuffleId, gameStatus, createGameListener };
}

export default useGame;
