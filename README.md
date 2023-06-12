This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Illustrate

This branch is from `magic-world` branch

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Game rules
- There are two players: creator and joiner.
- The initial health of the two players is 30.
- The initial shield of joiner is 10.
- The shield only last for one round.
- When the game starts, each player is dealt 10 of 30 cards, which consists of 10 Wizards, 10 Warriors, 10 Tanks.
- During the game, players play cards in turn, and each card has two attributes: attack and defense. Attack will cause damage to the opponent player, defense will provide a one-time shield for player. 
- The game will last for ten rounds. When the player's health drops to 0, the player loses. If none of the players' health drop to 0, the game ended in a draw.
