const { WebServer } = require('trilliant-webserver');

module.exports = function(grunt) {
    grunt.registerTask('testServer', 'Serve a test site.', serve);
};

function serve() {
    this.done = this.async();
    console.log("Launching test server. Ctrl+C to exit.");    
    const svr = new WebServer(this.options({}));
    svr.start();
}
