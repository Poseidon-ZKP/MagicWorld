import { useContracts } from './useContracts';
import useWriteContract from './useWriteContract';

export const useWrites = () => {
  const { hilo } = useContracts();
  console.log('contracts', hilo);
  const createGameStatus = useWriteContract(hilo?.createGame, {});
  return {
    createGameStatus,
  };
};
