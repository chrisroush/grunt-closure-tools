/*jshint camelcase:false */

/**
 * Copyright 2012 Thanasis Polychronakis. Some Rights Reserved.
 *
 * =======================
 *
 * closureCompiler.js Combines and optionally compiles javascript files
 *
 */

/**
 * The closureCompiler grunt task
 *
 */

var taskLib = require('task-closure-tools');
var cCompiler = taskLib.compiler;
var cHelpers = taskLib.helpers;

module.exports = function( grunt ) {

  grunt.registerMultiTask('closureCompiler', 'Google Closure Library compiler', function() {
    // Tell grunt this task is asynchronous.
    var compileDone = this.async();

    var options = this.options();
    if ( !cCompiler.validateOpts( options ) ) {
      grunt.log.error('closureCompiler Task Failed :: Options');
      return;
    }

    // Iterate over all specified file groups.
    var commands = [], cmd,
        targetName = this.target;

    var isMapping = this.files.length > 1;
    var genSourceMap = (options.compilerOpts && options.compilerOpts.create_source_map === null);

    var dest = options.output;
    var input = [].concat( options.src );

    // Add the closure library
    input = input.concat( [
      options.closureLibraryPath + '/**.js',
      '!' + options.closureLibraryPath + '/**test.js'
    ]);




    // for file mappings overwrite the source_map filename with 'dest' name + '.map' suffix
    if (isMapping && genSourceMap) {
      options.compilerOpts.create_source_map = dest + '.map';
    }

    cmd = cCompiler.compileCommand( options, input, dest );

    if ( cmd ) {
      commands.push( {cmd: cmd, dest: targetName} );
    } else if (!options.checkModified) {
      grunt.log.error( 'FAILED to create command line for target: ' + targetName.red );
    }


    if ( 0 === commands.length ) {
      if (options.checkModified) {
        compileDone(true);
        return;
      }

      grunt.log.error('No commands produced for shell execution. Check your config file');
      compileDone(false);
      return;
    }

    // release the kraken!
    // console.log( commands[ 0 ].cmd );

    cHelpers.runCommands( commands, compileDone, false, options.execOpts );
  });

};
