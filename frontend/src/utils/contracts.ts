import { ethers } from 'ethers';

export const getLogParams = async ({
  filter,
  address,
  provider,
}: {
  filter: ethers.EventFilter;
  address?: string;
  provider?: any;
}) => {
  const fromBlock = (await provider?.getBlockNumber()) - 50;
  const toBlock = 'latest';
  return {
    address,
    fromBlock,
    toBlock,
    topics: filter.topics,
  };
};
