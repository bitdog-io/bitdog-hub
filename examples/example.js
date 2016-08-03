var bitdogHub = require('../lib/bitdogHub.js');
var bitdogClient = require('bitdog-client');


bitdogClient.addCommand('Turn local LED on/off', bitdogClient.commonMessageSchemas.onOffMessageSchema, function (message, configuration, logger) {
    
    // Every time this command is received, we will simply log the fact
    logger.log('User', 'Turn local LED on/off - ' + message.value);

});

//bitdogClient.addDataCollector('Position', bitdogClient.commonMessageSchemas.mapPositionMessageSchema , 60000, function (message, configuration, logger) {
    
//    // Instead of collecting real data, we are just sending random data
//    // for this test
//    message.latitude = Math.floor((Math.random() * 100) + 1);
//    message.longitude = Math.floor((Math.random() * 100) + 1);
   
//});

process.on('SIGINT', function () {
    bitdogClient.logger.logProcessEvent('Example Bitdog Hub', 'SIGINT, stopping.');
    bitdogHub.stop();
    setTimeout(function () { process.exit(0); }, 5000);
});

process.on('uncaughtException', function (ex) {
    bitdogClient.logger.logProcessEvent('Unhandled exception, stopping.', ex);
    setTimeout(function () { process.exit(1); }, 5000);

});



bitdogHub.start();
