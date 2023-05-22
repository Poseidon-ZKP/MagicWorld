import { useContext, useEffect, useMemo, useState } from 'react';
import { cloneDeep } from 'lodash';
import { useContracts } from './useContracts';
import useEvent, { PULL_DATA_TIME } from './useEvent';
import { useBlockNumber, useNetwork, useProvider } from 'wagmi';
import { config } from '../config';
import { ZKShuffleContext } from '../contexts/ZKShuffle';
import { shuffle } from '@poseidon-zkp/poseidon-zk-proof/dist/src/shuffle/proof';
import { GameTurn } from '../utils/shuffle/zkShuffle';
import { cardConfig, list } from '../components/Card';
import { useWrites } from './useWrites';
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
  CREATOR_CHOOSED,
  CREATOR_OPENED,
  JOINER_CHOOSED,
  JOINER_OPENED,
}
export enum Turn {
  Creator,
  Joiner,
}

// export enum PlayerIndex {
//   Creator,
//   Joiner,
// }

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

  const [creatorList, setCreatorList] = useState(cloneDeep(list));
  const [joinerList, setJoinerList] = useState(cloneDeep(list));

  const { zkShuffle } = useContext(ZKShuffleContext);

  const {
    createGameStatus,
    joinGameStatus,
    // creatorShuffleJoinStatus,
    // joinerShuffleJoinStatus,
    creatorShuffleShuffleStatus,
    joinerShuffleShuffleStatus,
    batchDrawStatus,
    openStatus,
    chooseCardStatus,
  } = useWrites();

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

  const dealEndListener = useEvent({
    contract: hs,
    filter: hs?.filters?.DealEnd(null, null, null),
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
    isStop:
      gameStatus !== IGameStatus.DRAWED &&
      gameStatus !== IGameStatus.CREATOR_OPENED,
    // isStop: true,
    addressIndex: 1,
    others: {
      creator: creator,
      joiner: joiner,
      // gameId,
    },
  });

  const openCardListener = useEvent({
    contract: hs,
    filter: hs?.filters?.OpenCard(null, null, null, null, null),
    isStop:
      gameStatus !== IGameStatus.CREATOR_CHOOSED &&
      gameStatus !== IGameStatus.JOINER_CHOOSED,
    // isStop: true,
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

  // const handleOpenCard = async (index: number) => {
  //   try {
  //     const chooseCard = await hs?.chooseCard(hsId, 0, index);
  //   } catch (error) {}
  // };

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
    if (dealEndListener?.creator && dealEndListener?.joiner) {
      setGameStatus(IGameStatus.DRAWED);
    }
  }, [dealEndListener?.creator, dealEndListener?.joiner]);

  useEffect(() => {
    if (chooseCardGameListener?.creator) {
      const cardIndex = chooseCardGameListener?.creator?.[3]?.toString();
      creatorList[cardIndex].isChoose = true;
      setGameStatus(IGameStatus.CREATOR_CHOOSED);
      setCreatorList([...creatorList]);
    }
  }, [chooseCardGameListener?.creator]);

  useEffect(() => {
    if (chooseCardGameListener?.joiner) {
      const cardIndex = chooseCardGameListener?.joiner?.[3]?.toString();
      joinerList[cardIndex].isChoose = true;
      setGameStatus(IGameStatus.JOINER_CHOOSED);
      setJoinerList([...joinerList]);
    }
  }, [chooseCardGameListener?.joiner]);

  useEffect(() => {
    if (chooseCardGameListener?.creator && chooseCardGameListener?.joiner) {
      chooseCardGameListener.reset();
    }
  }, [chooseCardGameListener?.creator, chooseCardGameListener?.joiner]);

  useEffect(() => {
    if (openCardListener?.creator) {
      const cardIndex = openCardListener?.creator?.[3]?.toString();
      const cardValue = openCardListener?.creator?.[4]?.toString();
      creatorList[cardIndex].cardValue = Math.floor(cardValue / 10);
      creatorList[cardIndex].isFlipped = true;
      setGameStatus(IGameStatus.CREATOR_OPENED);
      setCreatorList([...creatorList]);
    }
  }, [openCardListener?.creator]);

  useEffect(() => {
    if (openCardListener?.joiner) {
      const cardIndex = openCardListener?.joiner?.[3]?.toString();
      const cardValue = openCardListener?.joiner?.[4]?.toString();
      joinerList[cardIndex].cardValue = Math.floor(cardValue / 10);
      joinerList[cardIndex].isFlipped = true;
      setGameStatus(IGameStatus.JOINER_OPENED);
      setJoinerList([...joinerList]);
    }
  }, [openCardListener?.joiner]);

  useEffect(() => {
    if (openCardListener?.creator && openCardListener?.joiner) {
      openCardListener.reset();
      openStatus.reset();
      setGameStatus(IGameStatus.DRAWED);
    }
  }, [openCardListener?.creator, openCardListener?.joiner]);

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

  console.log('gameStatus', gameStatus);
  return {
    hsId,
    creatorShuffleId,
    joinerShuffleId,
    gameStatus,
    createGameListener,
    creatorList,
    joinerList,
    createGameStatus,
    joinGameStatus,

    creatorShuffleShuffleStatus,
    joinerShuffleShuffleStatus,
    batchDrawStatus,
    openStatus,
    chooseCardStatus,
  };
}

export default useGame;
