"use strict";

var React = require('react');
var ReactDOM = require('react-dom');

var isTouchDevice = 'ontouchstart' in document.documentElement;
var HTML5Backend = require('react-dnd-html5-backend');
var TouchBackend = require('react-dnd-touch-backend');
var DragBackend = isTouchDevice ? TouchBackend : HTML5Backend;
var DragDropContext = require('react-dnd').DragDropContext;

var ChessSquare = require('./chess-square.js');
var ChessPiece = require('./chess-piece.js');

var ChessRules = require('./chess-rules.js');
var ChessState = require('./chess-state.js');
var ChessMove = require('./chess-move.js');

var ChessBoard = React.createClass({
  propTypes: {
    players: React.PropTypes.object.isRequired
  },

  getLegalMoves: function(sourceSquare, targetSquare, promotion) {
    var move = {
      source: this.getRowColumn(sourceSquare),
      target: this.getRowColumn(targetSquare)
    };

    var legalMoves = [];

    for (var m = 0; m < this.state.gameStatus.legalMoves.length; m++) {
      var legalMove = this.state.gameStatus.legalMoves[m];
      
      // source must match
      if (!(legalMove.source.rowNumber == move.source.rowNumber && legalMove.source.columnNumber == move.source.columnNumber)) {
        continue;
      }
      
      // if target is specified, target must match
      if (move.target != null && !(legalMove.target.rowNumber == move.target.rowNumber && legalMove.target.columnNumber == move.target.columnNumber)) {
        continue;
      }

      // if promotion is specified, promotion must match
      if (promotion && !(promotion.toUpperCase() == (legalMove.promotion || '').toUpperCase())) {
        continue;
      }

      legalMoves.push(legalMove);
    }

    return legalMoves;
  },

  canMove: function(sourceSquare, targetSquare, promotion) {
    //console.log('can perform move?: ' + sourceSquare + ' -> ' + targetSquare);
    
    return this.state.currentPlayer.isHuman() && this.getLegalMoves(sourceSquare, targetSquare, promotion).length != 0;
  },

  move: function(sourceSquare, targetSquare, promotion) {
    //console.log('performing move: ' + sourceSquare + ' -> ' + targetSquare);

    var legalMoves = this.getLegalMoves(sourceSquare, targetSquare, promotion);

    var move;
    if (legalMoves.length == 0) {
      throw 'Impossible attempt to move ' + sourceSquare + ' -> ' + targetSquare;
    } else if (legalMoves.length == 1) {
      move = legalMoves[0];
    } else {
      // the only way this could happen is if we're promoting and there are choices
      // lets do this the easy way
      var choices = legalMoves.map(function(legalMove) {
        return legalMove.promotion;
      });
      this.state.currentPlayer.choosePromotion(sourceSquare, targetSquare, choices, this.move);
      return;
    }

    // perform the move
    var state = {};
    state.chessState = ChessRules.performMove(this.state.chessState, move);

    // update the current state
    var lastPlayer = this.props.players[state.chessState.getLastMove().player];
    var currentPlayer = this.props.players[state.chessState.getPlayer()];
    state.gameStatus = ChessRules.getGameStatus(state.chessState);
    state.fen = state.chessState.toFen();
    state.bestMove = null;
    state.lastPlayer = lastPlayer;
    state.currentPlayer = currentPlayer;
    state.futureChessStates = [];

    // save the new state
    this.setState(state);

    // start the move request
    this.state.currentPlayer.requestMove(this.state.fen, this.move);
  },

  undo: function(count) {
    // get the correct chess state
    var lastChessState = this.state.chessState.getLastState();
    for (var i = 0; i < (count || 1); i++) {
      lastChessState = lastChessState.getLastState();
    }
    // ensure there is a last chess state
    if (!lastChessState) return;

    // store the last chess state
    this.state.chessState = lastChessState;
    this.state.futureChessStates.push(lastChessState);

    // update the current state
    var lastMove = this.state.chessState.getLastMove();
    var lastPlayer = lastMove != null ? this.props.players[lastMove.player] : null;
    var currentPlayer = this.props.players[this.state.chessState.getPlayer()];
    this.state.gameStatus = ChessRules.getGameStatus(this.state.chessState);
    this.state.fen = this.state.chessState.toFen();
    this.state.bestMove = null;
    this.state.lastPlayer = lastPlayer;
    this.state.currentPlayer = currentPlayer;

    // save the new state
    this.setState(this.state);

    // do not automatically perform a move!
  },

  redo: function() {
    // ensure there is a future chess state
    var nextChessState = this.state.futureChessStates.pop();
    if (!nextChessState) return;

    // store the next chess state
    this.state.chessState = nextChessState;

    // update the current state
    var lastMove = this.state.chessState.getLastMove();
    var lastPlayer = lastMove != null ? this.props.players[lastMove.player] : null;
    var currentPlayer = this.props.players[this.state.chessState.getPlayer()];
    this.state.gameStatus = ChessRules.getGameStatus(this.state.chessState);
    this.state.fen = this.state.chessState.toFen();
    this.state.bestMove = null;
    this.state.lastPlayer = lastPlayer;
    this.state.currentPlayer = currentPlayer;

    // save the new state
    this.setState(this.state);

    // do not automatically perform a move!
  },

  getRowColumn: function(squareRef) {
    if (!squareRef) return null;
    var boardSize = this.state.chessState.getBoardSize();
    var name = squareRef.split('-')[1];
    var columnNumber = name.charCodeAt(0) - 'a'.charCodeAt(0);
    var rowNumber = boardSize.height - (name.charCodeAt(1) - '1'.charCodeAt(0)) - 1;
    return {rowNumber: rowNumber, columnNumber: columnNumber};
  },

  getSquareRef: function(rowNumber, columnNumber) {
    var boardSize = this.state.chessState.getBoardSize();
    var row = String.fromCharCode('a'.charCodeAt(0) + columnNumber);
    var column = String.fromCharCode('1'.charCodeAt(0) + (boardSize.height - rowNumber - 1));
    return 'square-' + row + column;
  },

  getInitialState: function() {
    var chessState = new ChessState();
    var gameStatus = ChessRules.getGameStatus(chessState);
    var fen = chessState.toFen();
    var lastPlayer = null;
    var currentPlayer = this.props.players[chessState.getPlayer()];

    currentPlayer.requestMove(fen, this.move);

    return {
      chessState: chessState,
      gameStatus: gameStatus,
      fen: fen,
      lastPlayer: lastPlayer,
      currentPlayer: currentPlayer
    };
  },

  render: function() {
    // animate if computer, don't animate if human
    var animate = this.state.lastPlayer && !this.state.lastPlayer.isHuman();

    var chessState = this.state.chessState;
    var boardSize = chessState.getBoardSize();
    var squares = [];
    for (var rowNumber = 0; rowNumber < boardSize.height; rowNumber++) {
      for (var columnNumber = 0; columnNumber < boardSize.width; columnNumber++) {
        var ref = this.getSquareRef(rowNumber, columnNumber);
        
        var lastMove = chessState.getLastMove();

        var pieces = [];
        var pieceLetter = chessState.getPiece({rowNumber: rowNumber, columnNumber: columnNumber});
        if (pieceLetter) {
          var move = null;
          if (lastMove && lastMove.target.rowNumber == rowNumber && lastMove.target.columnNumber == columnNumber) {
            move = lastMove;
          } else if (lastMove && lastMove.secondaryMove && lastMove.secondaryMove.target.rowNumber == rowNumber && lastMove.secondaryMove.target.columnNumber == columnNumber) {
            move = lastMove.secondaryMove;
          }

          pieces.push((
            <ChessPiece animate={animate} move={move} key={pieceLetter} originSquare={ref} pieceLetter={pieceLetter} canMove={this.canMove} />
          ));

          if (move && move.capture) {
            pieces.push((
              <ChessPiece animate={animate} capture={true} key={pieceLetter + '-capture'} originSquare={ref} pieceLetter={move.capture} />
            ));
          }

        } else if (lastMove && lastMove.enPassant && lastMove.enPassant.rowNumber == rowNumber && lastMove.enPassant.columnNumber == columnNumber) {
          pieces.push((
            <ChessPiece animate={animate} move={lastMove} key={pieceLetter + '-capture'} originSquare={ref} pieceLetter={lastMove.capture} />
          ));
        }

        squares.push((
          <ChessSquare animate={animate} name={ref} key={ref} ref={ref} rowNumber={rowNumber} columnNumber={columnNumber} boardSize={boardSize} canMove={this.canMove} move={this.move}>
            {pieces}
          </ChessSquare>
        ));
      }
    }

    var captured = this.state.chessState.getPlayers().map(function(player) {
      var playerCaptured = this.state.chessState.getCaptured(player).map(function(capture, index) {
        return (
          <ChessPiece key={'captured-' + player + '-' + index} pieceLetter={capture} />
        );
      }.bind(this));

      return (
        <div key={'captured-' + player} className={'captured-' + player}>
          {playerCaptured}
        </div>
      );
    }.bind(this));

    var moves = this.state.chessState.getPlayers().map(function(player) {
      var playerMoves = this.state.chessState.getMoves(player).map(function(move, index) {
        return (
          <div key={'move-' + player + '-' + index} className="move">
            {move.toPGN()}
          </div>
        );
      }.bind(this));

      return (
        <div key={'moves-' + player} className={'moves-' + player}>
          {playerMoves}
        </div>
      );
    }.bind(this));

    return (
      <div className="board-wrapper">
        <div className="board">
          <div className="squares">
            {squares}
          </div>
        </div>
        <div className="captured">
          {captured}
        </div>
        <div className="moves">
          {moves}
        </div>
        <div id="game-state">{this.state.gameStatus.message}</div>
        <div id="fen">{this.state.fen}</div>
        <div id="best-move">{this.state.bestMove ? this.state.bestMove : ''}</div>
      </div>
    );
  }
});

module.exports = DragDropContext(DragBackend)(ChessBoard);
