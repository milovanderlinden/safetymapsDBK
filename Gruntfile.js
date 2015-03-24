module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files:
                        [
                            {
                                cwd: 'public/images',
                                src: ['**'],
                                dest: 'build/images',
                                expand: true
                            },
                            {
                                cwd: 'public/js',
                                src: ['dbk.min.js'],
                                dest: 'build/js',
                                expand: true
                            },
                            {
                                cwd: 'public/css',
                                src: ['dbk.min.css'],
                                dest: 'build/css',
                                expand: true
                            },
                            {
                                cwd: 'locales',
                                src: ['**'],
                                dest: 'build/locales',
                                expand: true
                            },
                            {
                                cwd: 'node_modules/i18next/lib/dep',
                                src: ['i18next.js'],
                                dest: 'build/i18next',
                                expand: true
                            }
                        ]
            }
        },
        clean: {
            build: {
                src: ['build', 'public/js/dbk.min.js', 'public/css/dbk.min.css']
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
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('organisation', 'Export organisation settings to organisation.json in build', function () {
        var cb = this.async();
        global.conf = require('nconf');
        global.conf.argv().env();
        global.conf.file({file: 'config.json'});
        var dbURL = 'postgres://' +
                global.conf.get('database:user') + ':' +
                global.conf.get('database:password') + '@' +
                global.conf.get('database:host') + ':' +
                global.conf.get('database:port') + '/' +
                global.conf.get('database:dbname');
        var dbkcontroller = require('./controllers/dbk.js');
        var anyDB = require('any-db');
        global.pool = anyDB.createPool(dbURL, {min: 2, max: 20});
        dbkcontroller.getOrganisation({params: {id: 0}, query: {srid: 28992}}, {json: function (json) {
                if (json.organisation) {
                    //skip wms
                    delete json.organisation.wms;

                    grunt.file.write('build/api/organisation.json', JSON.stringify(json));

                    cb();
                } else {
                    cb('Could not create organisation.json');
                }

            }
        });
    });
    grunt.registerTask('features', 'Export features.json in build', function () {
        var cb = this.async();
        global.conf = require('nconf');
        global.conf.argv().env();
        global.conf.file({file: 'config.json'});
        var dbURL = 'postgres://' +
                global.conf.get('database:user') + ':' +
                global.conf.get('database:password') + '@' +
                global.conf.get('database:host') + ':' +
                global.conf.get('database:port') + '/' +
                global.conf.get('database:dbname');
        var dbkcontroller = require('./controllers/dbk.js');
        var anyDB = require('any-db');
        global.pool = anyDB.createPool(dbURL, {min: 2, max: 20});
        dbkcontroller.getFeatures({params: {id: 0}, query: {srid: 28992}}, {json: function (json) {
                grunt.file.write('build/api/features.json', JSON.stringify(json));
                //loop through the features to grab single files.
                cb();
            }
        });
    });
    grunt.registerTask('index', 'Export index page to index.html in build', function () {
        var cb = this.async();
        var indexroute = require('./routes/index.js');
        indexroute.indexy({}, {render: function (render) {
                console.log(render);
                cb();
            }
        });
    });
    grunt.registerTask('default', ['clean', 'cssmin', 'uglify', 'copy']);
};

