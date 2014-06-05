module.exports = function(grunt) {

  grunt.initConfig({

    // CLI Tasks
    shell: {
      precompile: {
        command: 'node precompile.js',
        options: {
          stdout: true,
          failOnError: true
        }
      }
    },

    // Clean
    clean: {
      temp: ['.tmp']
    },


    // Set env vars
    env : {
      test : {
        NODE_ENV : 'test',
      }
    },

    // Tests
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: ['coffee-script/register']
        },
        src: ['test/**/*.coffee']
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-env');

  // Run server side tests
  grunt.registerTask('test', ['env:test','mochaTest']);

  // Run this task before starting in production
  grunt.registerTask('production', [
    'clean',
    'shell:precompile'
  ]);

  // This is Sails's default task when launching the app in production.
  // But Sails runs this task in a different order, and we need to
  // precompile our assets before any middleware is run
  // therefore we run grunt production manually instead
  grunt.registerTask('prod', function() {
    return;
  });

  // Nothing needs to happen in a dev environment :)
  grunt.registerTask('default', function() {
    return;
  });

  grunt
};