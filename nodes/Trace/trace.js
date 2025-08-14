module.exports = function(RED) {
    function Trace(config) {
        RED.nodes.createNode(this, config);
        // This node does nothing for now
    }
    RED.nodes.registerType("Trace", Trace);
};