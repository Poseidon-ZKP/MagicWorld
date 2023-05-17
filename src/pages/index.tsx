import { useAccount, useConnect, useNetwork, useSwitchNetwork } from 'wagmi';
import React from 'react';
import { formatAddress } from '../utils/common';

import { useRouter } from 'next/router';
import { arbitrumGoerli } from 'wagmi/chains';

import StatusItem from '../components/StatusItem';
import { useWrites } from '../hooks/useWrites';
import useGame, { IGameStatus } from '../hooks/useGame';

export default function Home() {
  const { connect, connectors } = useConnect();

  const router = useRouter();

  const creator = router?.query?.creator as string;
  const joiner = router?.query?.joiner as string;

  const { chain } = useNetwork();
  const { address } = useAccount();
  const { createGameStatus, joinGameStatus } = useWrites();

  const { switchNetwork } = useSwitchNetwork({
    chainId: arbitrumGoerli.id,
  });
  const { shuffleId, hiloId, gameStatus } = useGame(creator, joiner, address);

  if (!router.isReady) {
    return (
      <div className=" flex flex-col gap-10  h-screen items-center justify-center  text-2xl font-medium bg-slate-900 ">
        <div className="text-2xl font-medium">Loading resource...</div>
      </div>
    );
  }

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
      <div className="relative flex flex-col h-screen bg-slate-900">
        <div className="flex flex-row gap-20">
          <div className="relative z-10 bg-white rounded-xl shadow-xl  bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 dark:highlight-white/10">
            <article>
              <h2 className="text-lg font-semibold text-slate-900 pt-4 pb-2 px-4 sm:px-6 lg:px-4 xl:px-6 dark:text-slate-100 transition-opacity duration-[1.5s] delay-500 ">
                Creator Address:{creator ? formatAddress(creator) : '--'}
              </h2>
              <dl className="w-96 flex flex-col flex-wrap divide-y divide-slate-200 border-b border-slate-200 text-sm sm:text-base lg:text-sm xl:text-base dark:divide-slate-200/5 dark:border-slate-200/5">
                {gameStatus == IGameStatus.WAIT_START && (
                  <StatusItem
                    label={'Create Status:'}
                    statusLabel={'Created'}
                    isShowText={createGameStatus.isSuccess}
                    uiStatus={!createGameStatus.isSuccess}
                    buttonStatus={createGameStatus}
                    buttonProps={{
                      onClick: async () => {
                        await createGameStatus?.run();
                      },
                      children: 'Start game',
                    }}
                  />
                )}
              </dl>
              {/* <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 lg:gap-x-4 xl:gap-x-6 p-4 sm:px-6 sm:py-5 lg:p-4 xl:px-6 xl:py-5">
                  <div className="text-base font-medium rounded-lg bg-slate-100 text-slate-900 py-3 text-center cursor-pointer dark:bg-slate-600 dark:text-slate-400 dark:highlight-white/10">
                    Decline
                  </div>
                  <div className="text-base font-medium rounded-lg bg-sky-500 text-white py-3 text-center cursor-pointer dark:highlight-white/20">
                    Accept
                  </div>
                </div> */}
            </article>
          </div>

          <div className="relative z-10 bg-white rounded-xl shadow-xl ring-1 ring-slate-900/5 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 dark:highlight-white/10">
            <article>
              <h2 className="text-lg font-semibold text-slate-900 pt-4 pb-2 px-4 sm:px-6 lg:px-4 xl:px-6 dark:text-slate-100 transition-opacity duration-[1.5s] delay-500 ">
                Joiner Address: {joiner ? formatAddress(joiner) : '--'}
              </h2>
              <dl className="w-96 flex flex-col flex-wrap divide-y divide-slate-200 border-b border-slate-200 text-sm sm:text-base lg:text-sm xl:text-base dark:divide-slate-200/5 dark:border-slate-200/5">
                <StatusItem
                  label={'Join Status:'}
                  statusLabel={'Joined'}
                  isShowText={joinGameStatus.isSuccess}
                  uiStatus={!joinGameStatus.isSuccess}
                  buttonStatus={joinGameStatus}
                  buttonProps={{
                    onClick: async () => {
                      await joinGameStatus?.run(shuffleId);
                    },
                    children: 'Join game',
                  }}
                />
              </dl>
              {/* <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 lg:gap-x-4 xl:gap-x-6 p-4 sm:px-6 sm:py-5 lg:p-4 xl:px-6 xl:py-5">
                  <div className="text-base font-medium rounded-lg bg-slate-100 text-slate-900 py-3 text-center cursor-pointer dark:bg-slate-600 dark:text-slate-400 dark:highlight-white/10">
                    Decline
                  </div>
                  <div className="text-base font-medium rounded-lg bg-sky-500 text-white py-3 text-center cursor-pointer dark:highlight-white/20">
                    Accept
                  </div>
                </div> */}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
