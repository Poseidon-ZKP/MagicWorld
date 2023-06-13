import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

// Depploys contract for decryption.
async function deployDecrypt(owner: SignerWithAddress) {
  return (await ethers.getContractFactory("DecryptVerifier"))
    .connect(owner)
    .deploy();
}

// Deploys contract for shuffle encrypt.
async function deployShuffleEncryptCARD52(owner: SignerWithAddress) {
  return (await ethers.getContractFactory("Shuffle_encryptVerifier"))
    .connect(owner)
    .deploy();
}

async function deployShuffleEncryptCARD30(owner: SignerWithAddress) {
  return (await ethers.getContractFactory("Shuffle_encryptVerifier30Card"))
    .connect(owner)
    .deploy();
}

async function deployShuffleEncryptCARD5(owner: SignerWithAddress) {
  return (await ethers.getContractFactory("Shuffle_encryptVerifier5Card"))
    .connect(owner)
    .deploy();
}

export async function deploy_shuffle_manager(owner: SignerWithAddress) {
  const encrypt52 = await deployShuffleEncryptCARD52(owner);
  const encrypt30 = await deployShuffleEncryptCARD30(owner);
  const encrypt5 = await deployShuffleEncryptCARD5(owner);
  const decrypt = await deployDecrypt(owner);

  const crypto = await (
    await ethers.getContractFactory("zkShuffleCrypto")
  ).deploy();
  const sm = await (
    await ethers.getContractFactory("ShuffleManager", {
      libraries: {
        zkShuffleCrypto: crypto.address,
      },
    })
  ).deploy(
    decrypt.address,
    encrypt52.address,
    encrypt30.address,
    encrypt5.address
  );
  return sm;
}
