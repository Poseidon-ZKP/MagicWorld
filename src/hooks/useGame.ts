import { useEffect, useState } from 'react';
import { useContracts } from './useContracts';
import useEvent, { PULL_DATA_TIME } from './useEvent';
import { useBlockNumber, useNetwork } from 'wagmi';
import { config } from '../config';
import useZkShuffle from './useZkShuffle';
import { shuffle } from '@poseidon-zkp/poseidon-zk-proof/dist/src/shuffle/proof';
import { GameTurn } from '../utils/shuffle/zkShuffle';
// export interface UseGame {
//   creator: string;
//   joiner: string;
// }

export enum IGameStatus {
  WAIT_START,
  CREATED,
  JOINED,
  CREATOR_SHUFFLE_JOINED,
  JOINER_SHUFFLE_JOINED,
  CREATOR_SHUFFLE_SHUFFLED,
  JOINER_SHUFFLE_SHUFFLED,
}

export const BLOCK_INTERVAL = 150;

function useGame(creator: string, joiner: string, address: string) {
  const { hs } = useContracts();
  const { data: blockNumber, isError, isLoading } = useBlockNumber();
  const [gameStatus, setGameStatus] = useState<IGameStatus>(
    IGameStatus.WAIT_START
  );
  const [creatorShuffleStatus, setCreatorShuffleStatus] = useState<GameTurn>(
    GameTurn.NOP
  );
  const [joinerShuffleStatus, setJoinerShuffleStatus] = useState<GameTurn>(
    GameTurn.NOP
  );

  const { zkShuffle } = useZkShuffle();

  const createGameListener = useEvent({
    contract: hs,
    filter: hs?.filters?.CreateGame(null, null, null),
    isStop: gameStatus !== IGameStatus.WAIT_START,
    addressIndex: 2,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  const joinGameListener = useEvent({
    contract: hs,
    filter: hs?.filters?.JoinGame(null, null, null),
    isStop: gameStatus !== IGameStatus.CREATED,
    addressIndex: 2,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  // const joinGameListener = useEvent({
  //   contract: hs,
  //   filter: hs?.filters?.JoinGame(null, null, null),
  //   isStop: gameStatus !== IGameStatus.CREATED,
  //   addressIndex: 2,
  //   others: {
  //     creator: creator,
  //     joiner: joiner,
  //     // gameId,
  //   },
  // });

  const hsId = createGameListener?.creator?.[0]?.toString();
  const creatorShuffleId = createGameListener?.creator?.[1]?.toString();
  const joinerShuffleId = joinGameListener?.joiner?.[1]?.toString();

  useEffect(() => {
    if (createGameListener?.creator) {
      setGameStatus(IGameStatus.CREATED);
    }
  }, [createGameListener?.creator]);

  useEffect(() => {
    if (joinGameListener?.joiner) {
      setGameStatus(IGameStatus.JOINED);
    }
  }, [joinGameListener?.joiner]);

  // get game status
  useEffect(() => {
    if (creatorShuffleId) {
      setInterval(async () => {
        const startBlock = blockNumber - BLOCK_INTERVAL;
        const res = await zkShuffle.checkTurn(creatorShuffleId, startBlock);
        setCreatorShuffleStatus(res);
      }, PULL_DATA_TIME);
    }
  }, [creatorShuffleId]);

  useEffect(() => {
    if (joinerShuffleId) {
      setInterval(async () => {
        const startBlock = blockNumber - BLOCK_INTERVAL;
        const res = await zkShuffle.checkTurn(joinerShuffleId, startBlock);
        setJoinerShuffleStatus(res);
      }, PULL_DATA_TIME);
    }
  }, [joinerShuffleId]);

  useEffect(() => {
    if (
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.NOP
    ) {
      setGameStatus(IGameStatus.CREATOR_SHUFFLE_JOINED);
    }
    if (
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.Shuffle
    ) {
      setGameStatus(IGameStatus.JOINER_SHUFFLE_JOINED);
    }
    if (
      creatorShuffleStatus === GameTurn.Deal &&
      joinerShuffleStatus === GameTurn.Shuffle
    ) {
      setGameStatus(IGameStatus.CREATOR_SHUFFLE_SHUFFLED);
    }
    if (
      creatorShuffleStatus === GameTurn.Deal &&
      joinerShuffleStatus === GameTurn.Deal
    ) {
      setGameStatus(IGameStatus.JOINER_SHUFFLE_SHUFFLED);
    }
  }, [joinerShuffleStatus, creatorShuffleStatus]);

  return {
    hsId,
    creatorShuffleId,
    joinerShuffleId,
    gameStatus,
    createGameListener,
  };
}

export default useGame;
