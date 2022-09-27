# chess

A web-based chess program written in [React](https://facebook.github.io/react/) and [React-dnd](http://gaearon.github.io/react-dnd/) that supports any combination of player vs AI. Includes support for drag and drop for human players and animation effects for computer players.

See it running at [https://andrewmacheret.com/projects/chess](https://andrewmacheret.com/projects/chess).

![Game image](game.png?raw=true "Game image")

Prereqs:

- [Node.js](https://nodejs.org/)
- Yarn: `npm install -g yarn`
- [andrewmacheret/chess-server](https://github.com/andrewmacheret/chess-server) or [andrewmacheret/chess-server-lambda](https://github.com/andrewmacheret/chess-server-lambda)

Run:

- Modify `movesUrl` in [public/app.json](public/app.json) as needed
- `yarn`
- `yarn start`

Build and deploy:

- `yarn build`
- `aws s3 sync --delete build/ s3://andrewmacheret.com/projects/chess/`

Test it:

- `yarn test`
- Browser: [http://localhost:3000](http://localhost:3000)
  - You should see several buttons asking what kind of chess game to play.
  - To troubleshoot, look for javascript errors in the browser console.
