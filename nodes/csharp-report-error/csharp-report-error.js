const http = require('http');

module.exports = function(RED) {
    function CSharpReportError(config) {
        RED.nodes.createNode(this, config);

        // Use config.outputs for the number of outputs, fallback to 1
        this.outputCount = 1;

        this.on('input', (msg, send, done) => {
            
        });
    }

    RED.nodes.registerType("csharp-report-error", CSharpReportError);
};