"use strict";

var ChessPlayer = function() {
  var $public = this;
  var $private = {
    init: function() {
      $public.isHuman = this.isHuman.bind(this);
      $public.requestMove = this.requestMove.bind(this);
      $public.choosePromotion = this.choosePromotion.bind(this);

      return this;
    },

    isHuman: function() {
      return true;
    },

    requestMove: function(fen, callback) {
      // do nothing... wait for a drag and drop event
    },

    choosePromotion: function(sourceSquare, targetSquare, choices, callback) {
      // lets do this the easy way for now
      var choicesString = choices.join(', ');
      var defaultChoice = choices[choices.length - 1];
      while (true) {
        var choice = prompt('Choose one of the following promotion options:\n' + choicesString, defaultChoice);
        
        // user chose to cancel
        if (choice == null) {
          return;
        }
        
        // user chose an invalid option, try again
        if (choices.indexOf(choice) >= 0) {
          callback(sourceSquare, targetSquare, choice);
          return;
        }
      }
    }

  }.init();
}

module.exports = ChessPlayer;
