let assert = require('assert');

const Constants = require('../src/constants.js');

describe('test-constants', () => {
  it('should have the same dialog options for each side', () => {
    const dialog = Constants.dialog;
    let russian = Object.keys(dialog.russia);
    let american = Object.keys(dialog.america);

    assert(russian.every( (item, idx) => {
      return american.includes(item);
    }));

    assert(american.every( (item, idx) => {
      return russian.includes(item);
    }));
  });

})
