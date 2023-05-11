import {
  convertPk,
  keyGen,
} from '@poseidon-zkp/poseidon-zk-proof/dist/src/shuffle/utilities';

import { getContract } from '@wagmi/core';
import { contracts } from '../const/contracts';
import { Contract, ethers } from 'ethers';

const numBits = BigInt(251);

export interface BabyjubsResult {
  pks: string[];
  sks: string[];
}

export interface PlayerContracts {
  [key: string]: Contract;
}

export interface BabyjubResult {
  pk: string[];
  sk: string;
}

export interface PlayerInfos {
  [key: string]: {
    pk: string[];
    sk: string;
  };
}

export type RESOURCE_TYPE = 'shuffle_encrypt_v2' | 'decrypt';
export type FILE_TYPE = 'wasm' | 'zkey';

const P0X_AWS_URL = 'https://p0x-labs.s3.amazonaws.com/refactor/';

export function getResourcePath(resType: RESOURCE_TYPE, fileType: FILE_TYPE) {
  return `https://p0x-labs.s3.amazonaws.com/${fileType}/${resType}.${fileType}`;
}

const shuffleEncryptZkeyFile = getResourcePath('shuffle_encrypt_v2', 'zkey');
const shuffleEncryptWasmFile = getResourcePath('shuffle_encrypt_v2', 'wasm');
const decryptZkeyFile = getResourcePath('decrypt', 'zkey');
const decryptWasmFile = getResourcePath('decrypt', 'wasm');

export const getPlayerPksAndSks = (
  pksAndSks: BabyjubsResult,
  playerAddresses: string[]
) => {
  if (pksAndSks.pks.length !== playerAddresses.length) return;
  let newInfo = {} as any;
  playerAddresses.forEach((item, index) => {
    newInfo[item] = {
      pk: pksAndSks.pks[index],
      sk: pksAndSks.sks[index],
    };
  });
  return newInfo;
};

export function getBabyjub(babyjub: any, numbers: number) {
  let pkArray: any = [];
  let skArray: any = [];
  for (let i = 0; i < numbers; i++) {
    const key = keyGen(babyjub, numBits);
    pkArray.push(key.pk);
    skArray.push(key.sk);
  }
  pkArray = convertPk(babyjub, pkArray);
  return {
    pks: pkArray,
    sks: skArray,
  };
}

export const getContracts = (addresses: string[]) => {
  let newInfo = {} as any;
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  const signer = provider.getSigner();
  addresses.forEach((item, index) => {
    newInfo[item] = getContract({
      address: contracts.HiLo.address,
      abi: contracts.HiLo.abi,
      signerOrProvider: signer,
    });
  });
  return newInfo;
};
