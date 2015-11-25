"use strict";

function clone(obj) {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) {
    return obj;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }

  // Shallow copy anything else
  return obj;
}

var ChessState = function($options) {
  var $public = this;
  var $private = {
    fields: {},

    START_FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',

    VALID_PIECES: 'rnbqkpRNBQKP',

    VALID_CASTLE_SIDES: 'kqKQ',

    VALID_PLAYERS: 'wb',

    init: function() {
      if (!$options) $options = {};
      if ($options.chessState) {
        // copy constructor
        this.copy($options.chessState);
      } else {
        // fen constructor
        this.fromFen($options.fen || this.START_FEN);
      }

      // public methods
      $public.copyFields = this.copyFields.bind(this);
      $public.getPiece = this.getPiece.bind(this);
      $public.removePiece = this.removePiece.bind(this);
      $public.addPiece = this.addPiece.bind(this);
      $public.getCastle = this.getCastle.bind(this);
      $public.setCastle = this.setCastle.bind(this);
      $public.getEnPassant = this.getEnPassant.bind(this);
      $public.setEnPassant = this.setEnPassant.bind(this);
      $public.resetEnPassant = this.resetEnPassant.bind(this);
      $public.incrementHalfMoves = this.incrementHalfMoves.bind(this);
      $public.resetHalfMoves = this.resetHalfMoves.bind(this);
      $public.incrementMoveNumber = this.incrementMoveNumber.bind(this);
      $public.resetMoveNumber = this.resetMoveNumber.bind(this);
      $public.isPromoting = this.isPromoting.bind(this);
      $public.setPromoting = this.setPromoting.bind(this);
      $public.getMoves = this.getMoves.bind(this);
      $public.addMove = this.addMove.bind(this);
      $public.resetMoves = this.resetMoves.bind(this);
      $public.getLastMove = this.getLastMove.bind(this);
      $public.getCaptured = this.getCaptured.bind(this);
      $public.addCaptured = this.addCaptured.bind(this);
      $public.resetCaptured = this.resetCaptured.bind(this);
      $public.setPlayer = this.setPlayer.bind(this);
      $public.getPlayer = this.getPlayer.bind(this);
      $public.getPlayers = this.getPlayers.bind(this);
      $public.getBoardSize = this.getBoardSize.bind(this);
      $public.inBounds = this.inBounds.bind(this);
      $public.toFen = this.toFen.bind(this);
      $public.copy = this.copy.bind(this);
      $public.getLastState = this.getLastState.bind(this);
      $public.isSamePosition = this.isSamePosition.bind(this);
      $public.getHalfMoves = this.getHalfMoves.bind(this);

      return this;
    },

    // needed for copy constructor
    copyFields: function() {
      return clone(this.fields);
    },

    getPiece: function(square) {
      if (!this.inBounds(square)) {
        throw JSON.stringify(square) + ' is not in bounds';
      }

      return this.fields.pieces[square.rowNumber][square.columnNumber];
    },

    removePiece: function(square) {
      if (!this.inBounds(square)) {
        throw JSON.stringify(square) + ' is not in bounds';
      }
      if (this.fields.pieces[square.rowNumber][square.columnNumber] == null) {
        throw JSON.stringify(square) + ' is empty';
      }

      var oldPiece = this.fields.pieces[square.rowNumber][square.columnNumber];

      this.fields.pieces[square.rowNumber][square.columnNumber] = null;

      return oldPiece;
    },

    addPiece: function(square, piece) {
      if (!this.inBounds(square)) {
        throw JSON.stringify(square) + ' is not in bounds';
      }
      if (this.VALID_PIECES.indexOf(piece) < 0) {
        throw 'must add a valid piece (valid pieces: ' + JSON.stringify(this.VALID_PIECES) + ')';
      }

      this.fields.pieces[square.rowNumber][square.columnNumber] = piece;
    },

    getCastle: function(side) {
      if (this.VALID_CASTLE_SIDES.indexOf(side) < 0) {
        throw 'must specify a valid castle side (valid castle sides: ' + JSON.stringify(this.VALID_CASTLE_SIDES) + ')';
      }

      return this.fields.castles[side];
    },

    setCastle: function(side, allowed) {
      if (this.VALID_CASTLE_SIDES.indexOf(side) < 0) {
        throw 'must specify a valid castle side (valid castle sides: ' + JSON.stringify(this.VALID_CASTLE_SIDES) + ')';
      }

      this.fields.castles[side] = !!allowed;
    },

    getEnPassant: function() {
      return this.fields.enPassant;
    },

    setEnPassant: function(enPassant) {
      if (!this.inBounds(enPassant)) {
        throw JSON.stringify(enPassant) + ' is not in bounds';
      }

      this.fields.enPassant = enPassant;
    },

    resetEnPassant: function() {
      this.fields.enPassant = null;
    },

    incrementHalfMoves: function() {
      this.fields.halfMoves += 1;
    },

    resetHalfMoves: function() {
      this.fields.halfMoves = 0;
    },

    incrementMoveNumber: function() {
      this.fields.moveNumber += 1;
    },
    
    resetMoveNumber: function() {
      this.fields.moveNumber = 0;
    },

    isPromoting: function() {
      return this.fields.promoting;
    },

    setPromoting: function(promoting) {
      this.fields.promoting = !!promoting;
    },

    setPlayer: function(player) {
      if (this.VALID_PLAYERS.indexOf(player) < 0) {
        throw 'must set a valid player (valid players: ' + JSON.stringify(this.VALID_PLAYERS) + ')';
      }

      this.fields.player = player;
    },

    getPlayer: function() {
      return this.fields.player;
    },

    getPlayers: function() {
      return this.VALID_PLAYERS.split('');
    },

    getMoves: function(player) {
      if (this.VALID_PLAYERS.indexOf(player) < 0) {
        throw 'must specify a valid player (valid players: ' + JSON.stringify(this.VALID_PLAYERS) + ')';
      }

      return this.fields.moves[player];
    },

    addMove: function(player, move) {
      if (move == null) {
        throw 'move must be specified';
      }

      this.fields.lastMove = move;
      this.fields.moves[player].push(move);
    },

    resetMoves: function() {
      this.fields.moves = {};
      for (var p = 0; p < this.VALID_PLAYERS.length; p++) {
        var player = this.VALID_PLAYERS[p];
        this.fields.moves[player] = [];
      }
      this.fields.lastMove = null;
    },

    getLastMove: function() {
      return this.fields.lastMove ;
    },

    getCaptured: function(player) {
      if (this.VALID_PLAYERS.indexOf(player) < 0) {
        throw 'must specify a valid player (valid players: ' + JSON.stringify(this.VALID_PLAYERS) + ')';
      }

      return this.fields.captured[player];
    },

    addCaptured: function(player, piece) {
      if (this.VALID_PIECES.indexOf(piece) < 0) {
        throw 'must add a valid piece (valid pieces: ' + JSON.stringify(this.VALID_PIECES) + ')';
      }

      this.fields.captured[player].push(piece);
    },

    resetCaptured: function() {
      this.fields.captured = {};
      for (var p = 0; p < this.VALID_PLAYERS.length; p++) {
        var player = this.VALID_PLAYERS[p];
        this.fields.captured[player] = [];
      }
    },

    getBoardSize: function() {
      return this.fields.boardSize;
    },

    getHalfMoves: function() {
      return this.fields.halfMoves;
    },

    getMoveNumber: function() {
      return this.fields.moveNumber;
    },

    inBounds: function(square) {
      var boardSize = this.fields.boardSize;
      return square.rowNumber >= 0
        && square.rowNumber < boardSize.height
        && square.columnNumber >= 0
        && square.columnNumber < boardSize.width;
    },

    copy: function(chessState) {
      this.fields = chessState.copyFields();
      this.lastChessState = chessState;
    },

    getLastState: function() {
      return this.lastChessState
    },

    isSamePosition: function(chessState) {
      var boardSize = this.fields.boardSize;
      for (var rowNumber = 0; rowNumber < boardSize.height; rowNumber++) {
        for (var columnNumber = 0; columnNumber < boardSize.width; columnNumber++) {
          var source = {rowNumber: rowNumber, columnNumber: columnNumber};
          if (this.getPiece(source) != chessState.getPiece(source)) {
            return false;
          }
        }
      }
      return true;
    },

    initBasicFields: function() {
      this.fields.boardSize = {width: 8, height: 8};
      this.setPromoting(false);
      this.resetMoves();
      this.resetCaptured();
    },

    fromFen: function(fen) {
      var fenParts = fen.split(' ');

      // init basic fields that are always the same at the start of a game
      this.initBasicFields();

      // init everything given by the fen string
      this.fields.fen = fen;
      this.fields.pieces = this.fromFenPieces(fenParts[0]);
      this.fields.player = this.fromFenPlayer(fenParts[1]);
      this.fields.castles = this.fromFenCastles(fenParts[2]);
      this.fields.enPassant = this.fromFenEnPassant(fenParts[3]);
      this.fields.halfMoves = this.fromFenHalfMoves(fenParts[4]);
      this.fields.moveNumber = this.fromFenMoveNumber(fenParts[5]);
    },

    fromFenPieces: function(fenPart) {
      var boardSize = this.getBoardSize();

      var fenRows = fenPart.split('/');
      var pieces = [];
      for (var rowNumber = 0; rowNumber < boardSize.height; rowNumber++) {
        var row = [];
        var fenRow = fenRows[rowNumber];
        for (var i = 0; i < fenRow.length; i++) {
          var fenChar = fenRow.charAt(i);
          var skip = parseInt(fenChar, 10);
          if (!isNaN(skip)) {
            for (var j = 0; j < skip; j++) {
              // no piece
              row.push(null);
            }
            i += skip - 1;
            continue;
          }
          row.push(fenChar);
        }
        pieces.push(row);
      }
      return pieces;
    },

    fromFenCastles: function(fenPart) {
      var castles = {};
      for (var s = 0; s < this.VALID_CASTLE_SIDES.length; s++) {
        var side = this.VALID_CASTLE_SIDES[s];
        castles[side] = fenPart.indexOf(side) >= 0;
      }
      return castles;
    },

    fromFenEnPassant: function(fenPart) {
      var boardSize = this.getBoardSize();

      var fenPart;
      if (fenPart == '-') {
        return null;
      } else {
        return {
          rowNumber: boardSize.height - (fenPart.charCodeAt(1) - '1'.charCodeAt(0)) - 1,
          columnNumber: fenPart.charCodeAt(0) - 'a'.charCodeAt(0)
        };
      }
    },

    fromFenPlayer: function(fenPart) {
      return fenPart;
    },
    
    fromFenHalfMoves: function(fenPart) {
      return parseInt(fenPart, 10);
    },

    fromFenMoveNumber: function(fenPart) {
      return parseInt(fenPart, 10);
    },

    toFen: function() {
      return [
        this.toFenPieces(),
        this.toFenPlayer(),
        this.toFenCastles(),
        this.toFenEnPassant(),
        this.toFenHalfMoves(),
        this.toFenMoveNumber()
      ].join(' ');
    },

    toFenPieces: function() {
      var boardSize = this.getBoardSize();

      var pieceRows = [];
      for (var rowNumber = 0; rowNumber < boardSize.height; rowNumber++) {
        var pieceRow = [];
        var lastPiece = null;
        for (var columnNumber = 0; columnNumber < boardSize.width; columnNumber++) {
          var piece = this.getPiece({rowNumber: rowNumber, columnNumber: columnNumber});
          if (piece != null) {
            pieceRow.push(piece);
          } else {
            if (columnNumber == 0 || lastPiece != null) {
              pieceRow.push('1');
            } else {
              // add 1 to the previous number
              var index = pieceRow.length - 1;
              pieceRow[index] = (parseInt(pieceRow[index], 10) + 1).toString();
            }
          }
          lastPiece = piece;
        }
        pieceRows.push(pieceRow.join(''));
      }
      return pieceRows.join('/');
    },

    toFenPlayer: function() {
      return this.getPlayer();
    },
    
    toFenCastles: function() {
      var castles = '';
      for (var s = 0; s < this.VALID_CASTLE_SIDES.length; s++) {
        var side = this.VALID_CASTLE_SIDES[s];
        if (this.getCastle(side)) {
          castles += side;
        }
      }
      if (castles == '') {
        return '-';
      }
      return castles;
    },
    
    toFenEnPassant: function() {
      var enPassant = this.getEnPassant();
      if (!enPassant) {
        return '-';
      }

      var boardSize = this.getBoardSize();
      var row = String.fromCharCode('a'.charCodeAt(0) + enPassant.columnNumber);
      var column = String.fromCharCode('1'.charCodeAt(0) + (boardSize.height - enPassant.rowNumber - 1));
      return row + column;
    },
    
    toFenHalfMoves: function() {
      return this.getHalfMoves().toString();
    },
    
    toFenMoveNumber: function() {
      return this.getMoveNumber().toString();
    }

  }.init();
};

module.exports = ChessState;
