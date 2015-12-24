"use strict";

var $ = require('jquery');
var reader = require('properties-reader');

// TODO: this should be moved to a shared properties class
var movesUrl;
$.get('app.properties').done(function(responseText) {
  var properties = reader().read(responseText);
  movesUrl = properties.get('main.movesUrl');
});

var ChessComputer = function() {
  var $public = this;
  var $private = {
    init: function() {
      $public.isHuman = this.isHuman.bind(this);
      $public.requestMove = this.requestMove.bind(this);
      $public.choosePromotion = this.choosePromotion.bind(this);

      return this;
    },

    isHuman: function() {
      return false;
    },

    requestMove: function(fen, callback) {
      $.getJSON(movesUrl, {fen: fen}).done(function(content) {
        if (content.bestmove != '(none)') {
          var sourceSquare = 'square-' + content.bestmove.substring(0, 2);
          var targetSquare = 'square-' + content.bestmove.substring(2, 4);
          var promotion = content.bestmove.substring(4, 5).toLowerCase();
          callback(sourceSquare, targetSquare, promotion);
        }
      }.bind(this)).fail(function(err) {
        console && console.error(err);
        if (confirm('Unexpected error: ' + err + ' - retry?')) {
          // retry the function
          this.requestMove.apply(this, arguments);
        }
      }.bind(this));
    },

    choosePromotion: function(sourceSquare, targetSquare, choices, callback) {
      // this shouldn't happen - throw an error
      throw 'Unexpected promotion choice.';
    }

  }.init();
}

module.exports = ChessComputer;
