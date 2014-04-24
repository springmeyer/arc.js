/* global module */
module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                src: 'arc.js',
                dest: 'dist/'
            }
        },
        uglify: {
            build: {
                src: 'arc.js',
                dest: 'dist/arc.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            all: ['*.js'] // examples not yet checked
        },
        tape: {
            options: {
                pretty: true,
                output: 'console'
            },
            files: ['test/**/*.js']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-tape');
    grunt.registerTask('default', ['jshint', 'tape', 'uglify', 'copy']);
};
