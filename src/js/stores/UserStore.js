//var RestEndpoint = require('./RestEndpoint.js');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var CHANGE_EVENT = 'change';

var UserConstants = require('../constants/UserConstants');

var _usersByEmail = {};
var _users = {};

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

function login(authId, authData, authType, callback) {
  // TODO: this whole method should be rewritten to:
  // 1. perform an upsert to the server
  // 2. send the results of this upsert to the callback

  var now = new Date();

  var email = authData.email;
  if (email == null) {
    callback('No email provided in auth data - support auths with no email', null);
    return;
  }

  var user = _usersByEmail[email];
  if (user == null) {
    var id = (+(now) + Math.floor(Math.random() * 999999)).toString(36);
    
    var authTypes = {};
    authTypes[authType] = {
      authId: authId,
      authData: authData
    };

    var name = authData.name;
    var gameTypes = {};
    
    user = {
      id: id,
      authTypes: authTypes,
      email: email,
      name: name,
      gameTypes: gameTypes,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    };
    _usersByEmail[email] = user;
    _users[id] = user;
  } else {
    user.lastLoginAt = now;
    user.lastUpdated = now;
  }

  callback(null, user);
}

function updateRating(id, gameType, rating, callback) {
  // ensure user with the given id exists
  var user = _users[id];
  if (!user) {
    callback('User with the given id doesn\'t exist (id=' + id + ')', null);
    return;
  }

  // ensure user.gameTypes[gameType] is initialized
  if (!user.gameTypes[gameType]) {
    user.gameTypes[gameType] = {};
  }

  // update the rating and the date last updated
  user.gameTypes[gameType].rating = rating;
  user.updatedAt = new Date();

  callback(null, user);
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
