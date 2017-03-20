'use strict';

var Alexa = require('alexa-sdk');
var Constants = require('./constants.js');

const dialog = Constants.dialog;
const appId = process.env.ALEXA_APPID;

console.assert(appId, "The environment variable 'ALEXA_APPID' must be set");

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = appId;

  alexa.registerHandlers(newSessionHandlers,
    selectSideModeHandlers,
    roundOneModeHandlers,
    roundTwoFirstStrikeModeHandlers,
    roundTwoPassiveModeHandlers);

  alexa.execute();
};

const states = {
  SELECTSIDE: '_SELECTSIDE',
  ROUNDONE: '_ROUNDONE',
  ROUNDTWO: '_ROUNDTWO',
  END: '_END'
};

function sessionEndHandler() {
  this.attributes['gamesPlayed'] += 1;
  this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
}

var newSessionHandlers = {
  // New session; first time play, a reset, or new game
  'NewSession': function() {
    if(Object.keys(this.attributes).length === 0) { // First time skill invoked
      this.attributes['gamesPlayed'] = 0;
      this.attributes['side'] = "";
      this.attributes['cities'] = [];

    }
    var gamesPlayed = this.attributes['gamesPlayed'].toString();
    this.emit(':ask',
      dialog['common'].start.replace(/{gamesPlayed}/g, gamesPlayed),
      dialog['common'].start_prompt);
  },
  'AMAZON.YesIntent': function() {
    this.handler.state = states.SELECTSIDE;
    this.emit(':ask',
      dialog['common'].pick_side,
      dialog['common'].pick_side_prompt);
  },
  'AMAZON.NoIntent': function() {
    this.emit(':tell', dialog['common'].quit);
  },
  'Unhandled': function() {
    this.emit(':ask', dialog['common'].unhandled);
  }
};

var selectSideModeHandlers = Alexa.CreateStateHandler(states.SELECTSIDE, {
  // Select a side: Russia or the US.
  'NewSession': function () {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'AMAZON.HelpIntent': function() {
    this.emit(':ask', dialog['common'].pick_side_prompt);
  },
  'SessionEndedRequest': sessionEndHandler,
  'AmericaIntent': function () {
    var side = this.attributes['side'] = 'america';
    this.handler.state = states.ROUNDONE;
    this.emit(':ask', dialog[side].welcome, dialog[side].welcome_help);
  },
  'RussiaIntent': function () {
    var side = this.attributes['side'] = 'russia';
    this.handler.state = states.ROUNDONE;
    this.emit(':ask', dialog[side].welcome, dialog[side].welcome_help);
  },
  'Unhandled': function() {
    this.emit(':ask', dialog['common'].unhandled);
  }
});

var roundOneModeHandlers = Alexa.CreateStateHandler(states.ROUNDONE, {
  // Round one: decide to make first strike surprise attack or not
  'NewSession': function () {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'AMAZON.HelpIntent': function() {
    var side = this.attributes['side'];

    this.emit(':ask', dialog[side].welcome_help);
  },
  'SessionEndedRequest': sessionEndHandler,
  'AMAZON.YesIntent': function () {
    this.handler.state = states.ENDGAME;
    var side = this.attributes['side'];
    this.emit(':tell', dialog[side].first_strike);
  },
  'AMAZON.NoIntent': function () {
    this.handler.state = states.ROUNDTWO
    var side = this.attributes['side'];
    this.emit(':ask', dialog[side].under_attack +
      " break time='4s' /> " +
      dialog[side].retaliate);
  },
  'Unhandled': function() {
    var side = this.attributes['side'];

    this.emit(':ask', dialog[side].welcome_help);
  }
});

var roundTwoFirstStrikeModeHandlers = Alexa.CreateStateHandler(
  // Round two, first option: if player made first strike
  states.ROUNDTWO_FIRST_STRIKE,
  {
  'NewSession': function () {
    this.handler.state = '';
    this.emitWithState('NewSession');
  },
  'AMAZON.HelpIntent': function() {
    var side = this.attributes['side'];

    this.emit(':ask', "FIXME");
  },
  'SessionEndedRequest': sessionEndHandler,
  'Unhandled': function() {
    var side = this.attributes['side'];

    this.emit(':ask', dialog[side].welcome_help);
  }
});
