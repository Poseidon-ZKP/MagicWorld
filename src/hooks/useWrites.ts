import { useMutation } from '@tanstack/react-query';

import { useContracts } from './useContracts';
import useWriteContract from './useWriteContract';
import { useContext } from 'react';
import { ZKShuffleContext } from '../contexts/ZKShuffle';

export const useWrites = () => {
  const { hilo } = useContracts();
  const { zkShuffle } = useContext(ZKShuffleContext);
  const createGameStatus = useWriteContract(hilo?.createGame, {});
  const joinGameStatus = useMutation({
    mutationFn: (shuffleId: number) => {
      return zkShuffle?.joinGame(shuffleId);
    },
  });

  const shuffleStatus = useMutation({
    mutationFn: (gameId: number) => {
      return zkShuffle?.shuffle(gameId);
    },
  });

  const drawStatus = useMutation({
    mutationFn: (gameId: number) => {
      return zkShuffle?.draw(gameId);
    },
  });

  const openStatus = useMutation({
    mutationFn: ({
      shuffleId,
      cardIds,
    }: {
      shuffleId: number;
      cardIds: number[];
    }) => {
      return zkShuffle?.open(shuffleId, cardIds);
    },
  });

  return {
    createGameStatus,
    joinGameStatus,
    shuffleStatus,
    drawStatus,
    openStatus,
  };
};
