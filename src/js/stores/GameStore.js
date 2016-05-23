//var RestEndpoint = require('./RestEndpoint.js');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var GameConstants = require('../constants/GameConstants');

var _games = {};

/*
function createOrUpdate(authId, authData, callback) {
  var postData = {
    authId: authId,
    authData: authData
  };
  RestEndpoint.post('users', postData, function(err, user) {
    callback(err, user);
  });
}
*/ 

function create(gameType, userIds, gameState, active, callback) {
  // TODO: this whole method should be rewritten to:
  // 1. perform an upsert to the server
  // 2. send the results of this upsert to the callback

  if (!gameType) {
    callback('gameType is required', null);
    return;
  }
  if (!userIds || !userIds.length) {
    callback('userIds is required and must be a non-zero length array', null);
    return;
  }
  if (!gameState) {
    callback('gameState is required', null);
    return;
  }

  var now = new Date();
  var id = (+(now) + Math.floor(Math.random() * 999999)).toString(36);
  
  var game = {
    id: id,
    gameType: gameType,
    userIds: userIds,
    gameState: gameState,
    active: active,
    createdAt: now,
    updatedAt: now
  };
  _games[id] = game;

  callback(null, game);
}

function update(id, gameType, userIds, gameState, active, callback) {
  // ensure user with the given id exists
  var game = _games[id];
  if (!game) {
    callback('Game with the given id doesn\'t exist (id=' + id + ')', null);
    return;
  }

  if (!gameType) {
    callback('gameType is required', null);
    return;
  }
  if (!userIds || !userIds.length) {
    callback('userIds is required and must be a non-zero length array', null);
    return;
  }
  if (!gameState) {
    callback('gameState is required', null);
    return;
  }

  game.gameType = gameType;
  game.userIds = userIds;
  game.gameState = gameState;
  game.active = active;
  game.updatedAt = new Date();

  callback(null, game);
}

var UserStore = assign({}, EventEmitter.prototype, {
  emitChange: function(err, user) {
    this.emit(CHANGE_EVENT, err, user);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case UserConstants.USER_LOGIN:
      if (action.authId != '' && action.authData != null) {
        login(action.authId, action.authData, action.authType, UserStore.emitChange.bind(UserStore));
      }
      break;

    case UserConstants.USER_UPDATE_RATING:
      if (action.id != '' && action.gameType != '' && action.rating != null) {
        updateRating(action.id, action.gameType, action.rating, UserStore.emitChange.bind(UserStore));
      }
      break;

    default:
      //throw 'Operation not supported: ' + action.actionType;
  }

  return true;
});

module.exports = UserStore;
