/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type { HearthStone, HearthStoneInterface } from "../HearthStone";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IShuffleStateManager",
        name: "_shuffle",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "hsId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "playerIdx",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cardIdx",
        type: "uint256",
      },
    ],
    name: "ChooseCard",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "hsId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shuffleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "CreateGame",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "hsId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "playerIdx",
        type: "uint256",
      },
    ],
    name: "EndGame",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "hsId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shuffleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "joiner",
        type: "address",
      },
    ],
    name: "JoinGame",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "hsId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "playerIdx",
        type: "uint256",
      },
    ],
    name: "NextPlayer",
    type: "event",
  },
  {
    inputs: [],
    name: "INVALID_INDEX",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "cardConfig",
    outputs: [
      {
        internalType: "enum DeckConfig",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "hsId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "playerIdx",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "cardIdx",
        type: "uint256",
      },
    ],
    name: "chooseCard",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "createShuffleForCreator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "hsId",
        type: "uint256",
      },
    ],
    name: "createShuffleForJoiner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "shuffleId",
        type: "uint256",
      },
    ],
    name: "dealCardsToPlayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "hsId",
        type: "uint256",
      },
    ],
    name: "getGameInfo",
    outputs: [
      {
        components: [
          {
            internalType: "address[2]",
            name: "players",
            type: "address[2]",
          },
          {
            internalType: "uint256[2]",
            name: "health",
            type: "uint256[2]",
          },
          {
            internalType: "uint256[2]",
            name: "shield",
            type: "uint256[2]",
          },
          {
            internalType: "uint256[2]",
            name: "shuffleIds",
            type: "uint256[2]",
          },
          {
            internalType: "uint256",
            name: "curPlayerIndex",
            type: "uint256",
          },
        ],
        internalType: "struct Game",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "largestKSId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "shuffleId",
        type: "uint256",
      },
    ],
    name: "moveToShuffleStage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "hsId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "playerIdx",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "cardIdx",
        type: "uint256",
      },
    ],
    name: "settle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "shuffle",
    outputs: [
      {
        internalType: "contract IShuffleStateManager",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161146238038061146283398101604081905261002f91610059565b600080546001600160a01b0319166001600160a01b03929092169190911790556064600155610087565b60006020828403121561006a578081fd5b81516001600160a01b0381168114610080578182fd5b9392505050565b6113cc806100966000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c806347e1d5501161007157806347e1d5501461012c5780634d116d6f1461014c578063574cdded1461015f5780639f017a1514610172578063b2aa86431461017a578063fc7d66671461018d57600080fd5b806309a9851d146100ae5780631d505c6a146100c35780632520bf04146100df57806336e665af1461010a57806337cf53311461011d575b600080fd5b6100c16100bc366004611124565b610197565b005b6100cc60015481565b6040519081526020015b60405180910390f35b6000546100f2906001600160a01b031681565b6040516001600160a01b0390911681526020016100d6565b6100c16101183660046110f4565b61039c565b60026040516100d691906111bd565b61013f61013a3660046110f4565b610446565b6040516100d6919061121c565b6100c161015a3660046110f4565b610556565b6100c161016d366004611124565b61061e565b6100c16107e4565b6100c16101883660046110f4565b6109ef565b6100cc620f423f81565b600083815260026020819052604090912090839081106101c757634e487b7160e01b600052603260045260246000fd5b01546001600160a01b0316331461021c5760405162461bcd60e51b81526020600482015260146024820152730d2dcecc2d8d2c840e0d8c2f2cae440d2dcc8caf60631b60448201526064015b60405180910390fd5b600083815260026020526040902060080154821461026f5760405162461bcd60e51b815260206004820152601060248201526f3737ba1034b7103cb7bab9103a3ab93760811b6044820152606401610213565b60408051602481018590526044810184905260648082018490528251808303909101815260849091018252602080820180516001600160e01b031663574cdded60e01b1790526000805487825260029283905293902091926001600160a01b03169163b608151e91600690910190869081106102fb57634e487b7160e01b600052603260045260246000fd5b015460006001856040518563ffffffff1660e01b815260040161032194939291906112be565b600060405180830381600087803b15801561033b57600080fd5b505af115801561034f573d6000803e3d6000fd5b505060408051338152602081018790529081018590528692507fb717821f236b2f06d37ae90addc550b7b4a4403dca8d2d6f52b5ebb858bc5518915060600160405180910390a250505050565b6000546001600160a01b031633146103c65760405162461bcd60e51b8152600401610213906111e5565b604080516020810182526103ff81526000805492516318e82a2b60e11b815291926060926001600160a01b03909116916331d054569161040f91879187919087906004016112f0565b600060405180830381600087803b15801561042957600080fd5b505af115801561043d573d6000803e3d6000fd5b50505050505050565b61044e61108f565b600082815260026020819052604091829020825160e0810193849052929091839160a0830191849182845b81546001600160a01b0316815260019091019060200180831161047957505050918352505060408051808201918290526020909201919060028481019182845b8154815260200190600101908083116104b9575050509183525050604080518082019182905260209092019190600484019060029082845b8154815260200190600101908083116104f1575050509183525050604080518082019182905260209092019190600684019060029082845b81548152602001906001019080831161052957505050505081526020016008820154815250509050919050565b6000546001600160a01b031633146105805760405162461bcd60e51b8152600401610213906111e5565b60408051602480820184905282518083039091018152604490910182526020810180516001600160e01b03166336e665af60e01b179052600054915163f3c7e26d60e01b815290916001600160a01b03169063f3c7e26d906105e8908590859060040161129d565b600060405180830381600087803b15801561060257600080fd5b505af1158015610616573d6000803e3d6000fd5b505050505050565b6000546001600160a01b031633146106485760405162461bcd60e51b8152600401610213906111e5565b6000805484825260026020819052604083206001600160a01b039092169163261fe4ca916006909101908690811061069057634e487b7160e01b600052603260045260246000fd5b0154846040518363ffffffff1660e01b81526004016106b9929190918252602082015260400190565b60206040518083038186803b1580156106d157600080fd5b505afa1580156106e5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610709919061110c565b905060008054906101000a90046001600160a01b03166001600160a01b031663fc7d66676040518163ffffffff1660e01b815260040160206040518083038186803b15801561075757600080fd5b505afa15801561076b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061078f919061110c565b8114156107d35760405162461bcd60e51b8152602060048201526012602482015271696e76616c696420636172642076616c756560701b6044820152606401610213565b6107de848483610c34565b50505050565b6001600081546107f390611365565b9091555060018054600090815260026020819052604080832080546001600160a01b031916331790559254825282822060329082015590549151635a3b27ab60e11b815260048101919091526001600160a01b03919091169063b4764f5690602401602060405180830381600087803b15801561086f57600080fd5b505af1158015610883573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108a7919061110c565b600154600090815260026020526040812060060101556001546000908152600260205260408120634d116d6f60e01b906006018201546040516024016108ef91815260200190565b60408051601f19818403018152918152602080830180516001600160e01b03166001600160e01b03199590951694909417909352600080546001548252600290945281902060060154905163765718d760e01b81529193506001600160a01b039092169163765718d7916109689190859060040161129d565b600060405180830381600087803b15801561098257600080fd5b505af1158015610996573d6000803e3d6000fd5b505060015460008181526002602052604081209193507f16dca524ff25a377d2e6cecca0f661869e5237f50a4de1699a507346bc5184ea925060069091010154604080519182523360208301520160405180910390a250565b6000818152600260205260409020546001600160a01b031615801590610a2d57506000818152600260205260408120600101546001600160a01b0316145b610a695760405162461bcd60e51b815260206004820152600d60248201526c1a5b9d985b1a59081adcc81a59609a1b6044820152606401610213565b6000818152600260208190526040808320600190810180546001600160a01b03191633179055805484528184206032600390910155548352808320600a60059091015591549151635a3b27ab60e11b815260048101919091526001600160a01b03919091169063b4764f5690602401602060405180830381600087803b158015610af257600080fd5b505af1158015610b06573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b2a919061110c565b600082815260026020818152604080842060070185905580516024808201879052825180830390910181526044909101825280830180516001600160e01b0316634d116d6f60e01b179052845494879052929091525163765718d760e01b815290926001600160a01b039092169163765718d791610bad9190859060040161129d565b600060405180830381600087803b158015610bc757600080fd5b505af1158015610bdb573d6000803e3d6000fd5b50506001805460008681526002602052604090209093507f6381813fbaf8e97409adf6e29a2058b85bbd2b336a3449ef16b01d1c64dfa84a92506006010154604080519182523360208301520160405180910390a25050565b6000610c3f8261102c565b90508060200151600260008681526020019081526020016000206004018460028110610c7b57634e487b7160e01b600052603260045260246000fd5b015580516000858152600260205260409020600401610c9b85600161134e565b60028110610cb957634e487b7160e01b600052603260045260246000fd5b0154600086815260026020819052604090912001610cd886600161134e565b60028110610cf657634e487b7160e01b600052603260045260246000fd5b0154610d029190611316565b1115610f1c5780516000858152600260205260409020600401610d2685600161134e565b60028110610d4457634e487b7160e01b600052603260045260246000fd5b015410610da25780516000858152600260205260409020600401610d6985600161134e565b60028110610d8757634e487b7160e01b600052603260045260246000fd5b016000828254610d97919061134e565b90915550610e779050565b6000848152600260205260409020600401610dbe84600161134e565b60028110610ddc57634e487b7160e01b600052603260045260246000fd5b01548151610dea919061134e565b600085815260026020819052604090912001610e0785600161134e565b60028110610e2557634e487b7160e01b600052603260045260246000fd5b016000828254610e35919061134e565b90915550506000848152600260205260408120600401610e5685600161134e565b60028110610e7457634e487b7160e01b600052603260045260246000fd5b01555b6000848152600260205260408120600801805491610e9483611365565b90915550506000848152600260208190526040909120600801541415610ec7576000848152600260205260408120600801555b837fab1f15a07106ea82d514d294fd467f3db0ed74957a1037e9c8ea91ef50c267e16002600087815260200190815260200160002060080154604051610f0f91815260200190565b60405180910390a26107de565b6000848152600260208190526040822001610f3885600161134e565b60028110610f5657634e487b7160e01b600052603260045260246000fd5b015560405183815284907f7a33579220d1c4ac01f744294990d871f5367239589962f184683b3757c874969060200160405180910390a2600080548582526002602081905260409092206001600160a01b039091169163d0399bb8916006019086908110610fd457634e487b7160e01b600052603260045260246000fd5b01546040518263ffffffff1660e01b8152600401610ff491815260200190565b600060405180830381600087803b15801561100e57600080fd5b505af1158015611022573d6000803e3d6000fd5b5050505050505050565b6040805180820190915260008082526020820152600061104d600a8461132e565b9050806110605760108252600560208301525b806001141561107557600b8252600a60208301525b600281106110895760038252601260208301525b50919050565b6040518060a001604052806110a26110d6565b81526020016110af6110d6565b81526020016110bc6110d6565b81526020016110c96110d6565b8152602001600081525090565b60405180604001604052806002906020820280368337509192915050565b600060208284031215611105578081fd5b5035919050565b60006020828403121561111d578081fd5b5051919050565b600080600060608486031215611138578182fd5b505081359360208301359350604090920135919050565b8060005b60028110156107de578151845260209384019390910190600101611153565b60008151808452815b818110156111975760208185018101518683018201520161117b565b818111156111a85782602083870101525b50601f01601f19169290920160200192915050565b60208101600383106111df57634e487b7160e01b600052602160045260246000fd5b91905290565b6020808252601e908201527f43616c6c6572206973206e6f742073687566666c65206d616e616765722e0000604082015260600190565b81516101208201908260005b60028110156112505782516001600160a01b0316825260209283019290910190600101611228565b5050506020830151611265604084018261114f565b506040830151611278608084018261114f565b50606083015161128b60c084018261114f565b50608083015161010083015292915050565b8281526040602082015260006112b66040830184611172565b949350505050565b84815283602082015260ff831660408201526080606082015260006112e66080830184611172565b9695505050505050565b848152835160208201528260408201526080606082015260006112e66080830184611172565b6000821982111561132957611329611380565b500190565b60008261134957634e487b7160e01b81526012600452602481fd5b500490565b60008282101561136057611360611380565b500390565b600060001982141561137957611379611380565b5060010190565b634e487b7160e01b600052601160045260246000fdfea26469706673582212203983a47b59172fff5d881e7a2061b9ff0526011f72f0dfb2eaf8457c8a1f114b64736f6c63430008040033";

type HearthStoneConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: HearthStoneConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class HearthStone__factory extends ContractFactory {
  constructor(...args: HearthStoneConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _shuffle: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<HearthStone> {
    return super.deploy(_shuffle, overrides || {}) as Promise<HearthStone>;
  }
  override getDeployTransaction(
    _shuffle: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_shuffle, overrides || {});
  }
  override attach(address: string): HearthStone {
    return super.attach(address) as HearthStone;
  }
  override connect(signer: Signer): HearthStone__factory {
    return super.connect(signer) as HearthStone__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): HearthStoneInterface {
    return new utils.Interface(_abi) as HearthStoneInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): HearthStone {
    return new Contract(address, _abi, signerOrProvider) as HearthStone;
  }
}