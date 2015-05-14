'use strict';

function validateOptions(options, callback) {
  if (!options) {
    return callback(new Error('Missing required input: options'), null);
  }

  if (!options.mottaker) {
    return callback(new Error('Missing required input: options.mottaker'), null);
  }

  if (!options.tittel) {
    return callback(new Error('Missing required input: options.tittel'), null);
  }

  if (!options.dokumenter) {
    return callback(new Error('Missing required input: options.dokumenter'), null);
  }
  return callback(null, {'status':'ok'});
}

module.exports = validateOptions;
