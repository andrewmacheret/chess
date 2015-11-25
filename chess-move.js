"use strict";

var ChessMove = function($options) {
  var $public = this;
  var $private = {
    fields: {},

    init: function() {
      // absolutely necessary information
      this.fields.source = $options.source;
      this.fields.target = $options.target;
      this.fields.promotion = $options.promotion || null;
      
      // information that can be derived if the game state is known
      // or is otherwise really helpful and reduces required computation
      this.fields.player = $options.player;
      this.fields.piece = $options.piece;
      this.fields.capture = $options.capture || null;
      this.fields.enPassant = $options.enPassant || null;
      this.fields.castle = $options.castle || null;
      this.fields.rowUnique = $options.rowUnique || false;
      this.fields.columnUnique = $options.columnUnique || false;
      this.fields.boardSize = $options.boardSize;
      this.fields.check = $options.check || false;
      this.fields.finalMove = $options.finalMove || false;
      this.fields.secondaryMove = $options.secondaryMove || null;

      // generate public accessors on the fields object
      var fieldNames = Object.keys(this.fields);
      for (var f = 0; f < fieldNames.length; f++) {
        var fieldName = fieldNames[f];
        //var accessorName = 'get' + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        //$public[accessorName] = function() {
        //  return this.fields[fieldName];
        //}.bind(this);
        $public[fieldName] = this.fields[fieldName];
      }

      $public.toPGN = this.toPGN.bind(this);

      return this;
    },

    toPGN: function() {
      // PGN algabraic notation

      // castle
      if (this.fields.castle) {
        return this.fields.castle.toUpperCase() == 'K' ? 'O-O' : 'O-O-O';
      }

      var move = '';

      // source
      // (algabraic notation is really annoying)
      var piece = this.fields.piece.toUpperCase();
      if (piece == 'P') {
        // NEVER specify letter
        // NEVER specify a row
        // SOMETIMES specify column, but only if changing columns
        if (this.fields.source.columnNumber != this.fields.target.columnNumber) {
          var column = this.getColumn(this.fields.source.columnNumber);
          move += column;
        }
      } else {
        var column = this.getColumn(this.fields.source.columnNumber);
        var row = this.getRow(this.fields.source.rowNumber);
        if (this.fields.rowUnique && this.fields.columnUnique) {
          // this is a unique piece... no need for source
          move += piece;
        } else if (this.fields.rowUnique) {
          // the row is unique but the column is not... we need to specify the column
          move += piece + column;
        } else if (this.fields.columnUnique) {
          // the column is unique but the row is not... we need to specify the row
          move += piece + row;
        } else {
          move += piece + column + row;
        }
      }

      // capture
      if (this.fields.capture) {
        move += 'x';
      }

      // target
      move += this.getColumn(this.fields.target.columnNumber);
      move += this.getRow(this.fields.target.rowNumber);

      // promotion
      if (this.fields.promotion) {
        move += '=' + this.fields.promotion.toUpperCase();
      }

      if (this.fields.enPassant) {
        move += 'e.p.';
      }

      // check and checkmate
      if (this.fields.check) {
        if (this.fields.finalMove) {
          move += '#';
        } else {
          move += '+';
        }
      }

      return move;
    },

    getRow: function(rowNumber) {
      return String.fromCharCode('1'.charCodeAt(0) + (this.fields.boardSize.height - rowNumber - 1));
    },

    getColumn: function(columnNumber) {
      return String.fromCharCode('a'.charCodeAt(0) + columnNumber);
    }

  }.init();
};

module.exports = ChessMove;
