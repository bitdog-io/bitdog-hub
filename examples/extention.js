var rpio = require('rpio');

function Extension(bitdogHub) {

    bitdogHub.bitdogClient.addCommand('Turn local LED on/off', bitdogHub.bitdogClient.commonMessageSchemas.onOffMessageSchema, function (message, configuration, logger) {

        // Every time this command is received, we will simply log the fact
        logger.log('User', 'Turn local LED on/off - ' + message.value);

    });

    bitdogHub.bitdogClient.addDataCollector('Position', bitdogHub.bitdogClient.commonMessageSchemas.mapPositionMessageSchema , 60000, function (message, configuration, logger) {

        // Instead of collecting real data, we are just sending random data
        // for this test
        message.latitude = Math.floor((Math.random() * 100) + 1);
        message.longitude = Math.floor((Math.random() * 100) + 1);

    });

    bitdogHub.start();

}

module.exports = Extension;



