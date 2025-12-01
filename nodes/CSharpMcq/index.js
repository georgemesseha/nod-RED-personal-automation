const http = require('http');

module.exports = function(RED) {
    function CSharpMcq(config) {
        RED.nodes.createNode(this, config);

        // Use config.outputs for the number of outputs, fallback to 1
        this.outputCount = parseInt(config.outputs) || 1;

        this.on('input', (msg, send, done) => {
            
        });
    }

    RED.nodes.registerType("CSharpMcq", CSharpMcq);
};