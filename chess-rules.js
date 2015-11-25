"use strict";

var ChessState = require('./chess-state.js');
var ChessMove = require('./chess-move.js');

var ChessRules = function() {
  var $public = this;
  var $private = {
    init: function() {
      $public.performMove = this.performMove.bind(this);
      $public.getGameStatus = this.getGameStatus.bind(this);

      return this;
    },

    getLegalMoves: function(chessState, options) {
      if (!options) options = {};
      var allowKingInCheck = options.allowKingInCheck;
      var skipFinalizingMoves = options.skipFinalizingMoves;

      var legalMoves = [];

      var boardSize = chessState.getBoardSize();
      var isWhitePlayer = (chessState.getPlayer() == 'w');

      for (var rowNumber = 0; rowNumber < boardSize.height; rowNumber++) {
        for (var columnNumber = 0; columnNumber < boardSize.width; columnNumber++) {
          var source = {rowNumber: rowNumber, columnNumber: columnNumber};
          var piece = chessState.getPiece(source);

          // only allow pieces to move
          if (piece == null) {
            continue;
          }

          // only allow the current player to move
          if (isWhitePlayer != this.isWhite(piece)) {
            continue;
          }

          // find out which moves are legal based on the piece type
          var pieceType = piece.toLowerCase();
          if (pieceType == 'p') {

            // pawns are crazy...
            // * they can advance 1 space (non-capture)
            // * they can sometimes advance 2 spaces (non-capture)
            // * they can capture diagonally 1 space
            // * they can capture via the en passant rule
            // * they promote when they reach the end row
            legalMoves = legalMoves.concat(this.getLegalMovesPawn(chessState, source));

          } else if (pieceType == 'r') {

            // rooks can move infinitely horizontally and vertically
            var directions = [
              {x:  1, y:  0},
              {x:  0, y:  1},
              {x: -1, y:  0},
              {x:  0, y: -1}
            ];
            var oneSpace = false;
            legalMoves = legalMoves.concat(this.getLegalMovesGeneric(chessState, source, directions, oneSpace));

          } else if (pieceType == 'n') {

            // knights move in an L shape
            var directions = [
              {x:  2, y:  1},
              {x:  1, y:  2},
              {x: -1, y:  2},
              {x: -2, y:  1},
              {x: -2, y: -1},
              {x: -1, y: -2},
              {x:  1, y: -2},
              {x:  2, y: -1}
            ];
            var oneSpace = true;
            legalMoves = legalMoves.concat(this.getLegalMovesGeneric(chessState, source, directions, oneSpace));

          } else if (pieceType == 'b') {

            // bishops move infinitely diagonally
            var directions = [
              {x:  1, y:  1},
              {x: -1, y:  1},
              {x: -1, y: -1},
              {x:  1, y: -1}
            ];
            var oneSpace = false;
            legalMoves = legalMoves.concat(this.getLegalMovesGeneric(chessState, source, directions, oneSpace));

          } else if (pieceType == 'q') {

            // queens move infinitely horizontally, vertically and diagonally
            var directions = [
              {x:  1, y:  0},
              {x:  1, y:  1},
              {x:  0, y:  1},
              {x: -1, y:  1},
              {x: -1, y:  0},
              {x: -1, y: -1},
              {x:  0, y: -1},
              {x:  1, y: -1}
            ];
            var oneSpace = false;
            legalMoves = legalMoves.concat(this.getLegalMovesGeneric(chessState, source, directions, oneSpace));

          } else if (pieceType == 'k') {

            // kings move one step horizontally, vertically and diagonally
            var directions = [
              {x:  1, y:  0},
              {x:  1, y:  1},
              {x:  0, y:  1},
              {x: -1, y:  1},
              {x: -1, y:  0},
              {x: -1, y: -1},
              {x:  0, y: -1},
              {x:  1, y: -1}
            ];
            var oneSpace = true;
            legalMoves = legalMoves.concat(this.getLegalMovesGeneric(chessState, source, directions, oneSpace));

            // kings can also castle
            legalMoves = legalMoves.concat(this.getLegalMovesCastle(chessState, source));
          }
        }
      }

      var finalMoves;
      if (allowKingInCheck) {
        // skip the next part if we will allow the king to be in check
        finalMoves = legalMoves;
      } else {
        // filter out moves that leave the king in check
        var finalMoves = [];
        for (var m = 0; m < legalMoves.length; m++) {
          var move = legalMoves[m];
          if (!this.willLeaveKingInCheck(chessState, move, true)) {
            finalMoves.push(move);
          }
        }
      }

      if (!skipFinalizingMoves) {
        // finalize the moves
        this.finalizedMoves(chessState, finalMoves);
      }

      return finalMoves;
    },

    getLegalMovesPawn: function(chessState, source) {
      var legalMoves = [];
      
      var boardSize = chessState.getBoardSize();

      var enPassant = chessState.getEnPassant();

      var piece = chessState.getPiece(source);
      var isWhite = this.isWhite(piece);
      var direction = isWhite ? -1 : 1;
      var homeRow = isWhite ? boardSize.height - 2 : 1;
      var promotionRow = isWhite ? 0 : boardSize.height - 1;
      var promotionChoices = isWhite ? ['R', 'N', 'B', 'Q'] : ['r', 'n', 'b', 'q'];

      // pawns can always move one space if next spot is unoccupied
      // no need to ensure this is in bounds, as pawns are never on the end rows
      var target = {rowNumber: source.rowNumber + direction, columnNumber: source.columnNumber};
      if (chessState.getPiece(target) == null) {
        // promotion
        if (target.rowNumber == promotionRow) {
          for (var c = 0; c < promotionChoices.length; c++) {
            var promotion = promotionChoices[c];
            legalMoves.push({source: source, target: target, promotion: promotion});
          }
        }
        // normal move
        else {
          legalMoves.push({source: source, target: target});
        }

        // pawns can move two spaces if that spot is unoccupied too
        // AND the pawn is on the home row
        if (source.rowNumber == homeRow) {
          target = {rowNumber: source.rowNumber + direction * 2, columnNumber: source.columnNumber};
          if (chessState.getPiece(target) == null) {
            legalMoves.push({source: source, target: target});
          }
        }
      }

      // pawns can capture diagnonally 1 space if that spot is occupied by an opposing piece
      // pawns can also capture diagnonally 1 space if the spot is unoccupied and the en passant square is behind the target square
      var sideDirections = [-1, 1];
      for (var d = 0; d < sideDirections.length; d++) {
        var sideDirection = sideDirections[d];
        target = {rowNumber: source.rowNumber + direction, columnNumber: source.columnNumber + sideDirection};
        if (chessState.inBounds(target)) {
          
          var targetPiece = chessState.getPiece(target);
          if (targetPiece != null) {
            // test a normal pawn capture
            if (isWhite != this.isWhite(targetPiece)) {
              // if we got here, it is a legal normal pawn capture

              // promotion
              if (target.rowNumber == promotionRow) {
                for (var c = 0; c < promotionChoices.length; c++) {
                  var promotion = promotionChoices[c];
                  legalMoves.push({source: source, target: target, capture: targetPiece, promotion: promotion});
                }
              }
              // normal move
              else {
                legalMoves.push({source: source, target: target, capture: targetPiece});
              }
            }
          } else if (enPassant != null && enPassant.rowNumber == source.rowNumber && enPassant.columnNumber == target.columnNumber) {
            // test an en passant pawn capture (too complicated to explain in comments)
            var enPassantPiece = chessState.getPiece(enPassant);
            if (enPassantPiece != null && isWhite != this.isWhite(enPassantPiece) && enPassantPiece.toLowerCase() == 'p') {
              // if we got here, it is a legal en passant pawn capture
              legalMoves.push({source: source, target: target, capture: enPassantPiece, enPassant: enPassant});
            }
          }
        }
      }

      return legalMoves;
    },

    getLegalMovesGeneric: function(chessState, source, directions, oneSpace) {
      var legalMoves = [];

      var piece = chessState.getPiece(source);

      for (var d = 0; d < directions.length; d++) {
        var direction = directions[d];

        var steps = 1;
        while (true) {
          var target = {rowNumber: source.rowNumber + steps * direction.y, columnNumber: source.columnNumber + steps * direction.x};

          if (!chessState.inBounds(target)) {
            break;
          }

          var targetPiece = chessState.getPiece(target);
          if (targetPiece == null) {
            // legal move to empty square
            legalMoves.push({source: source, target: target});
            // if only one space is allowed,
            // no more legal moves in this direction
            if (oneSpace) {
              break;
            }
            steps++;
          } else {
            if (this.isWhite(piece) != this.isWhite(targetPiece)) {
              // legal move to capture
              legalMoves.push({source: source, target: target, capture: targetPiece});
            }
            // no more legal moves in this direction
            break;
          }
        }
      }

      return legalMoves;
    },

    getLegalMovesCastle: function(chessState, source) {
      var legalMoves = [];

      var boardSize = chessState.getBoardSize();

      var piece = chessState.getPiece(source);

      // test both directions of castling
      var sideDirections = [-1, 1];
      outer: for (var d = 0; d < sideDirections.length; d++) {
        var sideDirection = sideDirections[d];
        
        // make sure castling is still legal in the attempted direction
        var castleSide = sideDirection == -1 ? 'q' : 'k';
        if (this.isWhite(piece)) {
          castleSide = castleSide.toUpperCase();
        }
        if (!chessState.getCastle(castleSide)) {
          continue;
        }

        // make sure all squares between the king and the rook are unoccupied
        var targets = [];
        var target = {rowNumber: source.rowNumber, columnNumber: source.columnNumber + sideDirection};
        while (0 < target.columnNumber && target.columnNumber < boardSize.width - 1) {
          targets.push(target);
          var targetPiece = chessState.getPiece(target);
          if (targetPiece != null) {
            continue outer;
          }
          target = {rowNumber: target.rowNumber, columnNumber: target.columnNumber + sideDirection};
        }

        // ensure the king won't move through check (1 space away)
        if (!this.willLeaveKingInCheck(chessState, {source: source, target: targets[0]}, true)) {
          // move the king 2 spaces
          var rookSquare = {rowNumber: targets[targets.length - 1].rowNumber, columnNumber: targets[targets.length - 1].columnNumber + sideDirection};
          var secondaryMove = {source: rookSquare, target: targets[0]};
          legalMoves.push({source: source, target: targets[1], castle: castleSide, secondaryMove: secondaryMove});
        }
      }

      return legalMoves;
    },

    isWhite: function(piece) {
      return piece != piece.toLowerCase();
    },

    willLeaveKingInCheck: function(chessState, move, opponent) {
      var tempChessState = this.performMove(chessState, move, opponent);
      return this.inCheck(tempChessState);
    },

    willLeaveNoMoves: function(chessState, move, opponent) {
      var tempChessState = this.performMove(chessState, move, opponent);
      return this.getLegalMoves(tempChessState, {allowKingInCheck: false, skipFinalizingMoves: true}).length == 0;
    },

    performMove: function(oldChessState, move, keepPlayer) {
      var chessState = new ChessState({chessState: oldChessState});

      var source = move.source;
      var target = move.target;
      var enPassant = move.enPassant;
      var promotion = move.promotion;
      var capture = move.capture;

      var boardSize = chessState.getBoardSize();
      var sourcePiece = chessState.getPiece(source);
      var targetPiece = chessState.getPiece(target);
      var player = chessState.getPlayer();

      // keep track of whether which castlings can occur
      if (sourcePiece == 'r') {
        // black rook
        var side = source.columnNumber == 0 ? 'q' : 'k';
        chessState.setCastle(side, false);
      } else if (sourcePiece == 'k') {
        // black king
        chessState.setCastle('q', false);
        chessState.setCastle('k', false);
      } else if (sourcePiece == 'R') {
        // white rook
        var side = source.columnNumber == 0 ? 'Q' : 'K';
        chessState.setCastle(side, false);
      } else if (sourcePiece == 'K') {
        // white king
        chessState.setCastle('Q', false);
        chessState.setCastle('K', false);
      }

      // increment half moves since a capture or a pawn advancement
      if (sourcePiece == 'p' || sourcePiece == 'P' || targetPiece != null) {
        chessState.resetHalfMoves();
      } else {
        chessState.incrementHalfMoves();
      }

      // perform castling if applicable
      if (sourcePiece == 'k' || sourcePiece == 'K') {
        // king
        if (target.columnNumber == source.columnNumber - 2) {
          // queenside
          var rookSource = {rowNumber: target.rowNumber, columnNumber: 0};
          var rookTarget = {rowNumber: target.rowNumber, columnNumber: target.columnNumber + 1};
          chessState.addPiece(rookTarget, chessState.removePiece(rookSource));
        } else if (target.columnNumber == source.columnNumber + 2) {
          // kingside
          var rookSource = {rowNumber: target.rowNumber, columnNumber: boardSize.width - 1};
          var rookTarget = {rowNumber: target.rowNumber, columnNumber: target.columnNumber - 1};
          chessState.addPiece(rookTarget, chessState.removePiece(rookSource));
        }
      }

      // perform the move (possibly a promotion, possibly a capture)
      if (capture) {
        chessState.addCaptured(player, move.capture);
      }
      var movingPiece = chessState.removePiece(source);
      if (promotion) {
        movingPiece = promotion;
      }
      chessState.addPiece(target, movingPiece);

      // perform an en passant capture if applicable
      // (manual capture is only required for en passant)
      if (enPassant) {
        chessState.removePiece(enPassant);
      }

      // record whether a pawn has just moved more than 1 square, for future en passant purposes
      if ((sourcePiece == 'p' || sourcePiece == 'P') && Math.abs(target.rowNumber - source.rowNumber) > 1) {
        chessState.setEnPassant(target);
      } else {
        chessState.resetEnPassant();
      }

      // perform the player switch and increment the move counter
      if (!keepPlayer) {
        if (player == 'w') {
          chessState.setPlayer('b');
        } else {
          chessState.setPlayer('w');
          chessState.incrementMoveNumber();
        }
      }

      chessState.addMove(player, move);

      return chessState;
    },

    inCheck: function(chessState) {
      // compute all legal moves, ignoring moves that result in leaving yourself in check
      var tempChessState = new ChessState({chessState: chessState});
      tempChessState.setPlayer(tempChessState.getPlayer() != 'w' ? 'w' : 'b');
      var semiLegalMoves = this.getLegalMoves(tempChessState, {allowKingInCheck: true, skipFinalizingMoves: true});

      for (var m = 0; m < semiLegalMoves.length; m++) {
        var move = semiLegalMoves[m];
        // if any of those moves contain capturing a king, then return false
        if (move.capture && move.capture.toLowerCase() == 'k') {
          return true;
        }
      }

      return false;
    },

    isEnoughMaterial: function(chessState) {
      // not enough material for a mate - both players have one of the following sets of material:
      // * king
      // * king + bishop
      // * king + knight
      // * king + 2 bishops on same color

      var boardSize = chessState.getBoardSize();
      var material = {
        'w': [],
        'b': []
      };
      for (var rowNumber = 0; rowNumber < boardSize.height; rowNumber++) {
        for (var columnNumber = 0; columnNumber < boardSize.width; columnNumber++) {
          var source = {rowNumber: rowNumber, columnNumber: columnNumber};
          var piece = chessState.getPiece(source);

          // only look at pieces
          if (piece == null) {
            continue;
          }

          var pieceType = piece.toLowerCase();
          var color = this.isWhite(piece) ? 'w' : 'b';
          var square = ((rowNumber + columnNumber) % 2 == 0) ? 'w' : 'b';

          // bishop
          if (pieceType == 'b') {
            if (material[color].length > 0) {
              // allow multiple bishops on the same square 
              var lastPiece = material[color][0];
              if (lastPiece == pieceType + square) {
                continue;
              }

              return true;
            } else {
              material[color].push(pieceType + square);
            }
          }
          // knight
          else if (pieceType == 'n') {
            if (material[color].length > 0) {
              return true;
            }

            material[color].push(pieceType);
          }
          // non-king
          else if (pieceType != 'k') {
            return true;
          }
        }
      }

      return false;
    },

    getGameStatus: function(chessState) {
      var legalMoves = this.getLegalMoves(chessState);

      var inCheck = this.inCheck(chessState);

      // checkmate - current player's king is in check and current player has no moves
      // stalemate - current player's king is NOT in check and current player has no moves
      if (legalMoves.length == 0) {
        if (inCheck) {
          var lastMove = chessState.getLastMove();
          var lastPlayer = lastMove != null ? lastMove.player : null;
          var lastPlayerName = {'w': 'White', 'b': 'Black'}[lastPlayer];
          return {legalMoves: [], gameOver: true, reason: 'checkmate', message: 'Checkmate - ' + lastPlayerName + ' wins!', winner: lastPlayer};
        } else {
          return {legalMoves: [], gameOver: true, reason: 'stalemate', message: 'Draw - Stalemate', winner: null};
        }
      }

      // not enough material for a checkmate - both players have one of the following sets of material:
      // * king
      // * king + bishop
      // * king + knight
      // * king + 2 bishops on same color
      if (!this.isEnoughMaterial(chessState)) {
        return {legalMoves: [], gameOver: true, reason: 'insufficient material', message: 'Draw - Insufficient material for a checkmate', winner: null};
      }

      // 50 move draw - half move marker is at 50
      var halfMoves = chessState.getHalfMoves();
      if (halfMoves >= 50) {
        return {legalMoves: [], gameOver: true, reason: 'fifty-move rule', message: 'Draw - ' + halfMoves + ' moves since a pawn progression or a capture', winner: null};
      }

      // threefold repetition - same piece position has been repeated three times
      // ... this can be optimized by not looking past when the half move marker was at 0
      var matches = [];
      var currentState = chessState.getLastState();
      for (var i = halfMoves; i > 0; i--) {
        if (currentState == null) {
          break;
        }
        if (currentState.isSamePosition(chessState)) {
          matches.push(i);

          if (matches.length > 1) {
            return {legalMoves: [], gameOver: true, reason: 'threefold repetition', message: 'Draw - Threefold reptition - ' + matches[0] + ' and ' + matches[1] + ' half moves ago', winner: null};
          }
        }
        currentState = currentState.getLastState();
      }

      var currentPlayer = chessState.getPlayer();
      var currentPlayerName = {'w': 'White', 'b': 'Black'}[currentPlayer];

      // in check - current player's king is in check and current player has moves
      if (inCheck) {
        return {legalMoves: legalMoves, gameOver: false, reason: 'check', message: currentPlayerName + ' to move - Check!', winner: null};
      }

      // none of the above
      return {legalMoves: legalMoves, gameOver: false, reason: null, message: currentPlayerName + ' to move', winner: null};
    },

    finalizedMoves: function(chessState, moves) {
      // initialize rowUnique and columnUnique for all moves
      for (var m1 = 0; m1 < moves.length; m1++) {
        var move = moves[m1];
        move.rowUnique = true;
        move.columnUnique = true;
      }

      for (var m1 = 0; m1 < moves.length; m1++) {
        var move = moves[m1];
        
        move.player = chessState.getPlayer();
        
        move.piece = chessState.getPiece(move.source);

        move.boardSize = chessState.getBoardSize();

        // determine rowUnique and columnUnique for the current move
        for (var m2 = m1 + 1; m2 < moves.length; m2++) {
          var otherMove = moves[m2];

          // make sure we found the same kind of piece
          var otherPiece = chessState.getPiece(otherMove.source);
          if (otherPiece != move.piece) {
            continue;
          }
          // and it can head to the same square
          if (move.target.rowNumber != otherMove.target.rowNumber || move.target.columnNumber != otherMove.target.columnNumber) {
            continue;
          }

          // determine whether the row and column are unique
          // disambiguation order:
          // 1. the source column - if they differ
          // 2. the source row - if the columns are the same but the rows differ
          // 3. both the column and row - if neither alone is sufficient to identify the piece
           if (move.source.columnNumber != otherMove.source.columnNumber) {
            move.columnUnique = false;
            otherMove.columnUnique = false;
          } else {
            // row can be used
            move.rowUnique = false;
            otherMove.rowUnique = false;
          }
        }

        move.check = this.willLeaveKingInCheck(chessState, move, false);

        move.finalMove = this.willLeaveNoMoves(chessState, move, false);

        moves[m1] = new ChessMove(move);
      }
    }
  }.init();
};

module.exports = new ChessRules();
