import ChessState from "./ChessState";
import ChessMove from "./ChessMove";

function getLegalMoves(
  chessState,
  { allowKingInCheck = false, skipFinalizingMoves = false } = {}
) {
  const legalMoves = [];

  const { width, height } = chessState.getBoardSize();
  const isWhitePlayer = chessState.getPlayer() === "w";

  for (let rowNumber = 0; rowNumber < height; rowNumber++) {
    for (let columnNumber = 0; columnNumber < width; columnNumber++) {
      const source = { rowNumber, columnNumber };
      const piece = chessState.getPiece(source);

      // only allow pieces to move
      if (!piece) {
        continue;
      }

      // only allow the current player to move
      if (isWhitePlayer !== isWhite(piece)) {
        continue;
      }

      // find out which moves are legal based on the piece type
      const pieceType = piece.toLowerCase();
      if (pieceType === "p") {
        // pawns are crazy...
        // * they can advance 1 space (non-capture)
        // * they can sometimes advance 2 spaces (non-capture)
        // * they can capture diagonally 1 space
        // * they can capture via the en passant rule
        // * they promote when they reach the end row
        legalMoves.push(...getLegalMovesPawn(chessState, source));
      } else if (pieceType === "r") {
        // rooks can move infinitely horizontally and vertically
        const directions = [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 0, y: -1 },
        ];
        const oneSpace = false;
        legalMoves.push(
          ...getLegalMovesGeneric(chessState, source, directions, oneSpace)
        );
      } else if (pieceType === "n") {
        // knights move in an L shape
        const directions = [
          { x: 2, y: 1 },
          { x: 1, y: 2 },
          { x: -1, y: 2 },
          { x: -2, y: 1 },
          { x: -2, y: -1 },
          { x: -1, y: -2 },
          { x: 1, y: -2 },
          { x: 2, y: -1 },
        ];
        const oneSpace = true;
        legalMoves.push(
          ...getLegalMovesGeneric(chessState, source, directions, oneSpace)
        );
      } else if (pieceType === "b") {
        // bishops move infinitely diagonally
        const directions = [
          { x: 1, y: 1 },
          { x: -1, y: 1 },
          { x: -1, y: -1 },
          { x: 1, y: -1 },
        ];
        const oneSpace = false;
        legalMoves.push(
          ...getLegalMovesGeneric(chessState, source, directions, oneSpace)
        );
      } else if (pieceType === "q") {
        // queens move infinitely horizontally, vertically and diagonally
        const directions = [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 },
          { x: -1, y: 1 },
          { x: -1, y: 0 },
          { x: -1, y: -1 },
          { x: 0, y: -1 },
          { x: 1, y: -1 },
        ];
        const oneSpace = false;
        legalMoves.push(
          ...getLegalMovesGeneric(chessState, source, directions, oneSpace)
        );
      } else if (pieceType === "k") {
        // kings move one step horizontally, vertically and diagonally
        const directions = [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 },
          { x: -1, y: 1 },
          { x: -1, y: 0 },
          { x: -1, y: -1 },
          { x: 0, y: -1 },
          { x: 1, y: -1 },
        ];
        const oneSpace = true;
        legalMoves.push(
          ...getLegalMovesGeneric(chessState, source, directions, oneSpace)
        );

        // kings can also castle
        legalMoves.push(...getLegalMovesCastle(chessState, source));
      }
    }
  }

  let finalMoves;
  if (allowKingInCheck) {
    // skip the next part if we will allow the king to be in check
    finalMoves = legalMoves;
  } else {
    // filter out moves that leave the king in check
    finalMoves = [];
    for (let m = 0; m < legalMoves.length; m++) {
      const move = legalMoves[m];
      if (!willLeaveKingInCheck(chessState, move, true)) {
        finalMoves.push(move);
      }
    }
  }

  if (!skipFinalizingMoves) {
    // finalize the moves
    finalizedMoves(chessState, finalMoves);
  }

  return finalMoves;
}

function getLegalMovesPawn(chessState, source) {
  const legalMoves = [];

  const { height } = chessState.getBoardSize();

  const enPassant = chessState.getEnPassant();

  const piece = chessState.getPiece(source);
  const isWhitePiece = isWhite(piece);
  const direction = isWhitePiece ? -1 : 1;
  const homeRow = isWhitePiece ? height - 2 : 1;
  const promotionRow = isWhitePiece ? 0 : height - 1;
  const promotionChoices = isWhitePiece
    ? ["R", "N", "B", "Q"]
    : ["r", "n", "b", "q"];

  // pawns can always move one space if next spot is unoccupied
  // no need to ensure this is in bounds, as pawns are never on the end rows
  let target = {
    rowNumber: source.rowNumber + direction,
    columnNumber: source.columnNumber,
  };
  if (!chessState.getPiece(target)) {
    // promotion
    if (target.rowNumber === promotionRow) {
      for (let c = 0; c < promotionChoices.length; c++) {
        const promotion = promotionChoices[c];
        legalMoves.push({ source, target, promotion });
      }
    }
    // normal move
    else {
      legalMoves.push({ source, target });
    }

    // pawns can move two spaces if that spot is unoccupied too
    // AND the pawn is on the home row
    if (source.rowNumber === homeRow) {
      target = {
        rowNumber: source.rowNumber + direction * 2,
        columnNumber: source.columnNumber,
      };
      if (!chessState.getPiece(target)) {
        legalMoves.push({ source, target });
      }
    }
  }

  // pawns can capture diagnonally 1 space if that spot is occupied by an opposing piece
  // pawns can also capture diagnonally 1 space if the spot is unoccupied and the en passant square is behind the target square
  const sideDirections = [-1, 1];
  for (let d = 0; d < sideDirections.length; d++) {
    const sideDirection = sideDirections[d];
    target = {
      rowNumber: source.rowNumber + direction,
      columnNumber: source.columnNumber + sideDirection,
    };
    if (chessState.inBounds(target)) {
      const targetPiece = chessState.getPiece(target);
      if (targetPiece) {
        // test a normal pawn capture
        if (isWhite !== isWhite(targetPiece)) {
          // if we got here, it is a legal normal pawn capture

          // promotion
          if (target.rowNumber === promotionRow) {
            for (let c = 0; c < promotionChoices.length; c++) {
              const promotion = promotionChoices[c];
              legalMoves.push({
                source,
                target,
                capture: targetPiece,
                promotion: promotion,
              });
            }
          }
          // normal move
          else {
            legalMoves.push({
              source,
              target,
              capture: targetPiece,
            });
          }
        }
      } else if (
        enPassant &&
        enPassant.rowNumber === source.rowNumber &&
        enPassant.columnNumber === target.columnNumber
      ) {
        // test an en passant pawn capture (too complicated to explain in comments)
        const enPassantPiece = chessState.getPiece(enPassant);
        if (
          enPassantPiece &&
          isWhite !== isWhite(enPassantPiece) &&
          enPassantPiece.toLowerCase() === "p"
        ) {
          // if we got here, it is a legal en passant pawn capture
          legalMoves.push({
            source,
            target,
            capture: enPassantPiece,
            enPassant: enPassant,
          });
        }
      }
    }
  }

  return legalMoves;
}

function getLegalMovesGeneric(chessState, source, directions, oneSpace) {
  const legalMoves = [];

  const piece = chessState.getPiece(source);

  for (let d = 0; d < directions.length; d++) {
    const direction = directions[d];

    let steps = 1;
    while (true) {
      const target = {
        rowNumber: source.rowNumber + steps * direction.y,
        columnNumber: source.columnNumber + steps * direction.x,
      };

      if (!chessState.inBounds(target)) {
        break;
      }

      const targetPiece = chessState.getPiece(target);
      if (!targetPiece) {
        // legal move to empty square
        legalMoves.push({ source, target });
        // if only one space is allowed,
        // no more legal moves in this direction
        if (oneSpace) {
          break;
        }
        steps++;
      } else {
        if (isWhite(piece) !== isWhite(targetPiece)) {
          // legal move to capture
          legalMoves.push({
            source,
            target,
            capture: targetPiece,
          });
        }
        // no more legal moves in this direction
        break;
      }
    }
  }

  return legalMoves;
}

function getLegalMovesCastle(chessState, source) {
  const legalMoves = [];

  const { width } = chessState.getBoardSize();

  const piece = chessState.getPiece(source);

  // test both directions of castling
  const sideDirections = [-1, 1];
  outer: for (let d = 0; d < sideDirections.length; d++) {
    const sideDirection = sideDirections[d];

    // make sure castling is still legal in the attempted direction
    let castleSide = sideDirection === -1 ? "q" : "k";
    if (isWhite(piece)) {
      castleSide = castleSide.toUpperCase();
    }
    if (!chessState.getCastle(castleSide)) {
      continue;
    }

    // make sure all squares between the king and the rook are unoccupied
    const targets = [];
    let target = {
      rowNumber: source.rowNumber,
      columnNumber: source.columnNumber + sideDirection,
    };
    while (0 < target.columnNumber && target.columnNumber < width - 1) {
      targets.push(target);
      const targetPiece = chessState.getPiece(target);
      if (targetPiece) {
        continue outer;
      }
      target = {
        rowNumber: target.rowNumber,
        columnNumber: target.columnNumber + sideDirection,
      };
    }

    // ensure the king won't move through check (1 space away)
    if (
      !willLeaveKingInCheck(chessState, { source, target: targets[0] }, true)
    ) {
      // move the king 2 spaces
      const rookSquare = {
        rowNumber: targets[targets.length - 1].rowNumber,
        columnNumber: targets[targets.length - 1].columnNumber + sideDirection,
      };
      const secondaryMove = { source: rookSquare, target: targets[0] };
      legalMoves.push({
        source,
        target: targets[1],
        castle: castleSide,
        secondaryMove: secondaryMove,
      });
    }
  }

  return legalMoves;
}

function isWhite(piece) {
  return piece !== piece.toLowerCase();
}

function willLeaveKingInCheck(chessState, move, opponent) {
  const tempChessState = performMove(chessState, move, opponent);
  return inCheck(tempChessState);
}

function willLeaveNoMoves(chessState, move, opponent) {
  const tempChessState = performMove(chessState, move, opponent);
  return (
    getLegalMoves(tempChessState, {
      allowKingInCheck: false,
      skipFinalizingMoves: true,
    }).length === 0
  );
}

export function performMove(oldChessState, move, keepPlayer = false) {
  const chessState = ChessState.copy(oldChessState);

  const { source, target, enPassant, promotion, capture } = move;

  const { width } = chessState.getBoardSize();
  const sourcePiece = chessState.getPiece(source);
  const targetPiece = chessState.getPiece(target);
  const player = chessState.getPlayer();

  // keep track of whether which castlings can occur
  if (sourcePiece === "r") {
    // black rook
    const side = source.columnNumber === 0 ? "q" : "k";
    chessState.setCastle(side, false);
  } else if (sourcePiece === "k") {
    // black king
    chessState.setCastle("q", false);
    chessState.setCastle("k", false);
  } else if (sourcePiece === "R") {
    // white rook
    const side = source.columnNumber === 0 ? "Q" : "K";
    chessState.setCastle(side, false);
  } else if (sourcePiece === "K") {
    // white king
    chessState.setCastle("Q", false);
    chessState.setCastle("K", false);
  }

  // increment half moves since a capture or a pawn advancement
  if (sourcePiece === "p" || sourcePiece === "P" || targetPiece) {
    chessState.resetHalfMoves();
  } else {
    chessState.incrementHalfMoves();
  }

  // perform castling if applicable
  if (sourcePiece === "k" || sourcePiece === "K") {
    // king
    if (target.columnNumber === source.columnNumber - 2) {
      // queenside
      const rookSource = { rowNumber: target.rowNumber, columnNumber: 0 };
      const rookTarget = {
        rowNumber: target.rowNumber,
        columnNumber: target.columnNumber + 1,
      };
      chessState.addPiece(rookTarget, chessState.removePiece(rookSource));
    } else if (target.columnNumber === source.columnNumber + 2) {
      // kingside
      const rookSource = {
        rowNumber: target.rowNumber,
        columnNumber: width - 1,
      };
      const rookTarget = {
        rowNumber: target.rowNumber,
        columnNumber: target.columnNumber - 1,
      };
      chessState.addPiece(rookTarget, chessState.removePiece(rookSource));
    }
  }

  // perform the move (possibly a promotion, possibly a capture)
  if (capture) {
    chessState.addCaptured(player, move.capture);
  }
  let movingPiece = chessState.removePiece(source);
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
  if (
    (sourcePiece === "p" || sourcePiece === "P") &&
    Math.abs(target.rowNumber - source.rowNumber) > 1
  ) {
    chessState.setEnPassant(target);
  } else {
    chessState.resetEnPassant();
  }

  // perform the player switch and increment the move counter
  if (!keepPlayer) {
    if (player === "w") {
      chessState.setPlayer("b");
    } else {
      chessState.setPlayer("w");
      chessState.incrementMoveNumber();
    }
  }

  chessState.addMove(player, move);

  return chessState;
}

function inCheck(chessState) {
  // compute all legal moves, ignoring moves that result in leaving yourself in check
  const tempChessState = ChessState.copy(chessState);
  tempChessState.setPlayer(tempChessState.getPlayer() !== "w" ? "w" : "b");
  const semiLegalMoves = getLegalMoves(tempChessState, {
    allowKingInCheck: true,
    skipFinalizingMoves: true,
  });

  for (let m = 0; m < semiLegalMoves.length; m++) {
    const move = semiLegalMoves[m];
    // if any of those moves contain capturing a king, then return false
    if (move.capture && move.capture.toLowerCase() === "k") {
      return true;
    }
  }

  return false;
}

function isEnoughMaterial(chessState) {
  // not enough material for a mate - both players have one of the following sets of material:
  // * king
  // * king + bishop
  // * king + knight
  // * king + 2 bishops on same color

  const boardSize = chessState.getBoardSize();
  const material = {
    w: [],
    b: [],
  };
  for (let rowNumber = 0; rowNumber < boardSize.height; rowNumber++) {
    for (let columnNumber = 0; columnNumber < boardSize.width; columnNumber++) {
      const source = { rowNumber, columnNumber };
      const piece = chessState.getPiece(source);

      // only look at pieces
      if (!piece) {
        continue;
      }

      const pieceType = piece.toLowerCase();
      const color = isWhite(piece) ? "w" : "b";
      const square = (rowNumber + columnNumber) % 2 === 0 ? "w" : "b";

      // bishop
      if (pieceType === "b") {
        if (material[color].length > 0) {
          // allow multiple bishops on the same square
          const lastPiece = material[color][0];
          if (lastPiece === pieceType + square) {
            continue;
          }

          return true;
        } else {
          material[color].push(pieceType + square);
        }
      }
      // knight
      else if (pieceType === "n") {
        if (material[color].length > 0) {
          return true;
        }

        material[color].push(pieceType);
      }
      // non-king
      else if (pieceType !== "k") {
        return true;
      }
    }
  }

  return false;
}

export function getGameStatus(chessState) {
  const legalMoves = getLegalMoves(chessState);

  const isInCheck = inCheck(chessState);

  // checkmate - current player's king is in check and current player has no moves
  // stalemate - current player's king is NOT in check and current player has no moves
  if (legalMoves.length === 0) {
    if (isInCheck) {
      const lastMove = chessState.getLastMove();
      const lastPlayer = lastMove ? lastMove.player : null;
      const lastPlayerName = { w: "White", b: "Black" }[lastPlayer];
      return {
        legalMoves: [],
        gameOver: true,
        reason: "checkmate",
        message: lastPlayerName
          ? `Checkmate - ${lastPlayerName} wins!`
          : "Checkmate!",
        winner: lastPlayer,
      };
    } else {
      return {
        legalMoves: [],
        gameOver: true,
        reason: "stalemate",
        message: "Draw - Stalemate",
        winner: null,
      };
    }
  }

  // not enough material for a checkmate - both players have one of the following sets of material:
  // * king
  // * king + bishop
  // * king + knight
  // * king + 2 bishops on same color
  if (!isEnoughMaterial(chessState)) {
    return {
      legalMoves: [],
      gameOver: true,
      reason: "insufficient material",
      message: "Draw - Insufficient material for a checkmate",
      winner: null,
    };
  }

  // 50 move draw - half move marker is at 50
  const halfMoves = chessState.getHalfMoves();
  if (halfMoves >= 50) {
    return {
      legalMoves: [],
      gameOver: true,
      reason: "fifty-move rule",
      message: `Draw - ${halfMoves} moves since a pawn progression or a capture`,
      winner: null,
    };
  }

  // threefold repetition - same piece position has been repeated three times
  // ... this can be optimized by not looking past when the half move marker was at 0
  const matches = [];
  let currentState = chessState.getLastState();
  for (let i = halfMoves; i > 0; i--) {
    if (!currentState) {
      break;
    }
    if (currentState.isSamePosition(chessState)) {
      matches.push(i);

      if (matches.length > 1) {
        return {
          legalMoves: [],
          gameOver: true,
          reason: "threefold repetition",
          message: `Draw - Threefold reptition - ${matches[0]} and ${matches[1]} half moves ago`,
          winner: null,
        };
      }
    }
    currentState = currentState.getLastState();
  }

  const currentPlayer = chessState.getPlayer();
  const currentPlayerName = { w: "White", b: "Black" }[currentPlayer];

  // in check - current player's king is in check and current player has moves
  if (isInCheck) {
    return {
      legalMoves: legalMoves,
      gameOver: false,
      reason: "check",
      message: `${currentPlayerName} to move - Check!`,
      winner: null,
    };
  }

  // none of the above
  return {
    legalMoves: legalMoves,
    gameOver: false,
    reason: null,
    message: `${currentPlayerName} to move`,
    winner: null,
  };
}

function finalizedMoves(chessState, moves) {
  // initialize rowUnique and columnUnique for all moves
  for (let m1 = 0; m1 < moves.length; m1++) {
    const move = moves[m1];
    move.rowUnique = true;
    move.columnUnique = true;
  }

  for (let m1 = 0; m1 < moves.length; m1++) {
    const move = moves[m1];

    move.player = chessState.getPlayer();

    move.piece = chessState.getPiece(move.source);

    move.boardSize = chessState.getBoardSize();

    // determine rowUnique and columnUnique for the current move
    for (let m2 = m1 + 1; m2 < moves.length; m2++) {
      const otherMove = moves[m2];

      // make sure we found the same kind of piece
      const otherPiece = chessState.getPiece(otherMove.source);
      if (otherPiece !== move.piece) {
        continue;
      }
      // and it can head to the same square
      if (
        move.target.rowNumber !== otherMove.target.rowNumber ||
        move.target.columnNumber !== otherMove.target.columnNumber
      ) {
        continue;
      }

      // determine whether the row and column are unique
      // disambiguation order:
      // 1. the source column - if they differ
      // 2. the source row - if the columns are the same but the rows differ
      // 3. both the column and row - if neither alone is sufficient to identify the piece
      if (move.source.columnNumber !== otherMove.source.columnNumber) {
        move.columnUnique = false;
        otherMove.columnUnique = false;
      } else {
        // row can be used
        move.rowUnique = false;
        otherMove.rowUnique = false;
      }
    }

    move.check = willLeaveKingInCheck(chessState, move, false);

    move.finalMove = willLeaveNoMoves(chessState, move, false);

    if (move.secondaryMove) {
      move.secondaryMove = new ChessMove(move.secondaryMove);
    }

    moves[m1] = new ChessMove(move);
  }
}
