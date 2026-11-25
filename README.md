# chess

[![Test, build and deploy](https://github.com/andrewmacheret/chess/actions/workflows/deploy.yml/badge.svg)](https://github.com/andrewmacheret/chess/actions/workflows/deploy.yml) [![Canary](https://github.com/andrewmacheret/chess/actions/workflows/canary.yml/badge.svg)](https://github.com/andrewmacheret/chess/actions/workflows/canary.yml) [![License](https://img.shields.io/badge/license-MIT-lightgray.svg)](https://github.com/andrewmacheret/chess/blob/master/LICENSE.md)

A web-based chess program written in [React](https://react.dev/) that supports any combination of player vs AI. Human players can drag a piece with a mouse, finger or pen, or click a piece and then the square to move it to. Computer moves are animated. Follows your system's light or dark mode.

See it running at [https://andrewmacheret.com/projects/chess](https://andrewmacheret.com/projects/chess).

![Game image](public/game.png?raw=true "Game image")

Prereqs:

- [Node.js](https://nodejs.org/) 24 (see [.nvmrc](.nvmrc))

AI engine:

- The AI is [Stockfish 19](https://github.com/nmrugg/stockfish.js) (the lite, single-threaded WebAssembly build) running in the browser in a web worker. It starts downloading in the background when the page loads (about 1.2 MB gzipped).
- `depth` in [public/app.json](public/app.json) sets how deep Stockfish searches. Each search also stops after 3 seconds.
- Stockfish is GPL-3.0. It's served as its own files, and the page links to its source and license.
- The AI used to run on AWS Lambda in [andrewmacheret/chess-server-lambda](https://github.com/andrewmacheret/chess-server-lambda), which is now archived.

Pieces:

- The pieces in [src/pieces](src/pieces) are the "cburnett" SVG set by Colin M.L. Burnett (GPLv2+), copied from [lichess](https://github.com/lichess-org/lila/tree/master/public/piece/cburnett).

Run:

- `npm install`
- `npm run dev`
- Browser: [http://localhost:5173](http://localhost:5173)
  - You should see four buttons asking what kind of chess game to play.

Test and build:

- `npm test`
- `npm run build` writes the site to `dist/`

Deploy:

- Pushing to `master` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which tests, builds, uploads `dist/` to `s3://andrewmacheret.com/projects/chess/`, and clears the CloudFront cache.
- It signs in to AWS with GitHub OIDC using the role in the repo variable `AWS_ROLE_ARN`. The CloudFront distribution ID is in the repo variable `CLOUDFRONT_DISTRIBUTION_ID`.

## Health check

Once a day, the Canary workflow (`.github/workflows/canary.yml`) checks the page and its scripts and styles, plus the Stockfish engine files the scripts load. It's started by [andrewmacheret/canary](https://github.com/andrewmacheret/canary).
