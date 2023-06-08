// game ShowHand listener

import { EventFilter, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { getLogParams } from '../utils/contracts';

export interface UseEventProps {
  contract: any;
  filter?: ethers.EventFilter;
  isStop?: boolean;
  addressIndex: number;
  others: {
    creator: string;
    joiner: string;
    gameId?: number;
    [key: string]: any;
  };
}

export const PULL_DATA_TIME = 2500;

function useEvent({
  contract,
  filter,
  isStop = true,
  addressIndex,
  others: { creator, joiner, gameId },
}: UseEventProps) {
  const provider = useProvider();
  const [creatorValue, setCreatorValue] = useState<any>();
  const [joinerValue, setJoinerValue] = useState<any>();

  const reset = () => {
    setCreatorValue(undefined);
    setJoinerValue(undefined);
  };

  const listener = async (...args: any[]) => {
    try {
      console.log('args', args);
      if (args[addressIndex] === creator) {
        setCreatorValue(args);
      } else if (args[addressIndex] === joiner) {
        setJoinerValue(args);
      }
    } catch (error) {
      console.log(error, error);
    }
  };

  useEffect(() => {
    let interval: string | number | NodeJS.Timer | null | undefined = null;
    if (!contract) return;
    if (!isStop) {
      interval = setInterval(async () => {
        const logs = await provider.getLogs(
          getLogParams({
            filter: filter as EventFilter,
            address: contract?.address,
            provider: provider,
          })
        );
        logs.forEach((log: any) => {
          const event = contract.interface.parseLog(log);
          listener(...event.args);
        });
      }, PULL_DATA_TIME);
    } else {
      interval && clearInterval(interval);
    }

    return () => {
      interval && clearInterval(interval);
    };
  }, [addressIndex, contract, creator, filter, isStop, joiner, provider]);

  return {
    creator: creatorValue,
    joiner: joinerValue,
    reset,
  };
}

export default useEvent;
