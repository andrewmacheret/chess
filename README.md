# chess

A web-based chess program written in [React](https://facebook.github.io/react/) and [React-dnd](http://gaearon.github.io/react-dnd/) that supports any combination of player vs AI. Includes support for drag and drop for human players and animation effects for computer players.

See it running at [https://andrewmacheret.com/projects/chess](https://andrewmacheret.com/projects/chess).

![Game image](game.png?raw=true "Game image")

Prereqs:

- [Node.js](https://nodejs.org/)
- [andrewmacheret/chess-server](https://github.com/andrewmacheret/chess-server) or [andrewmacheret/chess-server-lambda](https://github.com/andrewmacheret/chess-server-lambda)

Installation steps:

- `npm install` or `yarn install`
- Modify `movesUrl` in [public/app.properties](public/app.properties) as needed
- `npm start` or `yarn start`

Test it:

- Open `build/index.html` in a browser.
- For testing purposes, if you don't have a web server, running `python -m SimpleHTTPServer` in the `build/` directory and navigating to [http://localhost:8000](http://localhost:8000) should do the trick.
- You should see several buttons asking what kind of chess game to play.
- To troubleshoot, look for javascript errors in the browser console.
