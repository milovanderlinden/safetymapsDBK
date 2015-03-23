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
                                src: ['**'],
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
        uglify: {
            js: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                            '<%= grunt.template.today("yyyy-mm-dd") %> */ \n' +
                            'var dbkjsbuildinfo = {};\n' +
                            'dbkjsbuildinfo.VERSION = "<%= pkg.version %>";\n' +
                            'dbkjsbuildinfo.RELEASEDATE = "<%= grunt.template.today("yyyy-mm-dd") %>";\n' +
                            'dbkjsbuildinfo.APPLICATION = "<%= pkg.name %>";\n' +
                            'dbkjsbuildinfo.REMARKS = "<%= pkg.description %>";\n'
                    ,
                    beautify: {
                        width: 80,
                        beautify: true
                    }
                },
                files: {'public/js/dbk.min.js': [
                        'public/js/libs/jquery.pagination.js',
                        'public/js/libs/jquery.drags.js',
                        'public/js/libs/jquery.sortable.js',
                        'public/js/libs/jquery.typeahead.js',
                        'public/js/libs/jquery.daterangepicker.js',
                        'public/js/dbkjs/util.js',
                        'public/js/dbkjs/config/styles.js',
                        'public/js/dbkjs/prototype/Class.js',
                        'public/js/dbkjs/prototype/Layer.js',
                        'public/js/dbkjs/prototype/Capabilities.js',
                        'public/js/dbkjs/layout.js',
                        'public/js/dbkjs/modules/geolocate.js',
                        'public/js/dbkjs/protocol/jsonDBK.js',
                        'public/js/dbkjs/modules/search.js',
                        'public/js/dbkjs/modules/support.js',
                        'public/js/dbkjs/modules/print.js',
                        'public/js/dbkjs/modules/care.js',
                        'public/js/dbkjs/modules/filter.js',
                        'public/js/dbkjs/modules/bag.js',
                        'public/js/dbkjs/modules/feature.js',
                        'public/js/dbkjs/modules/measure.js',
                        'public/js/dbkjs/modules/layertoggle.js',
                        'public/js/dbkjs/modules/gms.js',
                        'public/js/dbkjs/gui.js',
                        'public/js/dbkjs/layers.js',
                        'public/js/dbkjs/mapcontrols.js',
                        'public/js/dbkjs/dbkjs.js'
                    ]
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
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask(
            'build',
            'Compiles all of the assets and copies the files to the build directory.',
            ['clean', 'copy', 'cssmin', 'uglify']
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

