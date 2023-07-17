import { useAccount, useConnect, useNetwork, useSwitchNetwork } from "wagmi";
import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import { arbitrumGoerli } from "wagmi/chains";

import useGame, { IGameStatus, Turn } from "../hooks/useGame";
import { ZKShuffleContext } from "../contexts/ZKShuffle";
import Button from "../components/Button";
import Card, { cardConfig } from "../components/Card";
import { mockUser1, mockUser2 } from "../config/asset";

import styles from "../styles/Home.module.css";
import { ethers } from "ethers";
import { mantaTest } from "../config/chains";

export default function Home() {
  const { connect, connectors } = useConnect();

  const router = useRouter();

  const creator = router?.query?.creator as string;
  const joiner = router?.query?.joiner as string;

  const { chain } = useNetwork();
  const { address } = useAccount();

  const { zkShuffle, isLoaded } = useContext(ZKShuffleContext);
  const { switchNetwork } = useSwitchNetwork({
    chainId: mantaTest.id,
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
    creatorButtonStatus,
    joinerButtonStatus,
    creatorShuffleShuffleStatus,
    joinerShuffleShuffleStatus,
    batchDrawStatus,
    openStatus,
    chooseCardStatus,
    gameInfo,
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
  const openShuffleId = isCreator ? creatorShuffleId : joinerShuffleId;
  const batchShuffleId = isCreator ? joinerShuffleId : creatorShuffleId;
  const userSelectCardIndex = isCreator ? selectCreatorCard : selectJoinerCard;

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

  if (chain?.id !== mantaTest.id) {
    return (
      <div className=" flex flex-col gap-10  h-screen items-center justify-center  text-2xl font-medium bg-slate-900 ">
        <div className="text-2xl font-medium">
          Only support Manta test network now
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
          Switch to Manta test
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

  if (!ethers.utils.isAddress(creator) || !ethers.utils.isAddress(joiner)) {
    return (
      <div className=" flex flex-col gap-10  h-screen items-center justify-center  text-2xl font-medium bg-slate-900 ">
        <div className="text-2xl font-medium">
          Please add user addresses on url
        </div>
      </div>
    );
  }

  if (creator !== address && joiner !== address) {
    return (
      <div className=" flex flex-col gap-10  h-screen items-center justify-center  text-2xl font-medium bg-slate-900 ">
        <div className="text-2xl font-medium">this is not your game</div>
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

            <div>
              {gameInfo && (
                <>
                  <div className="text-gray-400 text-2xl font-mono font-bold">
                    HP:{gameInfo?.health?.[0]?.toString()}
                  </div>

                  <div className="text-gray-400 text-2xl font-mono font-bold">
                    shield:{gameInfo?.shield?.[0]?.toString()}
                  </div>
                </>
              )}
              <div className="text-gray-400 text-2xl font-mono font-bold">
                address:{"jacob.eth"}
              </div>
            </div>
          </div>
          <div className="w-[96rem]  flex flex-1  flex-row gap-2 overflow-x-auto ">
            {creatorList.map((item) => {
              return (
                <Card
                  isDisabled={
                    !isCreator || gameStatus !== IGameStatus.DRAWED || !!winner
                  }
                  cardValue={cardConfig?.[item?.cardValue]}
                  isFlipped={item.isFlipped}
                  key={item.index}
                  isChoose={item.isChoose && isCreator}
                  isLoading={
                    // true
                    isCreator &&
                    chooseCardStatus.isLoading &&
                    item.index === selectCreatorCard
                  }
                  onClickBack={() => {
                    chooseCardStatus.run(hsId, Turn.Creator, item.index);
                    setSelectCreatorCard(item.index);
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-3 mb-3 flex flex-row w-full  items-center">
          <div className="flex w-full h-0.5  bg-amber-950 justify-center flex-row "></div>
          {winner ? (
            <div className="text-3xl font-medium text-gray-200 shrink-0 ml-2 mr-2">
              {winner == creator ? "jacob.eth" : "click.eth"}
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

              {gameStatus === IGameStatus.JOINED && isCreator && (
                <>
                  <Button
                    isDisabled={!creatorButtonStatus.creatorCreatorToShuffle}
                    isError={creatorShuffleShuffleStatus.isError}
                    isSuccess={creatorShuffleShuffleStatus.isSuccess}
                    isLoading={creatorShuffleShuffleStatus.isLoading}
                    onClick={() => {
                      try {
                        creatorShuffleShuffleStatus.mutateAsync(
                          Number(creatorShuffleId)
                        );
                      } catch (error) {
                        console.log("error", error);
                      }
                    }}
                  >
                    Shuffle the first deck
                  </Button>
                  <Button
                    isDisabled={!creatorButtonStatus.creatorJoinerToShuffle}
                    isError={joinerShuffleShuffleStatus.isError}
                    isSuccess={joinerShuffleShuffleStatus.isSuccess}
                    isLoading={joinerShuffleShuffleStatus.isLoading}
                    onClick={() => {
                      try {
                        // zkShuffle?.joinGame(creatorShuffleId);
                        joinerShuffleShuffleStatus.mutateAsync(joinerShuffleId);
                      } catch (error) {
                        console.log("error", error);
                      }
                    }}
                  >
                    Shuffle the second deck
                  </Button>
                  <Button
                    isDisabled={!creatorButtonStatus.creatorToDraw}
                    isError={batchDrawStatus.isError}
                    isSuccess={batchDrawStatus.isSuccess}
                    isLoading={batchDrawStatus.isLoading}
                    onClick={() => {
                      try {
                        // zkShuffle?.joinGame(creatorShuffleId);
                        batchDrawStatus.mutateAsync(batchShuffleId);
                      } catch (error) {
                        console.log("error", error);
                      }
                    }}
                  >
                    Batch draw
                  </Button>
                </>
              )}

              {gameStatus === IGameStatus.JOINED && !isCreator && (
                <>
                  <Button
                    isDisabled={!joinerButtonStatus.joinerCreatorToShuffle}
                    isError={creatorShuffleShuffleStatus.isError}
                    isSuccess={creatorShuffleShuffleStatus.isSuccess}
                    isLoading={creatorShuffleShuffleStatus.isLoading}
                    onClick={() => {
                      try {
                        creatorShuffleShuffleStatus.mutateAsync(
                          Number(creatorShuffleId)
                        );
                      } catch (error) {
                        console.log("error", error);
                      }
                    }}
                  >
                    Shuffle the first deck
                  </Button>
                  <Button
                    isDisabled={!joinerButtonStatus.joinerJoinerToShuffle}
                    isError={joinerShuffleShuffleStatus.isError}
                    isSuccess={joinerShuffleShuffleStatus.isSuccess}
                    isLoading={joinerShuffleShuffleStatus.isLoading}
                    onClick={() => {
                      try {
                        // zkShuffle?.joinGame(creatorShuffleId);
                        joinerShuffleShuffleStatus.mutateAsync(joinerShuffleId);
                      } catch (error) {
                        console.log("error", error);
                      }
                    }}
                  >
                    Shuffle the second deck
                  </Button>
                  <Button
                    isDisabled={!joinerButtonStatus.joinerToDraw}
                    isError={batchDrawStatus.isError}
                    isSuccess={batchDrawStatus.isSuccess}
                    isLoading={batchDrawStatus.isLoading}
                    onClick={() => {
                      try {
                        // zkShuffle?.joinGame(creatorShuffleId);
                        batchDrawStatus.mutateAsync(batchShuffleId);
                      } catch (error) {
                        console.log("error", error);
                      }
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
                      console.log("error", error);
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
                      console.log("error", error);
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
                    try {
                      joinerShuffleShuffleStatus.mutateAsync(joinerShuffleId);
                    } catch (error) {
                      console.log("error", error);
                    }
                  }}
                >
                  Joiner shuffle shuffle
                </Button>
              )}
            </div>
          )}

          <div className="flex w-full h-0.5  bg-amber-950 justify-center flex-row "></div>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-5">
          <div className="w-[96rem] flex flex-1  flex-row gap-2 overflow-x-auto ">
            {joinerList.map((item) => {
              return (
                <Card
                  isDisabled={
                    isCreator ||
                    gameStatus !== IGameStatus.CREATOR_OPENED ||
                    !!winner
                  }
                  cardValue={cardConfig?.[item?.cardValue]}
                  isFlipped={item.isFlipped}
                  key={item.index}
                  isChoose={item.isChoose && !isCreator}
                  isLoading={
                    !isCreator &&
                    chooseCardStatus.isLoading &&
                    item.index === selectJoinerCard
                  }
                  onClickBack={() => {
                    try {
                      chooseCardStatus.run(hsId, Turn.Joiner, item.index);
                      setSelectJoinerCard(item.index);
                    } catch (error) {
                      console.log("error", error);
                    }
                  }}
                />
              );
            })}
          </div>

          <div className="flex flex-row gap-5 items-center">
            <img
              src={mockUser2}
              width={120}
              height={120}
              alt=""
              className="rounded-full"
            />

            <div>
              {gameInfo && (
                <>
                  <div className="text-gray-400 text-2xl font-mono font-bold">
                    HP:{gameInfo?.health?.[1]?.toString()}
                  </div>

                  <div className="text-gray-400 text-2xl font-mono font-bold">
                    shield:{gameInfo?.shield?.[1]?.toString()}
                  </div>
                </>
              )}
              <div className="text-gray-400 text-2xl font-mono font-bold">
                address:{"click.eth"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
