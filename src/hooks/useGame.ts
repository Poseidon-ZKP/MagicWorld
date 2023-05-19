import { useEffect, useState } from 'react';
import { useContracts } from './useContracts';
import useEvent from './useEvent';
import { useNetwork } from 'wagmi';
import { config } from '../config';
import useZkShuffle from './useZkShuffle';

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
  const { hilo } = useContracts();

  const [gameStatus, setGameStatus] = useState<IGameStatus>(
    IGameStatus.WAIT_START
  );
  const [hiloId, setHiloId] = useState();
  const [shuffleId, setShuffleId] = useState();
  const createGameListener = useEvent({
    contract: hilo,
    filter: hilo?.filters?.CreateGame(null, null, null),
    isStop: false,
    addressIndex: 2,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  // const hiloId = createGameListener?.creator?.[0]?.toString();
  // const shuffleId = createGameListener?.creator?.[1]?.toString();
  // console.log('shuffleId', shuffleId);

  useEffect(() => {
    console.log(window);
  }, []);

  useEffect(() => {
    if (createGameListener?.creator) {
      const hiloId = createGameListener?.creator?.[0]?.toString();
      const shuffleId = createGameListener?.creator?.[1]?.toString();
      setGameStatus(IGameStatus.CREATED);
      setHiloId(hiloId);
      setShuffleId(shuffleId);
    }
  }, [createGameListener?.creator]);

  return { hiloId, shuffleId, gameStatus, createGameListener };
}

export default useGame;
