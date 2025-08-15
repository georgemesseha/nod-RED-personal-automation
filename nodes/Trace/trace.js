let trialId = 0;

const request = require('sync-request');
module.exports = function(RED) {
    function Trace(config) {
        RED.nodes.createNode(this, config);
        
        const node = this;
        
        this.on('input', async (msg, send, done) => {
            if (!msg.gotcha) {
                //----------------------------------------------
                msg.post = function (url, obj) {
                    try {
                        try {
                            const res = request('POST', url, {
                                json: obj, // automatically stringifies and sets Content-Type
                                headers: { 'Content-Type': 'application/json' }
                            });

                            const body = res.getBody('utf8');
                            try {
                                return JSON.parse(body);
                            } catch {
                                return body; // not JSON
                            }
                        } catch (ex) {
                            return null;
                        }
                    } catch (ex) {
                        return null;
                    }

                }
                msg.postAsync = async function (url, obj) {
                    try {
                        const res = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(obj)
                        });

                        const text = await res.text();

                        try {
                            return JSON.parse(text); // Try to parse as JSON
                        } catch {
                            return text; // Return raw text if not JSON
                        }

                    } catch (ex) {
                        msg.reportError(ex.toString())
                        return null;
                    }
                }
                //----------------------------------------------
                msg.httpGetText = function (url) {
                    try {
                        try {
                            const res = request('GET', url, {
                                headers: { 'Content-Type': 'application/json' }
                            });

                            return res.getBody('utf8');
                        } catch (ex) {
                            return null;
                        }
                    } catch (ex) {
                        return null;
                    }
                }

                //-----------------------------------------

                msg.httpGetObject = function (url) {
                    const text = msg.httpGetText(url);
                    return JSON.parse(text);
                }
                //----------------------------------------------
                msg.gotcha = function (endpointName, state) {
                    return msg.post(`http://127.0.0.1:5101/${endpointName}`, state);
                };

                msg.gotchaAsync = async function (endpointName, state) {
                    return await msg.postAsync(`http://127.0.0.1:5101/${endpointName}`, state);
                }
                //-----------------------------------------
                msg.reportError = function (error) {
                    msg.speak(`Error encountered in code on Node-RED`);
                    msg.state = {
                        ...msg.state,
                        errorMessage: error
                    }
                    return msg.gotcha("reportError");
                }
                //-----------------------------------------
                msg.reportInfo = async function (info) {
                    msg.state = {
                        ...msg.state,
                        infoMessage: info ?? 'empty-info'
                    }
                    return msg.gotcha("reportInfox");
                }

                //-----------------------------------------
                msg.try = function (node, func) {
                    let _msg;
                    try {
                        _msg = func();
                    }
                    catch (ex) {
                        msg.reportError(ex.toString() ?? 'empty-error', node?.id);
                        return null;
                    }
                    return _msg;
                };

                //-----------------------------------------
                msg.speak = function (toSpeak) {
                    msg.state = {
                        ...msg.state,
                        toSpeak
                    }
                    return msg.gotcha('speak', msg.state);
                }
                msg.speakAsync = function (toSpeak) {
                    msg.state = {
                        ...msg.state,
                        toSpeak
                    }
                    return msg.gotchaAsync('speak', msg.state);
                }
                //-----------------------------------------
                msg.eval = function (expr) {
                    try {
                        return eval(expr)
                    }
                    catch (expt) {
                        throw `Coulnd't evaluate expression [${expr}] ${expt}`
                    }
                }
            }

            
            
            
            msg.state = {
                ...msg.state,
                execId: msg.state?.execId ?? crypto.randomUUID(),
                srcFunctionNodeId: node.id,
                isCustomBookmarkNode: true,
                env: {
                    ...msg.state?.env
                }
            }

            var enrichedState = msg.gotcha('enrichStateWithContextMetadataAsync', msg.state);

            if (enrichedState?.newEnv) {
                for (const varName in enrichedState.newEnv) {
                    const expr = env.get(varName);
                    if (!expr) continue;

                    const value = eval(expr);
                    enrichedState.env[varName] = value;
                }
            }
            msg.state = {
                ...msg.state,
                ...enrichedState
            }
            msg.gotcha('hitBookmark', msg.state);
//-----------------------------------------

            send(msg);
            done();
        });
    }
    RED.nodes.registerType("Trace", Trace);
};