const http = require('http');

module.exports = function(RED) {
    function SimpleOutputsNode(config) {
        RED.nodes.createNode(this, config);

        // Use config.outputs for the number of outputs, fallback to 1
        this.outputCount = parseInt(config.outputs) || 1;

        this.on('input', (msg, send, done) => {

            msg.state = {
                ... msg.state,
                execId: msg.state?.execId || this.i,
            }

            const postData = JSON.stringify({ mcqNodeId: this.id });

            const options = {
                hostname: '127.0.0.1',
                port: 5101,
                path: '/mcq3',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {

                    try {
                        const result = JSON.parse(data);
                        const outputs = new Array(this.outputCount).fill(null);
                        if (
                            result &&
                            typeof result.selectedIndex === 'number' &&
                            result.selectedIndex >= 0 &&
                            result.selectedIndex < this.outputCount
                        ) {
                            outputs[result.selectedIndex] = msg;
                            // outputs[2] = msg;
                        }
                        send(outputs);
                        done();
                    } catch (err) {
                        this.error('Failed to parse response or invalid answerIndex', err);
                        done(err);
                    }
                });
            });

            req.on('error', (err) => {
                this.error('HTTP request failed', err);
                done(err);
            });

            req.write(postData);
            req.end();
        });
    }

    RED.nodes.registerType("simple-outputs", SimpleOutputsNode);
};