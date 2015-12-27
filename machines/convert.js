module.exports = {

  friendlyName: 'Convert',

  description: 'Convert Natural Language to file system path',

  extendedDescription: 'Convert Natural Language to file system path',

  inputs: {

    string: {

      example: 'Go to Google Drive go into School go into 2015 2016 and find the Cryptography folder',

      description: 'The natural language path',

      required: true
    }

  },

  defaultExit: 'success',

  exits: {

    error: {
      description: 'An unexpected error occurred.'
    },

    success: {
      example: '/User/Glavin/Google Drive/School/2015-2016/CSCI 4423 - Cryptography',
      description: 'The file system absolute path'
    }
  },

  fn: function(inputs, exits) {

    /**
     * Module Dependencies
     */
    var string = inputs.string;
    var resolve = require('machine').build(require('./resolve'));
    // var nlp = require('machinepack-nlp');
    var _ = require('lodash');

    // TODO: improve robustness
    var stopwords = ['go','to','into','in','under','and','find','the','folder','directory','file'];
    // var inputSeparator = /[\\., ]+/;
    var inputSeparator = new RegExp(stopwords.join('\\s|'), 'gi');
    var tokens = (string+' ').split(inputSeparator);
    tokens = _.compact(tokens.map(function(token) {
      return token.trim();
    }));
    // tokens = _.compact(tokens.map(function(value) {
    //   if (stopwords.indexOf(value.toLowerCase()) != -1) {
    //     return '';
    //   }
    //   return value.toLowerCase();
    // }));
    // console.log('tokens', tokens);
    // Check if reverse order
    if (_.contains(string.toLowerCase(), ' under ') || _.contains(string.toLowerCase(), ' in ')) {
      tokens = tokens.reverse();
    }
    // console.log('tokens2', tokens);
    // Process
    return resolve({
      names: tokens
    }).exec({
      error: exits.error,
      notFound: exits.error,
      success: exits.success
    });

    //  return nlp.tokenize({
    //    string: string
    //  }).exec({
    //    error: exits.error,
    //    success: function(tokens) {
    //     //  console.log(tokens);
    //      var absPath = "/User/Glavin/Google Drive/School/2015-2016/CSCI 4423 - Cryptography/";
    //      // Return an object containing myLength and the secretCode
    //      return exits.success(absPath);
    //    }
    //  });

  }

};