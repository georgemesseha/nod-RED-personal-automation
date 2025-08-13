module.exports = function(RED) {
    function SimpleOutputsNode(config) {
        RED.nodes.createNode(this, config);
        
        // Get output count from numeric property
        this.outputCount = parseInt(config.outputCount) || 1;
        
        // Split text into lines for label matching (optional, can be removed if not needed)
        const lines = config.outputLines 
            ? config.outputLines.split('\n').filter(line => line.trim() !== '')
            : [];
        
        this.on('input', (msg, send, done) => {
            // Create outputs array
            const outputs = new Array(this.outputCount).fill(null);
            
            // Find output index based on message content
            let outputIndex = -1;
            
            if (msg.payload !== undefined) {
                // Try to match payload with line content
                outputIndex = lines.findIndex(line => {
                    return String(msg.payload).trim() === line.trim();
                });
                
                // If no match, try to use payload as index
                if (outputIndex === -1 && !isNaN(msg.payload)) {
                    const index = parseInt(msg.payload);
                    if (index >= 0 && index < this.outputCount) {
                        outputIndex = index;
                    }
                }
            }
            
            // Send to appropriate output
            if (outputIndex >= 0 && outputIndex < outputs.length) {
                outputs[outputIndex] = msg;
            }
            
            send(outputs);
            done();
        });
    }
    
    RED.nodes.registerType("simple-outputs",SimpleOutputsNode);
}