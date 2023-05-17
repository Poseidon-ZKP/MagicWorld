import { useContracts } from './useContracts';
import useWriteContract from './useWriteContract';

export const useWrites = () => {
  const { hilo, shuffle } = useContracts();
  console.log('contracts', hilo);
  const createGameStatus = useWriteContract(hilo?.createGame, {});
  const joinGameStatus = useWriteContract(shuffle?.joinGame, {});

  return {
    createGameStatus,
    joinGameStatus,
  };
};
