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
import { mockUser1, mockUser2 } from '../config/asset';

import Card, { cardConfig, list } from '../components/Card';

import styles from '../styles/Home.module.css';

export default function Home() {
  const { connect, connectors } = useConnect();

  const router = useRouter();

  const creator = router?.query?.creator as string;
  const joiner = router?.query?.joiner as string;

  const { chain } = useNetwork();
  const { address } = useAccount();

  const { zkShuffle, isLoaded } = useContext(ZKShuffleContext);
  const { switchNetwork } = useSwitchNetwork({
    chainId: arbitrumGoerli.id,
  });

  const {
    hiloId,
    shuffleId,
    gameStatus,
    createGameStatus,
    joinGameStatus,
    winner,
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

  if (!isLoaded) {
    return (
      <div className=" flex flex-col gap-10  h-screen items-center justify-center  text-2xl font-medium bg-slate-900 ">
        <div className="text-2xl font-medium">Loading zk resource ....</div>
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
            <img
              src={mockUser1}
              width={120}
              height={120}
              alt=""
              className="rounded-full"
            />
          </div>
        </div>

        <div className="mt-3 mb-3 flex flex-row w-full  items-center">
          <div className="flex w-full h-0.5  bg-amber-950 justify-center flex-row "></div>
          {winner ? (
            <div className="text-3xl font-medium text-gray-200 shrink-0 ml-2 mr-2">
              {winner?.[2]?.toString() == Turn.Creator
                ? 'jacob.eth'
                : 'click.eth'}{' '}
              won!
            </div>
          ) : (
            <div className="flex flex-row gap-4 ml-2 mr-2 shrink-0">
              {isCreator && gameStatus === IGameStatus.WAIT_START && (
                <Button
                  isError={createGameStatus.isError}
                  isSuccess={createGameStatus.isSuccess}
                  isLoading={createGameStatus.isLoading}
                  onClick={() => {
                    createGameStatus.run();
                  }}
                >
                  Create
                </Button>
              )}

              {gameStatus === IGameStatus.CREATED && (
                <Button
                  isError={joinGameStatus.isError}
                  isSuccess={joinGameStatus.isSuccess}
                  isLoading={joinGameStatus.isLoading}
                  onClick={() => {
                    console.log('shuffleId', shuffleId);
                    joinGameStatus.mutateAsync(shuffleId);
                  }}
                >
                  Join Game
                </Button>
              )}
            </div>
          )}

          <div className="flex w-full h-0.5  bg-amber-950 justify-center flex-row "></div>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-5">
          <div className="w-[96rem] flex flex-1  flex-row gap-2 overflow-x-auto "></div>
          <div className="flex flex-row gap-5 items-center">
            <img
              src={mockUser2}
              width={120}
              height={120}
              alt=""
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
