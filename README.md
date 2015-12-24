# chess

![Game image](src/images/game.png?raw=true "Game image")

A web-based chess program written in [React](https://facebook.github.io/react/) and [React-dnd](http://gaearon.github.io/react-dnd/) that supports any combination of player vs AI. Includes support for drag and drop for human players and animation effects for computer players.

See it running at [http://andrewmacheret.com/projects/chess](http://andrewmacheret.com/projects/chess).

Prereqs:
* [Node.js](https://nodejs.org/) and [gulp](http://browserify.org/) on a linux server
 * `npm install -g gulp` to install gulp if you already have Node.js
* [andrewmacheret/chess-server](https://github.com/andrewmacheret/chess-server)
* A web server (like [Apache](https://httpd.apache.org/)).

Installation steps:
* `git clone <clone url>`
* `cd chess/`
* `npm install` - this will install required packages as specified in [package.json](package.json)
* Modify `movesUrl` in [app.properties](app.properties) as needed
* `gulp build` - this will build all required files to the `build/` directory

Test it:
* Open `build/index.html` in a browser.
 * For testing purposes, if you don't have a web server, running `python -m SimpleHTTPServer` in the project directory and navigating to [http://localhost:8000](http://localhost:8000) should do the trick.
* You should see several buttons asking what kind of chess game to play.
* To troubleshoot, look for javascript errors in the browser console.

