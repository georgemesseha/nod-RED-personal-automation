let trialId = 0;

const request = require('sync-request');
module.exports = function(RED) {
    function Trace(config) {
        RED.nodes.createNode(this, config);
        const nodeId = this.id;
        this.on('input', async (msg, send, done) => {
            ///////////////// test
            trialId++;
            msg.trialId = trialId;
            
            msg.score = msg.score ?? 0;
            msg.score += 100;
            ///////////////// end test
            
            if(!msg.gotcha)
            {
                //----------------------------------------------
                msg.post = (url, obj) => {
                    try {
                        try {
                            const res = request('POST', url, {
                                json: obj, // automatically stringifies and sets Content-Type
                                headers: { 'Content-Type': 'application/json' },
                            });

                            const body = res.getBody('utf8');
                            try {
                                return JSON.parse(body);
                            } catch {
                                return body; // not JSON
                            }
                        } catch (ex) {
                            console.error('Error: ' + ex);
                            return null;
                        }
                    } catch (ex) {
                        console.error('Error: ' + ex);
                        return null;
                    }

                }
                msg.postAsync = async (url, obj, timeoutMs = null) => {
                    const controller = timeoutMs ? new AbortController() : null;
                    const timeoutId = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;

                    try {
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(obj),
                            signal: controller?.signal
                        });

                        const text = await res.text();
                        return JSON.parse(text || null) ?? text;
                    } catch (ex) {
                        console.error('Error posting to ' + url + ':', ex);
                        return null;
                    } finally {
                        if (timeoutId) clearTimeout(timeoutId);
                    }
                };

                //----------------------------------------------
                msg.httpGetText = (url) => {
                    try {
                        try {
                            const res = request('GET', url, {
                                headers: { 'Content-Type': 'application/json' },
                                timeout: 0 // No timeout
                            });

                            return res.getBody('utf8');
                        } catch (ex) {
                            console.error('Error: ' + ex);
                            return null;
                        }
                    } catch (ex) {
                        console.error('Error: ' + ex);
                        return null;
                    }
                }

                //-----------------------------------------

                msg.httpGetObject = (url) => {
                    const text = msg.httpGetText(url);
                    return JSON.parse(text);
                }
                //----------------------------------------------
                msg.gotcha = (endpointName) => {
                    return msg.post(`http://127.0.0.1:5101/${endpointName}`, msg.state);
                };

                msg.gotchaAsync = async (endpointName) => {
                    return msg.postAsync(`http://127.0.0.1:5101/${endpointName}`, msg.state);
                }
                //-----------------------------------------
                msg.reportError = (error, nodeId) => {
                    msg.speakAsync(`Error encountered on Node-RED side.`);
                    msg.state = {
                        ...msg.state,
                        errorMessage: error,
                        nodeId: nodeId
                    }
                    return msg.gotcha("reportError");
                }
                //-----------------------------------------
                msg.reportInfo = async (info) => {
                    msg.state = {
                        ...msg.state,
                        infoMessage: info ?? 'empty-info'
                    }
                    return msg.gotcha("reportInfox");
                }

                //-----------------------------------------
                msg.try = (node, func) => 
                {
                    let _msg;
                    try 
                    {
                        _msg = func();
                        return _msg;
                    }
                    catch (ex) 
                    {
                        console.error(`Error in node ${node.id}: ${ex}`);
                        msg.reportError(ex.toString() ?? 'empty-error', node.id);
                        return null;
                    }
                };

                //-----------------------------------------
                msg.speak = (toSpeak) => {
                    msg.state = {
                        ...msg.state,
                        toSpeak
                    }
                    return msg.gotcha('speak', msg.state);
                }
                msg.speakAsync = async function(toSpeak) {
                    msg.state = {
                        ...msg.state,
                        toSpeak
                    }
                    return await msg.gotchaAsync('speak', msg.state);
                }

                msg.traceAsync = async (nodeId) => {
                    msg.state = {
                        ...msg.state,
                        execId: msg.state?.execId ?? crypto.randomUUID(),
                        srcFunctionNodeId: nodeId,
                        env: {
                            ...msg.state?.env
                        }
                    }

                    // console.log(JSON.stringify(msg.state));

                    var result = await msg.gotchaAsync('hitBookmark', msg.state);
                    msg.state = {
                        ...msg.state,
                        ...result
                    }
                }
                msg.enrichStateWithContextMetadataAsync = async (nodeId) => {
                    msg.state = {
                        ...msg.state,
                        execId: msg.state?.execId ?? crypto.randomUUID(),
                        srcFunctionNodeId: nodeId,
                        env: {
                            ...msg.state?.env
                        }
                    }
                    var result = await msg.gotchaAsync('enrichStateWithContextMetadataAsync');
                    msg.state = {
                        ...msg.state,
                        ...result
                    }
                }
                //-----------------------------------------
                msg.eval = (expr) => {
                    try {
                        return eval(expr)
                    }
                    catch (expt) {
                        throw `Coulnd't evaluate expression [${expr}] ${expt}`
                    }
                }
                //----------------------------------------------------
            }

            // msg = RED.util.cloneMessage(msg);

            console.log("-----------------before enrichStateWithContextMetadataAsync-----------------");
            await msg.enrichStateWithContextMetadataAsync(nodeId);
            console.log("-----------------after enrichStateWithContextMetadataAsync-----------------");
            console.log("-----------------before eval expressions-----------------");
            if (msg.state.newEnv) 
            {
                console.log("******************** inside eval expressions ************************")
                msg.state.env = {
                    ...msg.state.env
                }
                for (const varName in msg.state.newEnv) 
                {
                    const expr = RED.util.evaluateNodeProperty(varName, "env", this, msg);
                    console.log(`******************** eval ${varName} = expr(${expr}) ************************`)
                    // const expr = config[varName];
                    if (!expr) continue;

                    // console.log(`************ expr to eval: ${expr}`);
                    const value = eval(expr);
                    msg.state.env[varName] = value;
                }

                //msg.state.newEnv = null;
            }
            console.log(msg.state.env);
            console.log("-----------------after eval expressions-----------------");
            console.log("-----------------before traceAsync-----------------");
            await msg.traceAsync(nodeId);
            console.log("-----------------after traceAsync-----------------");
            
           
            


            send(msg);
            done();
        });
    }
    RED.nodes.registerType("Trace", Trace);
};