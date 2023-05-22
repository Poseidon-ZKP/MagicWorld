import { use, useContext, useEffect, useMemo, useState } from 'react';
import { useContracts } from './useContracts';
import useEvent, { PULL_DATA_TIME } from './useEvent';
import { useBlockNumber, useNetwork, useProvider } from 'wagmi';
import { config } from '../config';
import { ZKShuffleContext } from '../contexts/ZKShuffle';
import { shuffle } from '@poseidon-zkp/poseidon-zk-proof/dist/src/shuffle/proof';
import { GameTurn } from '../utils/shuffle/zkShuffle';
import { list } from '../components/Card';
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
  DRAWED,
}
export enum Turn {
  Creator,
  Joiner,
}

export const BLOCK_INTERVAL = 150;

function useGame(creator: string, joiner: string, address: string) {
  const { hs } = useContracts();
  const provider = useProvider();
  const [gameStatus, setGameStatus] = useState<IGameStatus>(
    IGameStatus.WAIT_START
  );
  const [creatorShuffleStatus, setCreatorShuffleStatus] = useState<GameTurn>(
    GameTurn.NOP
  );
  const [joinerShuffleStatus, setJoinerShuffleStatus] = useState<GameTurn>(
    GameTurn.NOP
  );
  const [turn, setTurn] = useState<Turn>();

  const [creatorList, setCreatorList] = useState(list);
  const [joinerList, setJoinerList] = useState(list);

  const { zkShuffle } = useContext(ZKShuffleContext);

  const createGameListener = useEvent({
    contract: hs,
    filter: hs?.filters?.CreateGame(null, null, null),
    isStop: gameStatus !== IGameStatus.WAIT_START,
    // isStop: true,
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
    // isStop: true,
    addressIndex: 2,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  const nextPlayerListener = useEvent({
    contract: hs,
    filter: hs?.filters?.NextPlayer(null, null, null),
    isStop: gameStatus !== IGameStatus.JOINED,
    // isStop: true,
    addressIndex: 1,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  const chooseCardGameListener = useEvent({
    contract: hs,
    filter: hs?.filters?.ChooseCard(null, null, null, null),
    // isStop: gameStatus !== IGameStatus.CREATED,
    isStop: true,
    addressIndex: 1,
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

  const joinerButtonStatus = useMemo(() => {
    const creatorCreatorToShuffle =
      creatorShuffleStatus === GameTurn.NOP &&
      joinerShuffleStatus === GameTurn.Shuffle;
    const joinerCreatorToShuffle =
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.Shuffle;
    const joinerJoinerToShuffle =
      creatorShuffleStatus === GameTurn.Deal &&
      joinerShuffleStatus === GameTurn.Shuffle;
    const creatorJoinerToShuffle =
      creatorShuffleStatus === GameTurn.Deal &&
      joinerShuffleStatus === GameTurn.Shuffle;

    return {
      creatorCreatorToShuffle,
      joinerCreatorToShuffle,
      joinerJoinerToShuffle,
      creatorJoinerToShuffle,
    };
  }, [creatorShuffleStatus, joinerShuffleStatus]);

  const creatorButtonStatus = useMemo(() => {
    const creatorCreatorToShuffle =
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.NOP;
    const joinerCreatorToShuffle =
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.NOP;
    const joinerJoinerToShuffle =
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.NOP;
    const creatorJoinerToShuffle =
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.Shuffle;
    return {
      creatorCreatorToShuffle,
      joinerCreatorToShuffle,
      joinerJoinerToShuffle,
      creatorJoinerToShuffle,
    };
  }, [creatorShuffleStatus, joinerShuffleStatus]);

  const handleOpenCard = async (index: number) => {
    try {
      const chooseCard = await hs?.chooseCard(hsId, 0, index);
    } catch (error) {}
  };

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

  useEffect(() => {
    if (nextPlayerListener?.creator) {
      setTurn(Turn.Creator);
      // setGameStatus(IGameStatus.DRAWED);
    }
    if (nextPlayerListener?.joiner) {
      setTurn(Turn.Joiner);
      // setGameStatus(IGameStatus.DRAWED);
    }
    if (nextPlayerListener?.creator && nextPlayerListener?.joiner) {
      setGameStatus(IGameStatus.DRAWED);
    }
  }, [nextPlayerListener?.creator, nextPlayerListener?.joiner]);
  console.log('nextPlayerListener', nextPlayerListener);
  useEffect(() => {
    if (chooseCardGameListener?.creator) {
      const cardIndex = chooseCardGameListener?.creator?.[3]?.toString();
      creatorList[cardIndex].isChoose = true;
      setCreatorList([...creatorList]);
    }
    if (chooseCardGameListener?.joiner) {
      const cardIndex = chooseCardGameListener?.joiner?.[3]?.toString();
      joinerList[cardIndex].isChoose = true;
      setJoinerList([...joinerList]);
    }
  }, [chooseCardGameListener?.creator, chooseCardGameListener?.joiner]);

  // get game status
  useEffect(() => {
    if (creatorShuffleId) {
      setInterval(async () => {
        // console.log('blockNumber', blockNumber);
        const startBlock = (await provider.getBlockNumber()) - BLOCK_INTERVAL;

        const res = await zkShuffle.checkTurn(creatorShuffleId, startBlock);
        if (res !== GameTurn.NOP) {
          console.log('creator checkTurn', res, creatorShuffleId, startBlock);
          setCreatorShuffleStatus(res);
        }
      }, PULL_DATA_TIME);
    }
  }, [creatorShuffleId]);

  useEffect(() => {
    if (joinerShuffleId) {
      setInterval(async () => {
        const startBlock = (await provider.getBlockNumber()) - BLOCK_INTERVAL;
        const res = await zkShuffle.checkTurn(joinerShuffleId, startBlock);

        if (res !== GameTurn.NOP) {
          console.log('joiner checkTurn', res, joinerShuffleId, startBlock);
          setJoinerShuffleStatus(res);
        }
      }, PULL_DATA_TIME);
    }
  }, [joinerShuffleId]);

  useEffect(() => {
    // if (
    //   creatorShuffleStatus === GameTurn.Shuffle &&
    //   joinerShuffleStatus === GameTurn.NOP
    // ) {
    //   setGameStatus(IGameStatus.CREATOR_SHUFFLE_JOINED);
    // }
    // if (
    //   creatorShuffleStatus === GameTurn.Shuffle &&
    //   joinerShuffleStatus === GameTurn.Shuffle
    // ) {
    //   setGameStatus(IGameStatus.JOINER_SHUFFLE_JOINED);
    // }
    // if (
    //   creatorShuffleStatus === GameTurn.Deal &&
    //   joinerShuffleStatus === GameTurn.Shuffle
    // ) {
    //   setGameStatus(IGameStatus.CREATOR_SHUFFLE_SHUFFLED);
    // }
    // if (
    //   creatorShuffleStatus === GameTurn.Deal &&
    //   joinerShuffleStatus === GameTurn.Deal
    // ) {
    //   setGameStatus(IGameStatus.JOINER_SHUFFLE_SHUFFLED);
    // }
  }, [joinerShuffleStatus, creatorShuffleStatus]);

  console.log('turn ', turn);
  console.log('gameStatus', gameStatus);
  return {
    hsId,
    turn,
    creatorShuffleId,
    joinerShuffleId,
    gameStatus,
    createGameListener,
    creatorList,
    joinerList,
  };
}

export default useGame;
