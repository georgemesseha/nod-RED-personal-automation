module.exports = {
    test: function(env, envVarName, ) {
        const value = eval(env.get(envVarName));
        node.warn('++++++++++++++++ This is a warning message from myUtils.js');

    },

    sayHelloTo: function(name)
    {
        console.log(`Hello, ${name}!`);
    }
};