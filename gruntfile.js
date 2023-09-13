module.exports = function (grunt) {
    grunt.initConfig({
        uncss: {
            dist: {
                files: [
                    { src: 'filter.html', dest: 'cleancss/filterFilter.css' }
                ]
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-uncss'); 

    // Default tasks
    grunt.registerTask('default', ['uncss']);
};


 