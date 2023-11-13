module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            site_name: 'Monroe Hardware Company, Inc.',
            build_date: '<%= grunt.template.today("yyyymmddHHMM") %>',
            version_string: '<=% pkg.version %>-<%= meta.build_date %>'
        },
        env: {
            api: "127.0.0.1:9999"
        },

        buildTemplates: {
            options: grunt.file.readJSON('etc/tmpl_config.json')
        },

        testServer: {
            options: grunt.file.readJSON("etc/test_server.json")
        },

        concat: {
            options: {
                sourceMap: true,
                process: true
            },
            site: {
                src: ['src/site/site.js'],
                dest: 'www/js/site.js'
            },

            utils: {
                src: ['src/utils/turbo.js', 'src/utils/tabular.js'],
                dest: 'www/js/utils.js'
            }
        },

        copy: {
            js: {
                expand: true,
                cwd: 'src/pages/',
                src: ['*'],
                dest: 'www/js/'
            },

            assets: {
                expand: true,
                cwd: 'assets/',
                src: ['**'],
                dest: 'www/'
            }
        }
    });


    grunt.config.merge({
        buildTemplates: {
            options: {  }
        }
    });
    
    
    /*================================
        Register Plugins
    ================================*/

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.loadTasks('./src/grunt');


    /*================================
        Target & Target Settings
    ================================*/
    
    let target = grunt.option('target') || 'dev';
    if(target != 'dev') grunt.config.merge(grunt.file.readJSON(`etc/${target}.json`));


    /*================================
        Basic Tasks
    ================================*/

    const Tasks = {
        default: ['jsbuild', 'templates', 'copy:assets'],
        templates: ['buildTemplates'],
        jsbuild: ['concat:site', 'concat:utils', 'copy:js'],
        deploy: (target != 'dev') ? ['default','stage'] : ['default'],
        test: ['default','testServer']
    };

    Object.keys(Tasks).map( k => grunt.registerTask(k, Tasks[k]) );

    /*
    grunt.registerTask("stage", "Deploy to staging/sync directory.", function() {
        grunt.file.copy("www", grunt.config.get('env.deploy'));
    });
    */

    grunt.registerTask("stage", "Deploy to GitHub.", function() {
        let done = this.async();
        
        let ghp = require('gh-pages');
        ghp.publish('www', {
            branch: 'gh-pages'
        }, (err) => {
            if(err) console.log(err);
            else done();
        });
    });
}

