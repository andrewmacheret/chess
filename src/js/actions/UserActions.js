var AppDispatcher = require('../dispatcher/AppDispatcher');

var UserConstants = require('../constants/UserConstants');

var UserActions = {

  login: function(authId, authData, authType) {
    AppDispatcher.dispatch({
      actionType: UserConstants.USER_LOGIN,
      authId: authId,
      authData: authData,
      authType: authType
    });
  },

  updateRating: function(id, gameType, rating) {
    AppDispatcher.dispatch({
      actionType: UserConstants.USER_UPDATE_RATING,
      id: id,
      gameType: gameType,
      rating: rating
    });
  }

};

module.exports = UserActions;
