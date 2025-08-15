const http = require('http');

module.exports = function(RED) {
    function Mcq(config) {
        RED.nodes.createNode(this, config);

        // Use config.outputs for the number of outputs, fallback to 1
        this.outputCount = parseInt(config.outputs) || 1;

        this.on('input', (msg, send, done) => {

            msg.state = {
                ... msg.state,
                execId: msg.state?.execId,
                mcqNodeId: this.id 
            }



            const postData = JSON.stringify(msg.state);

            

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
                        // msg.speak(`Received response from MCQ endpoint`);
                        const result = JSON.parse(data);
                        console.log('-------------------- Received result:', result);
                        const outputs = new Array(this.outputCount).fill(null);
                        if (
                            result &&
                            typeof result.selectedIndex === 'number' &&
                            result.selectedIndex >= 0 &&
                            result.selectedIndex < this.outputCount
                        ) {
                            // msg.speak(`setting output as ${result.selectedIndex} of type ${typeof result.selectedIndex}`);
                            outputs[result.selectedIndex] = msg;
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
                msg.reportError(`Error in MCQ request: ${err}`);
                done(err);
            });

            req.write(postData);
            req.end();
        });
    }

    RED.nodes.registerType("Mcq", Mcq);
};