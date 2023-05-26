import { useContext, useEffect, useState } from 'react';
import { useContracts } from './useContracts';
import useEvent, { PULL_DATA_TIME } from './useEvent';
import { useProvider } from 'wagmi';
import { ZKShuffleContext } from '../contexts/ZKShuffle';
import { GameTurn } from '../utils/shuffle/zkShuffle';
import { useWrites } from './useWrites';

export enum IGameStatus {
  WAIT_START,
  CREATED,
  JOINED,
  SHUFFLED,
  DRAWED,
  GUESSED,
  OPENED,
}
export enum Turn {
  Creator,
  Joiner,
}

export const BLOCK_INTERVAL = 150;

function useGame(creator: string, joiner: string, address: string) {
  const { hilo } = useContracts();
  const provider = useProvider();
  const [gameStatus, setGameStatus] = useState<IGameStatus>(
    IGameStatus.WAIT_START
  );
  const [creatorShuffleStatus, setCreatorShuffleStatus] = useState<GameTurn>(
    GameTurn.NOP
  );

  const [winner, setWinner] = useState<any>();
  const { zkShuffle } = useContext(ZKShuffleContext);

  const {
    createGameStatus,
    joinGameStatus,
    drawStatus,
    shuffleStatus,
    openStatus,
  } = useWrites();

  const createGameListener = useEvent({
    contract: hilo,
    filter: hilo?.filters?.CreateGame(null, null, null),
    isStop: gameStatus !== IGameStatus.WAIT_START,
    // isStop: true,
    addressIndex: 2,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  const guessListener = useEvent({
    contract: hilo,
    filter: hilo?.filters?.Guess(null, null, null, null),
    // isStop: gameStatus !== IGameStatus.WAIT_START,
    isStop: true,
    addressIndex: 2,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  const endGameListener = useEvent({
    contract: hilo,
    filter: hilo?.filters?.EndGame(null, null, null, null),

    isStop: true,
    addressIndex: 2,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  const hiloId = createGameListener?.creator?.[0]?.toString();
  const shuffleId = createGameListener?.creator?.[1]?.toString();

  useEffect(() => {
    if (createGameListener?.creator) {
      setGameStatus(IGameStatus.CREATED);
    }
  }, [createGameListener?.creator]);

  useEffect(() => {
    if (guessListener?.creator) {
      // setGameStatus(IGameStatus.CREATED);
    }
  }, [guessListener?.creator]);

  useEffect(() => {
    if (endGameListener.creator) {
      setWinner(endGameListener.creator);
    }
    if (endGameListener.joiner) {
      setWinner(endGameListener.joiner);
    }
    return () => {};
  }, [endGameListener]);

  // get game status
  useEffect(() => {
    if (shuffleId) {
      setInterval(async () => {
        // console.log('blockNumber', blockNumber);
        const startBlock = (await provider.getBlockNumber()) - BLOCK_INTERVAL;
        const res = await zkShuffle.checkTurn(shuffleId, startBlock);
        console.log('first deck checkTurn', res);
        if (res !== GameTurn.NOP) {
          setCreatorShuffleStatus(res);
        }
      }, PULL_DATA_TIME);
    }
  }, [shuffleId]);

  console.log('creatorShuffleStatus', creatorShuffleStatus);
  // useEffect(() => {
  //   if (creatorShuffleStatus) {
  //     if (creatorShuffleStatus === GameTurn.Shuffle) {
  //       set
  //     }
  //   }
  // }, [creatorShuffleStatus]);

  return {
    hiloId,

    shuffleId,
    gameStatus,
    createGameListener,
    createGameStatus,
    joinGameStatus,
    drawStatus,
    shuffleStatus,
    openStatus,
    winner,
  };
}

export default useGame;
