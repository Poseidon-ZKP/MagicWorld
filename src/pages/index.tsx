import { useAccount, useConnect, useNetwork, useSwitchNetwork } from 'wagmi';

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { formatAddress } from '../utils/common';

import { useRouter } from 'next/router';
import { arbitrumGoerli } from 'wagmi/chains';

import StatusItem from '../components/StatusItem';
import { useWrites } from '../hooks/useWrites';
import useGame, { IGameStatus, Turn } from '../hooks/useGame';
import { ZKShuffleContext } from '../contexts/ZKShuffle';
import Button from '../components/Button';

import noAvatar from '../assets/images/noAvatar.png';
import mockUser1 from '../assets/images/mockUser1.jpg';
import mockUser2 from '../assets/images/mockUser2.jpg';

import Card, { cardConfig, list } from '../components/Card';

import styles from '../styles/Home.module.css';

export default function Home() {
  const { connect, connectors } = useConnect();

  const router = useRouter();

  const creator = router?.query?.creator as string;
  const joiner = router?.query?.joiner as string;

  const { chain } = useNetwork();
  const { address } = useAccount();

  const { zkShuffle } = useContext(ZKShuffleContext);
  const { switchNetwork } = useSwitchNetwork({
    chainId: arbitrumGoerli.id,
  });
  const {
    hsId,
    creatorShuffleId,
    creatorList,
    joinerList,
    joinerShuffleId,
    gameStatus,
    createGameStatus,
    joinGameStatus,

    creatorShuffleShuffleStatus,
    joinerShuffleShuffleStatus,
    batchDrawStatus,
    openStatus,
    chooseCardStatus,
  } = useGame(creator, joiner, address);
  const [selectCreatorCard, setSelectCreatorCard] = useState<number>();
  const [selectJoinerCard, setSelectJoinerCard] = useState<number>();

  if (!router.isReady) {
    return (
      <div className=" flex flex-col gap-10  h-screen items-center justify-center  text-2xl font-medium bg-slate-900 ">
        <div className="text-2xl font-medium">Loading resource...</div>
      </div>
    );
  }

  const isCreator = address === creator;
  const batchShuffleId = isCreator ? joinerShuffleId : creatorShuffleId;
  const openShuffleId = isCreator ? creatorShuffleId : joinerShuffleId;
  const userSelectCardIndex = isCreator ? selectCreatorCard : selectJoinerCard;
  const playIdx = isCreator ? Turn.Creator : Turn.Joiner;
  // if (!creator || !joiner) {
  //   return (
  //     <div className=" flex flex-col gap-10  h-screen items-center justify-center  text-2xl font-medium bg-slate-900 ">
  //       <div className="text-2xl font-medium">no creator or joiner</div>
  //       <div className="text-2xl font-medium text-pink-500">
  //         Please add them on URL
  //       </div>
  //     </div>
  //   );
  // }

  if (!address) {
    return (
      <div className=" flex flex-col gap-10  h-screen items-center justify-center  text-2xl font-medium bg-slate-900 ">
        <div className="text-2xl font-medium">please connect wallet first</div>
        <div
          onClick={() => {
            connect({
              connector: connectors[0],
            });
          }}
          className="px-6 py-2 hover:opacity-70 text-base font-medium rounded-lg bg-slate-100 text-slate-900  text-center cursor-pointer dark:bg-slate-600 dark:text-slate-400 dark:highlight-white/10"
        >
          connect wallet
        </div>
      </div>
    );
  }

  if (chain?.id !== arbitrumGoerli.id) {
    return (
      <div className=" flex flex-col gap-10  h-screen items-center justify-center  text-2xl font-medium bg-slate-900 ">
        <div className="text-2xl font-medium">
          Only support Arbitrum Goerli test network now
        </div>
        <div
          onClick={() => {
            try {
              switchNetwork?.();
            } catch (error) {
              console.log(error);
            }
          }}
          className="px-6 py-2 text-base font-medium rounded-lg bg-slate-100 text-slate-900  text-center cursor-pointer dark:bg-slate-600 dark:text-slate-400 dark:highlight-white/10 hover:opacity-70"
        >
          Switch to Arbitrum Goerli test
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`relative flex flex-col h-screen  p-4 justify-between ${styles.bg}`}
      >
        <div
          className={`flex w-full flex-col items-center justify-center gap-5 `}
        >
          {/* <Image src={noAvatar.src} width={120} height={120} alt="" /> */}
          <div className="flex flex-row gap-5 items-center">
            <Image
              src={mockUser1.src}
              width={120}
              height={120}
              alt=""
              className="rounded-full"
            />
            <div>
              <div className="text-gray-400 text-2xl font-mono font-bold">
                HP:100
              </div>
              <div className="text-gray-400 text-2xl font-mono font-bold">
                address:{formatAddress(joiner)}
              </div>
            </div>
          </div>
          <div className="w-[96rem]  flex flex-1  flex-row gap-2 overflow-x-auto ">
            {creatorList.map((item) => {
              return (
                <Card
                  isDisabled={!isCreator || gameStatus !== IGameStatus.DRAWED}
                  cardValue={cardConfig?.[item?.cardValue]}
                  isFlipped={item.isFlipped}
                  key={item.index}
                  isChoose={item.isChoose}
                  isLoading={
                    isCreator &&
                    chooseCardStatus.isLoading &&
                    item.index === selectCreatorCard
                  }
                  onClickFrond={() => {
                    console.log('playIdx', playIdx);
                    chooseCardStatus.run(hsId, Turn.Creator, item.index);
                    setSelectCreatorCard(item.index);
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="m-1 flex flex-row w-full gap-4 items-center">
          <div className="flex w-full h-0.5  bg-amber-950 justify-center flex-row "></div>
          {isCreator && gameStatus === IGameStatus.WAIT_START && (
            <Button
              isError={createGameStatus.isError}
              isSuccess={createGameStatus.isSuccess}
              isLoading={createGameStatus.isLoading}
              onClick={() => {
                createGameStatus.run(zkShuffle.pk[0], zkShuffle.pk[1]);
              }}
            >
              Create
            </Button>
          )}

          {!isCreator && gameStatus === IGameStatus.CREATED && (
            <Button
              isError={joinGameStatus.isError}
              isSuccess={joinGameStatus.isSuccess}
              isLoading={joinGameStatus.isLoading}
              onClick={() => {
                joinGameStatus.run(hsId, zkShuffle.pk[0], zkShuffle.pk[1]);
              }}
            >
              Join
            </Button>
          )}

          {gameStatus === IGameStatus.JOINED && (
            <>
              <Button
                isError={creatorShuffleShuffleStatus.isError}
                isSuccess={creatorShuffleShuffleStatus.isSuccess}
                isLoading={creatorShuffleShuffleStatus.isLoading}
                onClick={() => {
                  creatorShuffleShuffleStatus.mutateAsync(
                    Number(creatorShuffleId)
                  );
                }}
              >
                Creator shuffle shuffle
              </Button>
              <Button
                isError={joinerShuffleShuffleStatus.isError}
                isSuccess={joinerShuffleShuffleStatus.isSuccess}
                isLoading={joinerShuffleShuffleStatus.isLoading}
                onClick={() => {
                  // zkShuffle?.joinGame(creatorShuffleId);
                  joinerShuffleShuffleStatus.mutateAsync(joinerShuffleId);
                }}
              >
                Joiner shuffle shuffle
              </Button>
              <Button
                isError={batchDrawStatus.isError}
                isSuccess={batchDrawStatus.isSuccess}
                isLoading={batchDrawStatus.isLoading}
                onClick={() => {
                  // zkShuffle?.joinGame(creatorShuffleId);
                  batchDrawStatus.mutateAsync(batchShuffleId);
                }}
              >
                Batch draw
              </Button>
            </>
          )}
          {isCreator && gameStatus === IGameStatus.CREATOR_CHOOSED && (
            <Button
              isError={openStatus.isError}
              isSuccess={openStatus.isSuccess}
              isLoading={openStatus.isLoading}
              onClick={async () => {
                try {
                  openStatus.mutateAsync({
                    shuffleId: openShuffleId,
                    cardIds: [userSelectCardIndex],
                  });
                } catch (error) {
                  console.log('error', error);
                }
              }}
            >
              open
            </Button>
          )}
          {!isCreator && gameStatus === IGameStatus.JOINER_CHOOSED && (
            <Button
              isError={openStatus.isError}
              isSuccess={openStatus.isSuccess}
              isLoading={openStatus.isLoading}
              onClick={async () => {
                try {
                  openStatus.mutateAsync({
                    shuffleId: openShuffleId,
                    cardIds: [userSelectCardIndex],
                  });
                } catch (error) {
                  console.log('error', error);
                }
              }}
            >
              open
            </Button>
          )}

          {gameStatus === IGameStatus.CREATOR_SHUFFLE_SHUFFLED && (
            <Button
              isError={joinerShuffleShuffleStatus.isError}
              isSuccess={joinerShuffleShuffleStatus.isSuccess}
              isLoading={joinerShuffleShuffleStatus.isLoading}
              onClick={() => {
                // zkShuffle?.joinGame(creatorShuffleId);
                joinerShuffleShuffleStatus.mutateAsync(joinerShuffleId);
              }}
            >
              Joiner shuffle shuffle
            </Button>
          )}

          <div className="flex w-full h-0.5  bg-amber-950 justify-center flex-row "></div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-5">
          <div className="w-[96rem] flex flex-1  flex-row gap-2 overflow-x-auto ">
            {joinerList.map((item) => {
              return (
                <Card
                  isDisabled={
                    isCreator || gameStatus !== IGameStatus.CREATOR_OPENED
                  }
                  cardValue={cardConfig?.[item?.cardValue]}
                  isFlipped={item.isFlipped}
                  key={item.index}
                  isChoose={item.isChoose}
                  isLoading={
                    !isCreator &&
                    chooseCardStatus.isLoading &&
                    item.index === selectJoinerCard
                  }
                  onClickFrond={() => {
                    chooseCardStatus.run(hsId, Turn.Joiner, item.index);
                    setSelectJoinerCard(item.index);
                  }}
                />
              );
            })}
          </div>

          <div className="flex flex-row gap-5 items-center">
            <Image
              src={mockUser2.src}
              width={120}
              height={120}
              alt=""
              className="rounded-full"
            />
            <div>
              <div className="text-gray-400 text-2xl font-mono font-bold">
                HP:100
              </div>
              <div className="text-gray-400 text-2xl font-mono font-bold">
                address:{formatAddress(joiner)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
