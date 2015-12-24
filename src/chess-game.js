"use strict";

var React = require('react');
var ReactDOM = require('react-dom');

var ChessBoard = require('./chess-board.js');

var ChessPlayer = require('./chess-player.js');
var ChessComputer = require('./chess-computer.js');

var ChessGame = React.createClass({
  propTypes: {
  },

  getInitialState: function() {
    return {
      players: null
    };
  },

  playerChoices: [
    {
      name: 'Player (white) vs AI',
      players: { 'w': new ChessPlayer(), 'b': new ChessComputer() }
    },
    {
      name: 'Player (black) vs AI',
      players: { 'w': new ChessComputer(), 'b': new ChessPlayer() }
    },
    {
      name: 'Player vs Player',
      players: { 'w': new ChessPlayer(), 'b': new ChessPlayer() }
    },
    {
      name: 'AI vs AI',
      players: { 'w': new ChessComputer(), 'b': new ChessComputer() }
    }
  ],

  pieces: {
    'w': 'piece-P',
    'b': 'piece-p'
  },

  choosePlayers: function(players) {
    this.setState({
      players: players
    });
  },

  render: function() {
    var board = null;
    if (this.state.players) {
      return (
        <ChessBoard players={this.state.players} />
      );
    } else {
      var buttons = this.playerChoices.map(function(playerChoice) {
        var players = playerChoice.players;
        var content = [];
        Object.keys(players).forEach(function(color, index) {
          if (index != 0) {
            content.push('v');
          }
          
          var player = players[color];
          var classNames = 'piece ' + this.pieces[color] + (player.isHuman() ? ' piece-human' : ' piece-ai');

          content.push((
            <div key={name + ' - ' + color} className={classNames} />
          ));
        }.bind(this));

        return (
          <button key={'player-choice-' + playerChoice.name} className="player-choice" onClick={this.choosePlayers.bind(this, players)}>
            {content}
          </button>
        );
      }.bind(this));

      return (
        <div className="button-group">
          {buttons}
        </div>
      );
    }
  }
});

module.exports = ChessGame;
