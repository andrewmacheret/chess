"use strict";

var React = require('react');
var ReactDOM = require('react-dom');

var ChessBoard = require('./chess-game.js');

ReactDOM.render((
    <ChessBoard />
  ),
  document.getElementById('content')
);
