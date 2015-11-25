![Game image](game2.png?raw=true "Game")

A web-based chess program written in [React](https://facebook.github.io/react/) and [React-dnd](http://gaearon.github.io/react-dnd/) that supports any combination of player vs AI. Includes support for drag and drop for human players and animation effects for computer players.

See it running at [http://andrewmacheret.com/projects/chess](http://andrewmacheret.com/projects/chess).

Prereqs:
* [Node.js](https://nodejs.org/) and [Browserify](http://browserify.org/) on a linux server
* [andrewmacheret/chess-server](https://github.com/andrewmacheret/chess-server)
* A web server (like [Apache](https://httpd.apache.org/)).

Installation steps:
* `git clone <clone url>`
* `cd chess/`
* `./setup.sh`
* Modify `movesUrl` in `settings.js` as needed
* `./compile.sh` - this will generate the required `bundle.js` file.

Test it:
* Open `index.html` in a browser. For testing purposes, if you don't have a web server, running `python -m SimpleHTTPServer` in the project directory and navigating to [http://localhost:8000](http://localhost:8000) should do the trick.
* You should see several buttons asking what kind of chess game to play. To troubleshoot, look for javascript errors in the browser console.

