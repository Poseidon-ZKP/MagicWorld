import { useContext, useEffect, useMemo, useState } from "react";
import cloneDeep from "lodash/cloneDeep";
import { useProvider } from "wagmi";

import { useContracts } from "./useContracts";
import { UnwrapPromise, ZKShuffleContext } from "../contexts/ZKShuffle";
import useEvent, { PULL_DATA_TIME } from "./useEvent";
import { GameTurn } from "../utils/shuffle/zkShuffle";
import { initList, list } from "../components/Card";
import { useWrites } from "./useWrites";

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

  const [gameInfo, setGameInfo] =
    useState<UnwrapPromise<ReturnType<typeof hs.getGameInfo>>>();

  const [creatorList, setCreatorList] = useState(cloneDeep(list));
  const [joinerList, setJoinerList] = useState(cloneDeep(list));
  const [winner, setWinner] = useState<string>();
  const { zkShuffle } = useContext(ZKShuffleContext);

  const {
    createGameStatus,
    joinGameStatus,
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
    addressIndex: 2,
    others: {
      creator: creator,
      joiner: joiner,
    },
  });
  console.log("gameStatus", gameStatus);
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

  const dealEndListener = useEvent({
    contract: hs,
    filter: hs?.filters?.DealEnd(null, null, null),
    isStop: gameStatus !== IGameStatus.JOINED,
    addressIndex: 1,
    others: {
      creator: creator,
      joiner: joiner,
    },
  });

  const chooseCardGameListener = useEvent({
    contract: hs,
    filter: hs?.filters?.ChooseCard(null, null, null, null),
    isStop:
      gameStatus !== IGameStatus.DRAWED &&
      gameStatus !== IGameStatus.CREATOR_OPENED,
    addressIndex: 1,
    others: {
      creator: creator,
      joiner: joiner,
    },
  });

  const openCardListener = useEvent({
    contract: hs,
    filter: hs?.filters?.OpenCard(null, null, null, null, null),
    isStop:
      gameStatus !== IGameStatus.CREATOR_CHOOSED &&
      gameStatus !== IGameStatus.JOINER_CHOOSED,
    addressIndex: 1,
    others: {
      creator: creator,
      joiner: joiner,
    },
  });

  const endGameListener = useEvent({
    contract: hs,
    filter: hs?.filters?.EndGame(null, null, null),
    isStop:
      gameStatus !== IGameStatus.CREATOR_OPENED &&
      gameStatus !== IGameStatus.CREATOR_CHOOSED &&
      gameStatus !== IGameStatus.JOINER_CHOOSED &&
      gameStatus !== IGameStatus.JOINER_OPENED &&
      gameStatus !== IGameStatus.DRAWED,
    addressIndex: 1,
    others: {
      creator: creator,
      joiner: joiner,
    },
  });

  const hsId = createGameListener?.creator?.[0]?.toString();
  const creatorShuffleId = createGameListener?.creator?.[1]?.toString();
  const joinerShuffleId = joinGameListener?.joiner?.[1]?.toString();
  const isCreator = address === creator;
  const openShuffleId = isCreator ? creatorShuffleId : joinerShuffleId;

  const joinerButtonStatus = useMemo(() => {
    const joinerCreatorToShuffle =
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.Shuffle;
    const joinerJoinerToShuffle = joinerShuffleStatus === GameTurn.Shuffle;
    const joinerToDraw = creatorShuffleStatus === GameTurn.Deal;
    return {
      joinerCreatorToShuffle,
      joinerJoinerToShuffle,
      joinerToDraw,
    };
  }, [creatorShuffleStatus, joinerShuffleStatus]);

  const creatorButtonStatus = useMemo(() => {
    const creatorCreatorToShuffle = creatorShuffleStatus === GameTurn.Shuffle;
    const creatorJoinerToShuffle =
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.Shuffle;
    const creatorToDraw =
      creatorShuffleStatus === GameTurn.Shuffle &&
      joinerShuffleStatus === GameTurn.Deal;
    return {
      creatorCreatorToShuffle,
      creatorJoinerToShuffle,
      creatorToDraw,
    };
  }, [creatorShuffleStatus, joinerShuffleStatus]);

  const getGameInfo = async () => {
    try {
      const res = await hs?.getGameInfo(hsId);
      setGameInfo(res);
    } catch (error) {
      console.log("error", error);
    }
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

  const getUserCards = async () => {
    let userCards = [];
    do {
      userCards = await zkShuffle.openOffchain(
        openShuffleId,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      );
    } while (userCards.includes(-1));
    return userCards;
  };

  useEffect(() => {
    const handleGetInfos = async () => {
      try {
        await getGameInfo();
        const userCards = await getUserCards();

        isCreator
          ? setCreatorList(initList(userCards, true))
          : setJoinerList(initList(userCards, true));
        setGameStatus(IGameStatus.DRAWED);
      } catch (error) {
        console.log(error);
      }
    };
    if (dealEndListener?.creator && dealEndListener?.joiner) {
      handleGetInfos();
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
    return () => {};
  }, [nextPlayerListener?.creator, nextPlayerListener?.joiner]);

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
      getGameInfo();
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
      getGameInfo();
      setGameStatus(IGameStatus.DRAWED);
      setJoinerList([...joinerList]);
    }
  }, [openCardListener?.joiner]);

  useEffect(() => {
    if (openCardListener?.creator && openCardListener?.joiner) {
      setGameStatus(IGameStatus.DRAWED);
      openCardListener.reset();
      openStatus.reset();
    }
  }, [openCardListener?.creator, openCardListener?.joiner]);

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
    if (creatorShuffleId) {
      setInterval(async () => {
        // console.log('blockNumber', blockNumber);
        const startBlock = (await provider.getBlockNumber()) - BLOCK_INTERVAL;

        const res = await zkShuffle.checkTurn(creatorShuffleId, startBlock);
        console.log("first deck checkTurn", res);
        if (res !== GameTurn.NOP) {
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
        console.log("second deck checkTurn", res);
        if (res !== GameTurn.NOP) {
          setJoinerShuffleStatus(res);
        }
      }, PULL_DATA_TIME);
    }
  }, [joinerShuffleId]);

  useEffect(() => {
    let timer = null;
    if (
      gameStatus === IGameStatus.DRAWED ||
      gameStatus === IGameStatus.CREATOR_CHOOSED ||
      gameStatus === IGameStatus.CREATOR_OPENED ||
      gameStatus === IGameStatus.JOINER_CHOOSED ||
      gameStatus === IGameStatus.JOINER_OPENED
    ) {
      timer = setInterval(() => {
        getGameInfo();
      }, PULL_DATA_TIME);
    }
    return () => {
      timer && clearInterval(timer);
    };
  }, [gameStatus]);

  return {
    hsId,
    creatorShuffleId,
    joinerShuffleId,
    gameStatus,
    createGameListener,
    creatorList,
    joinerList,
    creatorButtonStatus,
    joinerButtonStatus,
    createGameStatus,
    joinGameStatus,
    creatorShuffleShuffleStatus,
    joinerShuffleShuffleStatus,
    batchDrawStatus,
    openStatus,
    chooseCardStatus,
    gameInfo,
    winner,
  };
}

export default useGame;
