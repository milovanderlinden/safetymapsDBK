module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodeunit: {
            all: ['test/*_test.js'],
            options: {
                reporter: 'junit',
                reporterOptions: {
                    output: 'test'
                }
            }
        },
        copy: {
            main: {
                files: 
                    [
                        {
                            cwd: 'public/images',
                            src: [ '**' ],
                            dest: 'build/public/images',
                            expand: true
                        }
                    ]
            }
        },
        clean: {
            build: {
                src: ['build']
            }
        },
        less: {
            dist: {
                files: {
                    'public/css/dbk.css': 'less/style.less'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'public/css/dbk.min.css': [
                        'public/css/dbk.css',
                        'public/js/libs/bootstrap-3.2.0-dist/css/bootstrap.css',
                        'public/css/daterangepicker-bs3.css',
                        'public/css/typeahead.js-bootstrap.css',
                        'public/css/slider.css'
                    ]
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask(
            'build',
            'Compiles all of the assets and copies the files to the build directory.',
            ['clean', 'copy']
            );
    grunt.registerTask('default', ['less', 'cssmin', 'nodeunit']);
    grunt.registerTask('exportdbk', 'Export all DBK objects to json', function () {
        global.conf = require('nconf');
        global.conf.argv().env();
        global.conf.file({file: 'config.json'});

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        // Run some sync stuff.
        grunt.log.writeln('Processing task...');
        // And some async stuff.
        setTimeout(function () {
            grunt.log.writeln('All done!');
            done();
        }, 1000);
    });
};

