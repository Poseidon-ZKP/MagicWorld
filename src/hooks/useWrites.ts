import { useContracts } from './useContracts';
import useWriteContract from './useWriteContract';

export const useWrites = () => {
  const { hilo } = useContracts();
  const createGameStatus = useWriteContract(hilo?.createGame, {});
  // const joinGameStatus = useWriteContract(shuffle?.joinGame, {});

  return {
    createGameStatus,
    // joinGameStatus,
  };
};
