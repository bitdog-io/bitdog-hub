var rpio = require('rpio');

function Extension(bitdogHub) {

    var onOffmessageSchema = bitdogHub.createMessageSchema('OnOff')
        .addStringProperty('value', 'off', { values: ['on', 'off'] });

    var positionMessageSchema = bitdogHub.createMessageSchema('Position')
        .addNumberProperty('latitude', 42.9069)
        .addNumberProperty('longitude', -78.9055923);


    bitdogHub.addCommand('Turn local LED on/off', onOffmessageSchema, function (message, configuration, logger) {

        // Every time this command is received, we will simply log the fact
        logger.log('User', 'Turn local LED on/off - ' + message.value);

    });

    bitdogHub.addDataCollector('Position', positionMessageSchema , 60000, function (message, configuration, logger) {

        // Instead of collecting real data, we are just sending random data
        // for this test
        message.latitude = Math.floor((Math.random() * 100) + 1);
        message.longitude = Math.floor((Math.random() * 100) + 1);

    });

    bitdogHub.start();

}

module.exports = Extension;



