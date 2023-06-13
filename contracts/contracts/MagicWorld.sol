// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "@zk-shuffle/contracts/contracts/shuffle/IBaseGame.sol";
import "@zk-shuffle/contracts/contracts/shuffle/IShuffleStateManager.sol";

struct MagicCard {
    uint256 attack;
    uint256 defense;
}

struct Game {
    address[2] players;
    uint256[2] health;
    uint256[2] shield;
    uint256[2] shuffleIds;
    uint256 curPlayerIndex;
    // cache for creator pk
    uint256 pkX;
    uint256 pkY;
}

contract MagicWorld is IBaseGame {
    uint256 public constant INVALID_INDEX = 999999;

    IShuffleStateManager public shuffle;

    // check whether the caller is the shuffle Manager
    modifier onlyShuffleManager() {
        require(
            address(shuffle) == msg.sender,
            "Caller is not shuffle manager."
        );
        _;
    }

    function cardConfig() external pure override returns (DeckConfig) {
        return DeckConfig.Deck30Card;
    }

    uint256 public largestMWId;

    // a mappping between Hilo Id and game info
    mapping(uint256 => Game) gameInfos;

    event CreateGame(uint256 indexed mwId, uint256 shuffleId, address creator);
    event JoinGame(uint256 indexed mwId, uint256 shuffleId, address joiner);
    event DealEnd(uint256 indexed mwId, address player, uint256 playerIdx);
    event ChooseCard(
        uint256 indexed mwId,
        address player,
        uint256 playerIdx,
        uint256 cardIdx
    );
    event OpenCard(
        uint256 indexed mwId,
        address player,
        uint256 playerIdx,
        uint256 cardIdx,
        uint256 cardValue
    );
    event NextPlayer(uint256 indexed mwId, address player, uint256 playerIdx);
    event EndGame(uint256 indexed mwId, address player, uint256 playerIdx);

    constructor(IShuffleStateManager _shuffle) {
        shuffle = _shuffle;
        largestMWId = 100;
    }

    // create a new game by a player
    // creator should be player 0 in shuffle1 and player 1 in shuffle2
    function createShuffleForCreator(uint256 pkX, uint256 pkY) external {
        ++largestMWId;

        gameInfos[largestMWId].players[0] = msg.sender;
        gameInfos[largestMWId].health[0] = 30;
        gameInfos[largestMWId].shuffleIds[0] = shuffle.createShuffleGame(2);
        gameInfos[largestMWId].pkX = pkX;
        gameInfos[largestMWId].pkY = pkY;

        bytes memory next = abi.encodeWithSelector(
            this.moveToShuffleStage.selector,
            largestMWId,
            gameInfos[largestMWId].shuffleIds[0],
            0
        );
        shuffle.register(gameInfos[largestMWId].shuffleIds[0], next);
        shuffle.playerRegister(
            gameInfos[largestMWId].shuffleIds[0],
            msg.sender,
            pkX,
            pkY
        );

        emit CreateGame(
            largestMWId,
            gameInfos[largestMWId].shuffleIds[0],
            msg.sender
        );
    }

    // create a new game by a player
    // creator should be player 0 in shuffle1 and player 1 in shuffle2
    function createShuffleForJoiner(
        uint256 mwId,
        uint256 pkX,
        uint256 pkY
    ) external {
        require(
            gameInfos[mwId].players[0] != address(0) &&
                gameInfos[mwId].players[1] == address(0),
            "invalid ks id"
        );

        gameInfos[mwId].players[1] = msg.sender;
        gameInfos[mwId].health[1] = 30;
        gameInfos[mwId].shield[1] = 10;
        gameInfos[mwId].shuffleIds[1] = shuffle.createShuffleGame(2);

        bytes memory next = abi.encodeWithSelector(
            this.moveToShuffleStage.selector,
            mwId,
            gameInfos[mwId].shuffleIds[1],
            1
        );
        shuffle.register(gameInfos[mwId].shuffleIds[1], next);

        shuffle.playerRegister(
            gameInfos[mwId].shuffleIds[0],
            msg.sender,
            pkX,
            pkY
        );
        shuffle.playerRegister(
            gameInfos[mwId].shuffleIds[1],
            msg.sender,
            pkX,
            pkY
        );
        shuffle.playerRegister(
            gameInfos[mwId].shuffleIds[1],
            gameInfos[mwId].players[0],
            gameInfos[mwId].pkX,
            gameInfos[mwId].pkY
        );
        delete gameInfos[mwId].pkX;
        delete gameInfos[mwId].pkY;

        emit JoinGame(largestMWId, gameInfos[mwId].shuffleIds[1], msg.sender);
    }

    // Allow players to shuffle the deck, and specify the next state:
    // dealCard0ToPlayer0
    function moveToShuffleStage(
        uint256 mwId,
        uint256 shuffleId,
        uint256 playerIdx
    ) external onlyShuffleManager {
        bytes memory next = abi.encodeWithSelector(
            this.dealCardsToPlayer.selector,
            mwId,
            shuffleId,
            playerIdx
        );
        shuffle.shuffle(shuffleId, next);
    }

    function dealCardsToPlayer(
        uint256 mwId,
        uint256 shuffleId,
        uint256 playerIdx
    ) external onlyShuffleManager {
        BitMaps.BitMap256 memory cards;
        cards._data = 1023; // ...1111111111
        bytes memory next = abi.encodeWithSelector(
            this.moveToChooseStage.selector,
            mwId,
            playerIdx
        );
        shuffle.dealCardsTo(shuffleId, cards, 0, next);
    }

    function moveToChooseStage(
        uint256 mwId,
        uint256 playerIdx
    ) external onlyShuffleManager {
        emit DealEnd(mwId, gameInfos[mwId].players[playerIdx], playerIdx);
    }

    // choose which card to show at this round, shuffleIdx means player's deck
    function chooseCard(
        uint256 mwId,
        uint256 playerIdx,
        uint256 cardIdx
    ) external {
        require(
            msg.sender == gameInfos[mwId].players[playerIdx],
            "invalid player index"
        );
        require(
            playerIdx == gameInfos[mwId].curPlayerIndex,
            "not in your turn"
        );

        bytes memory next = abi.encodeWithSelector(
            this.settle.selector,
            mwId,
            playerIdx,
            cardIdx
        );
        shuffle.openCards(gameInfos[mwId].shuffleIds[playerIdx], 0, 1, next);

        emit ChooseCard(mwId, msg.sender, playerIdx, cardIdx);
    }

    function settle(
        uint256 mwId,
        uint256 playerIdx,
        uint256 cardIdx
    ) external onlyShuffleManager {
        uint256 cardValue = shuffle.queryCardValue(
            gameInfos[mwId].shuffleIds[playerIdx],
            cardIdx
        );
        require(cardValue != shuffle.INVALID_INDEX(), "invalid card value");

        emit OpenCard(
            mwId,
            gameInfos[mwId].players[playerIdx],
            playerIdx,
            cardIdx,
            cardValue
        );

        battle(mwId, playerIdx, cardValue);
    }

    function battle(
        uint256 mwId,
        uint256 playerIdx,
        uint256 cardValue
    ) internal {
        MagicCard memory card = getCardConfig(cardValue);

        // add defense to player health
        gameInfos[mwId].shield[playerIdx] = card.defense;

        // player loses when health <= 0
        if (
            gameInfos[mwId].health[1 - playerIdx] +
                gameInfos[mwId].shield[1 - playerIdx] >
            card.attack
        ) {
            if (gameInfos[mwId].shield[1 - playerIdx] >= card.attack) {
                gameInfos[mwId].shield[1 - playerIdx] -= card.attack;
            } else {
                gameInfos[mwId].health[1 - playerIdx] -=
                    card.attack -
                    gameInfos[mwId].shield[1 - playerIdx];
                gameInfos[mwId].shield[1 - playerIdx] = 0;
            }
            gameInfos[mwId].curPlayerIndex++;
            if (gameInfos[mwId].curPlayerIndex == 2) {
                gameInfos[mwId].curPlayerIndex = 0;
            }
            emit NextPlayer(
                mwId,
                gameInfos[mwId].players[gameInfos[mwId].curPlayerIndex],
                gameInfos[mwId].curPlayerIndex
            );
        } else {
            gameInfos[mwId].health[1 - playerIdx] = 0;
            emit EndGame(mwId, gameInfos[mwId].players[playerIdx], playerIdx);
            shuffle.endGame(gameInfos[mwId].shuffleIds[playerIdx]);
        }
    }

    function getGameInfo(uint256 mwId) external view returns (Game memory) {
        return gameInfos[mwId];
    }

    function getCardConfig(
        uint256 cardValue
    ) internal pure returns (MagicCard memory card) {
        // 0: Wizard
        // 1: Warrior
        // 2: Tank
        uint256 cardType = cardValue / 10;

        if (cardType == 0) {
            card.attack = 16;
            card.defense = 5;
        }
        if (cardType == 1) {
            card.attack = 11;
            card.defense = 10;
        }
        if (cardType == 2) {
            card.attack = 3;
            card.defense = 18;
        }
    }
}
