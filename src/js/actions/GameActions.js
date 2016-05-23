var AppDispatcher = require('../dispatcher/AppDispatcher');

var GameConstants = require('../constants/GameConstants');

var GameActions = {

  create: function(gameType, userIds, gameState) {
    AppDispatcher.dispatch({
      actionType: GameConstants.GAME_CREATE,
      gameType: gameType,
      userIds: userIds,
      gameState: gameState
    });
  },

  update: function(id, userIds, gameState) {
    AppDispatcher.dispatch({
      actionType: GameConstants.Game_UPDATE_RATING,
      id: id,
      userIds: userIds,
      gameState: gameState
    });
  }

};

module.exports = GameActions;
