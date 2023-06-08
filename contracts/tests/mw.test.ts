import { ethers } from "hardhat";
import { ZKShuffle } from "@poseidon-zkp/poseidon-zk-jssdk/dist/shuffle/zkShuffle";
import { IShuffleStateManager } from "../types/@poseidon-zkp/poseidon-zk-contracts/contracts/shuffle/IShuffleStateManager";
import { deploy_shuffle_manager } from "@poseidon-zkp/poseidon-zk-contracts/helper/deploy";
import { MagicWorld } from "../types/artifacts/cache/solpp-generated-contracts";
import { MagicWorld__factory } from "../types/factories/artifacts/cache/solpp-generated-contracts/MagicWorld__factory";
import { P0X_DIR } from "@poseidon-zkp/poseidon-zk-jssdk/dist/shuffle/utility";
import { resolve } from "path";

async function fullprocess() {
  const [shuffle_manager_owner, ks_owner, Alice, Bob] =
    await ethers.getSigners();

  console.log(`Alice ${Alice.address}, Bob ${Bob.address}`);
  // deploy shuffleManager
  const shuffle: IShuffleStateManager = await deploy_shuffle_manager(
    shuffle_manager_owner
  );

  const hs: MagicWorld = await new MagicWorld__factory(ks_owner).deploy(
    shuffle.address
  );
  console.log(
    `deployed shuffleManager at ${shuffle.address}, hs at ${hs.address}`
  );

  // init shuffle context, which packages the ShuffleManager contract
  const cardConfig = await hs.cardConfig();
  let encrypt_wasm: string;
  let encrypt_zkey: string;
  if (cardConfig == 0) {
    (encrypt_wasm = resolve(P0X_DIR, "./wasm/encrypt.wasm.5")),
      (encrypt_zkey = resolve(P0X_DIR, "./zkey/encrypt.zkey.5"));
  } else if (cardConfig == 1) {
    (encrypt_wasm = resolve(P0X_DIR, "./wasm/encrypt.wasm.30")),
      (encrypt_zkey = resolve(P0X_DIR, "./zkey/encrypt.zkey.30"));
  } else if (cardConfig == 2) {
    (encrypt_wasm = resolve(P0X_DIR, "./wasm/encrypt.wasm")),
      (encrypt_zkey = resolve(P0X_DIR, "./zkey/encrypt.zkey"));
  }

  // Alice init shuffle
  const aliceShuffle = await ZKShuffle.create(
    shuffle.address,
    Alice,
    await ZKShuffle.generateShuffleSecret(),
    resolve(P0X_DIR, "./wasm/decrypt.wasm"),
    resolve(P0X_DIR, "./zkey/decrypt.zkey"),
    encrypt_wasm,
    encrypt_zkey
  );

  // Bob init shuffle
  const bobShuffle = await ZKShuffle.create(
    shuffle.address,
    Bob,
    await ZKShuffle.generateShuffleSecret(),
    resolve(P0X_DIR, "./wasm/decrypt.wasm"),
    resolve(P0X_DIR, "./zkey/decrypt.zkey"),
    encrypt_wasm,
    encrypt_zkey
  );

  // Alice create game
  const creatorTx = await hs
    .connect(Alice)
    .createShuffleForCreator(aliceShuffle.pk[0], aliceShuffle.pk[1]);
  const creatorEvent = await creatorTx.wait().then((receipt: any) => {
    for (const event of receipt.events) {
      if (event.topics[0] == hs.filters.CreateGame(null, null).topics) {
        return event.args;
      }
    }
  });
  const hsId = Number(creatorEvent.hsId);
  const shuffleId1 = Number(creatorEvent.shuffleId);

  // Bob join the game
  const joinerTx = await hs
    .connect(Bob)
    .createShuffleForJoiner(hsId, bobShuffle.pk[0], bobShuffle.pk[1]);
  const joinerEvent = await joinerTx.wait().then((receipt: any) => {
    for (const event of receipt.events) {
      if (event.topics[0] == hs.filters.JoinGame(null, null, null).topics) {
        return event.args;
      }
    }
  });
  const shuffleId2 = Number(joinerEvent.shuffleId);
  console.log(
    `Alice Creates the game, and Bob joins the game, hsId is ${hsId}, shuffleId1 is ${shuffleId1}, shuffleId2 is ${shuffleId2}`
  );

  // Alice shuffle the fist deck
  await aliceShuffle.shuffle(shuffleId1);
  console.log(`Alice shuffled the first deck!`);

  // Bob shuffle the first deck
  await bobShuffle.shuffle(shuffleId1);
  console.log(`Bob shuffled the first deck!`);

  // Bob shuffle the second deck
  await bobShuffle.shuffle(shuffleId2);
  console.log(`Bob shuffled the second deck!`);

  // Alice shuffle the second deck
  await aliceShuffle.shuffle(shuffleId2);
  console.log(`Alice shuffled the second deck!`);

  // Bob deal card to Alice
  await bobShuffle.draw(shuffleId1);
  console.log(`Bob draw the cards from first deck to Alice`);

  // Alice deal card to Bob
  await aliceShuffle.draw(shuffleId2);
  console.log(`Alice draw the cards from second deck to Bob`);

  // start the game, the game will end in 10 rounds
  for (let i = 0; i < 10; i++) {
    await hs.connect(Alice).chooseCard(hsId, 0, i);
    console.log(`In the round ${i + 1}, Alice choose No.${i + 1} card`);

    const aliceCard = await aliceShuffle.open(shuffleId1, [i]);
    console.log(
      `In the round ${i + 1}, Alice showed her card No.${
        i + 1
      }, the card value is ${aliceCard[0]}, so this card is ${getRole(
        aliceCard[0]
      )}`
    );

    let endGameFilter = hs.filters.EndGame(hsId, null, null);
    let events = await hs.queryFilter(endGameFilter, 0, "latest");
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      const winner = e.args.playerIdx.toNumber() == 0 ? "Alice" : "Bob";
      console.log(`Game End, winner is ${winner}`);
      return;
    }

    await hs.connect(Bob).chooseCard(hsId, 1, i);
    console.log(`In the round ${i + 1}, Bob choose No.${i + 1} card`);

    const bobCard = await bobShuffle.open(shuffleId2, [i]);
    console.log(
      `In the round ${i + 1}, Bob showed his card No.${
        i + 1
      }, the card value is ${bobCard[0]}, so this card is ${getRole(
        bobCard[0]
      )}`
    );

    const game = await hs.getGameInfo(hsId);
    console.log(
      `after this round, Alice's health is ${game.health[0]}, Bob's health is ${game.health[1]}`
    );

    endGameFilter = hs.filters.EndGame(hsId, null, null);
    events = await hs.queryFilter(endGameFilter, 0, "latest");
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      const winner = e.args.playerIdx.toNumber() == 0 ? "Alice" : "Bob";
      console.log(`Game End, winner is ${winner}`);
      return;
    }
  }
  console.log(`After 10 rounds, Alice and Bob ended up in a tie.`);
}

function getRole(cardValue: number) {
  const cardType = Math.floor(cardValue / 10);
  switch (cardType) {
    case 0:
      return "Wizard";
    case 1:
      return "Warrior";
    case 2:
      return "Tank";
    default:
      return "Invalid Role";
  }
}

describe("hs test", function () {
  it("MagicWorld", async () => {
    await fullprocess();
  });
});
