/*jshint esversion: 6, node: true */
"use strict";

const Alexa = require('alexa-sdk');
const Constants = require('./constants.js');

const dialog = Constants.dialog;
const appId = process.env.ALEXA_APPID;

console.assert(appId, "The environment variable 'ALEXA_APPID' must be set");

exports.handler = function (event, context, callback) {
  let alexa = Alexa.handler(event, context);
  alexa.appId = appId;

  alexa.registerHandlers(newSessionHandlers,
    selectSideModeHandlers,
    roundOneModeHandlers,
    roundTwoModeHandlers);

  alexa.execute();
};

const states = {
  SELECTSIDE: '_SELECTSIDE',
  ROUNDONE: '_ROUNDONE',
  ROUNDTWO: '_ROUNDTWO',
  END: '_END'
};

function sessionEndHandler() {
  // jshint validthis: true
  this.attributes.gamesPlayed += 1;
  this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
}

function newSessionHandler() {
  // jshint validthis: true
  this.attributes.gamesPlayed += 1;
  this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB

  this.handler.state = '';
  this.emitWithState('NewSession');
}

let newSessionHandlers = {
  // New session; first time play, a reset, or new game
  'NewSession': function () {
    if(Object.keys(this.attributes).length === 0) { // First time skill invoked
      this.attributes.gamesPlayed = 0;
      this.attributes.side = "";
//      this.attributes.cities = [];

    }
    let gamesPlayed = this.attributes.gamesPlayed.toString();
    this.emit(':ask',
      dialog.common.start.replace(/{gamesPlayed}/g, gamesPlayed),
      dialog.common.start_prompt);
  },
  'AMAZON.YesIntent': function () {
    this.handler.state = states.SELECTSIDE;
    this.emit(':ask',
      dialog.common.pick_side,
      dialog.common.pick_side_prompt);
  },
  'AMAZON.NoIntent': function () {
    this.emit(':tell', dialog.common.quit);
  },
  'Unhandled': function () {
    this.emit(':ask', dialog.common.unhandled);
  }
};

let selectSideModeHandlers = Alexa.CreateStateHandler(states.SELECTSIDE, {
  // Select a side: Russia or the US.
  'NewSession': newSessionHandler,
  'AMAZON.HelpIntent': function () {
    this.emit(':ask', dialog.common.pick_side_prompt);
  },
  'SessionEndedRequest': sessionEndHandler,
  'AmericaIntent': function () {
    let side = this.attributes.side = 'america';
    this.handler.state = states.ROUNDONE;
    this.emit(':ask', dialog[side].welcome, dialog[side].welcome_help);
  },
  'RussiaIntent': function () {
    let side = this.attributes.side = 'russia';
    this.handler.state = states.ROUNDONE;
    this.emit(':ask', dialog[side].welcome, dialog[side].welcome_help);
  },
  'Unhandled': function () {
    this.emit(':ask', dialog.common.unhandled);
  }
});

let roundOneModeHandlers = Alexa.CreateStateHandler(states.ROUNDONE, {
  // Round one: decide to make first strike surprise attack or not
  'NewSession': newSessionHandler,
  'AMAZON.HelpIntent': function () {
    let side = this.attributes.side;

    this.emit(':ask', dialog[side].welcome_help);
  },
  'SessionEndedRequest': sessionEndHandler,
  'AMAZON.YesIntent': function () {
    this.handler.state = states.ENDGAME;
    let side = this.attributes.side;
    this.emit(':tell', dialog[side].first_strike);
  },
  'AMAZON.NoIntent': function () {
    this.handler.state = states.ROUNDTWO;
    let side = this.attributes.side;
    this.emit(':ask', dialog[side].under_attack +
      " break time='4s' /> " +
      dialog[side].retaliate);
  },
  'Unhandled': function () {
    let side = this.attributes.side;

    this.emit(':ask', dialog[side].welcome_help);
  }
});

let roundTwoModeHandlers = Alexa.CreateStateHandler(
  // Round two, ask if retaliating
  states.ROUNDTWO,
  {
  'NewSession': newSessionHandler,
  'AMAZON.HelpIntent': function () {
    let side = this.attributes.side;

    this.emit(':ask', dialog[side].retaliate);
  },
  'SessionEndedRequest': sessionEndHandler,
  'AMAZON.YesIntent': function () {
    this.handler.state = states.ENDGAME;
    let side = this.attributes.side;
    this.emit(':tell', dialog[side].launch_retaliation);

  },
  'AMAZON.NoIntent': function () {
    let side = this.attributes.side;
    this.emit(':ask', dialog[side].insist_retaliation,
      dialog[side].insist_retaliation_2);
  },
  'Unhandled': function () {
    let side = this.attributes.side;

    this.emit(':ask', dialog[side].retaliate);
  }
});

let EndModeHandlers = Alexa.CreateStateHandler(
  // Round two, ask if retaliating
  states.END,
  {
  'NewSession': newSessionHandler,
  'AMAZON.HelpIntent': function () {
    let side = this.attributes.side;

    this.emit(':ask', dialog[side].retaliate);
  },
  'SessionEndedRequest': sessionEndHandler,
  'AMAZON.YesIntent': newSessionHandler,
  'AMAZON.NoIntent': function () {
    let side = this.attributes.side;

    this.emit(':tell', dialog[side].end);
  },
  'Unhandled': function () {
    let side = this.attributes.side;

    this.emit(':ask', dialog[side].retaliate);
  }
});
