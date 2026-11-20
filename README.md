# chess

A web-based chess program written in [React](https://react.dev/) and [React DnD](https://react-dnd.github.io/react-dnd/) that supports any combination of player vs AI. Includes support for drag and drop for human players and animation effects for computer players. Follows your system's light or dark mode.

See it running at [https://andrewmacheret.com/projects/chess](https://andrewmacheret.com/projects/chess).

![Game image](public/game.png?raw=true "Game image")

Prereqs:

- [Node.js](https://nodejs.org/) 24 (see [.nvmrc](.nvmrc))

AI engine:

- By default the AI is [Stockfish 19](https://github.com/nmrugg/stockfish.js) (the lite, single-threaded WebAssembly build) running in the browser in a web worker. It starts downloading in the background when the page loads (about 1.2 MB gzipped).
- It can also use [andrewmacheret/chess-server-lambda](https://github.com/andrewmacheret/chess-server-lambda) instead. If the browser engine fails, the server is used as a backup.
- Settings in [public/app.json](public/app.json):
  - `engine`: `local` (browser) or `server` (Lambda)
  - `movesUrl`: the Lambda API, used for `server` and as the backup
  - `depth`: how deep Stockfish searches (each search also stops after 3 seconds)
- Add `?engine=server` or `?engine=local` to the page URL to override `engine`.
- Stockfish is GPL-3.0. It's served as its own files, and the page links to its source and license.

Run:

- `npm install`
- `npm run dev`
- Browser: [http://localhost:5173](http://localhost:5173)
  - You should see four buttons asking what kind of chess game to play.
  - The Lambda API only allows requests from `https://andrewmacheret.com`, so `?engine=server` doesn't work locally.

Test and build:

- `npm test`
- `npm run build` writes the site to `dist/`

Deploy:

- Pushing to `master` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which tests, builds, uploads `dist/` to `s3://andrewmacheret.com/projects/chess/`, and clears the CloudFront cache.
- It signs in to AWS with GitHub OIDC using the role in the repo variable `AWS_ROLE_ARN`. The CloudFront distribution ID is in the repo variable `CLOUDFRONT_DISTRIBUTION_ID`.
