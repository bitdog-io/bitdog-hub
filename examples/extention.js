var rpio = require('rpio');

function Extension(bitdogHub) {

    var onOffMessageSchema = bitdogHub.createMessageSchema('OnOff')
        .addStringProperty('value', 'off', { values: ['on', 'off'] });

    var positionMessageSchema = bitdogHub.createMessageSchema('Position')
        .addNumberProperty('latitude', 42.9069)
        .addNumberProperty('longitude', -78.9055923);


    bitdogHub.addCommand('Turn LED on-off', onOffMessageSchema, function (message, configuration, logger) {

        // Every time this command is received, we will simply log the fact
        logger.log('User', 'Turn LED  ' + message.value);

    });

    bitdogHub.addDataCollector('Position', positionMessageSchema , 60000, function (message, configuration, logger) {

        // Instead of collecting real data, we are just sending random data
        // for this test
        message.latitude = Math.floor((Math.random() * 100) + 1);
        message.longitude = Math.floor((Math.random() * 100) + 1);

    });

    bitdogHub.on('message', function (message, configuration, logger) {
        // Messages will go through here, check them and do something.
        logger.log('User', 'Got message and handling', message);

    });

    bitdogHub.start();

}

module.exports = Extension;



