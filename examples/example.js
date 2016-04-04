var bitdogSA = require('../lib/bitdogSA.js');
var bitdogClient = require('bitdog-client');

bitdogSA.start();

bitdogClient.addCommand('Turn local LED on/off', bitdogClient.commonMessageSchemas.onOffMessageSchema, function (message, configuration, logger) {
    
    // Every time this command is received, we will simply log the fact
    logger.log('User', 'Turn local LED on/off' + message.value);

});

process.on('SIGINT', function () {
    bitdogClient.logger.logProcessEvent('Example Security and Automation', 'SIGINT, stopping.');
    bitdogSA.stop();
    process.exit();
});