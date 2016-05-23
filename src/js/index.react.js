var React = require('react');
var ReactDOM = require('react-dom');

var ChessGame = require('./components/ChessGame.react');

ReactDOM.render((
    <ChessGame />
  ),
  document.getElementById('content')
);
