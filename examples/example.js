var bitdogHub = require('../lib/bitdogHub.js');
var bitdogClient = require('bitdog-client');

bitdogHub.start();

bitdogClient.addCommand('Turn local LED on/off', bitdogClient.commonMessageSchemas.onOffMessageSchema, function (message, configuration, logger) {
    
    // Every time this command is received, we will simply log the fact
    logger.log('User', 'Turn local LED on/off - ' + message.value);

});

process.on('SIGINT', function () {
    bitdogClient.logger.logProcessEvent('Example Bitdog Hub', 'SIGINT, stopping.');
    bitdogHub.stop();
    process.exit();
});