# chess

A web-based chess program written in [React](https://react.dev/) and [React DnD](https://react-dnd.github.io/react-dnd/) that supports any combination of player vs AI. Includes support for drag and drop for human players and animation effects for computer players. Follows your system's light or dark mode.

See it running at [https://andrewmacheret.com/projects/chess](https://andrewmacheret.com/projects/chess).

![Game image](public/game.png?raw=true "Game image")

Prereqs:

- [Node.js](https://nodejs.org/) 24 (see [.nvmrc](.nvmrc))
- [andrewmacheret/chess-server-lambda](https://github.com/andrewmacheret/chess-server-lambda) for the AI moves

Run:

- Modify `movesUrl` in [public/app.json](public/app.json) as needed
- `npm install`
- `npm run dev`
- Browser: [http://localhost:5173](http://localhost:5173)
  - You should see four buttons asking what kind of chess game to play.
  - The AI API only allows requests from `https://andrewmacheret.com`, so AI games need a local API or a change to its CORS settings.

Test and build:

- `npm test`
- `npm run build` writes the site to `dist/`

Deploy:

- Pushing to `master` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which tests, builds, uploads `dist/` to `s3://andrewmacheret.com/projects/chess/`, and clears the CloudFront cache.
- It signs in to AWS with GitHub OIDC using the role in the repo variable `AWS_ROLE_ARN`. The CloudFront distribution ID is in the repo variable `CLOUDFRONT_DISTRIBUTION_ID`.
