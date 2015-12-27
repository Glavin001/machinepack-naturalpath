module.exports = {

  friendlyName: 'Resolve',

  description: 'Resolve list of directory names to file system path',

  extendedDescription: 'Resolve list of directory names to file system path',

  inputs: {

    names: {

      example: ['Google Drive', 'School', '2015 2016', 'Cryptography'],

      description: 'List of directory names',

      required: true
    },

    cwd: {
      example: '/Users/Glavin',
      description: 'Current working directory to resolve the directory names',
      required: false
    }

  },

  defaultExit: 'success',

  exits: {

    error: {
      description: 'An unexpected error occurred.'
    },
    notFound: {
      description: 'Not found'
    },
    success: {
      example: '/Users/glavin/Google Drive/School/2015-2016/CSCI 4423 - Cryptography/',
      description: 'The file system absolute path'
    }
  },

  fn: function(inputs, exits) {

    /**
     * Module Dependencies
     */
    var names = inputs.names;
    var Paths = require('machinepack-paths');
    var cwd = inputs.cwd || Paths.home({}).execSync();
    //  console.log(cwd);
    if (names.length === 0) {
      return exits.success(cwd);
    }
    // Get top name
    var name = names[0];
    var async = require('async');
    var fs = require('machinepack-fs');
    var nlp = require('machinepack-nlp');
    var fuzzaldrin = require('fuzzaldrin');
    var score = fuzzaldrin.score;
    var self = require('machine').build(require('./resolve'));

    return fs.ls({
      dir: cwd
    }).exec({
      error: exits.error,
      doesNotExit: exits.error,
      success: function(dirPaths) {
        //  console.log(dirPaths);
        return async.map(dirPaths, function(dirPath, cb) {
          return Paths.parse({
            path: dirPath
          }).exec({
            error: cb,
            success: function(result) {
              var currName = result.name;
              // return nlp.levenshtein({
              //   a: name.toLowerCase(),
              //   b: currName.toLowerCase()
              // }).exec({
              //   error: cb,
              //   success: function(distance) {
              // Adjust for currName being shorter than name
              // var bias = Math.abs(currName.length -
              //   name.length);
              //  distance += bias;
              var distance2 = score(currName.toLowerCase(),
                name.toLowerCase());

              return cb(null, {
                name: currName,
                path: dirPath,
                // distance: distance,
                distance: distance2
              });
              //   }
              // });
            }
          });
        }, function(error, result) {
          //  console.log(error, result);
          if (error) {
            return exits.error(error);
          }
          // var sortedAsc = result.sort(function(a, b) {
          //   return a.distance - b.distance;
          // });
          var sortedDesc = result.sort(function(a, b) {
            return b.distance - a.distance;
          });
          // console.log('sortedDesc', sortedDesc);
          var next = sortedDesc[0];
          if (next.distance === 0) {
            return exits.notFound(name+' not found in '+cwd);
          }
          var nextPath = next.path;
          // console.log('nextPath', nextPath);
          // Remove first name
          names.shift();
          //  console.log('newNames', names);
          return self({
            cwd: nextPath,
            names: names
          }).exec({
            error: exits.error,
            success: exits.success
          });
          //  var absPath = "/User/Glavin/Google Drive/School/2015-2016/CSCI 4423 - Cryptography/";
          //  // Return an object containing myLength and the secretCode
          //  return exits.success(absPath);
        });

      }
    });

  }

};