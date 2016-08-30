var rpio = require('rpio');

function Extension() {

    this.onInitialize = function (configuration, logger) {
        var onOffMessageSchema = this.createMessageSchema('OnOff')
            .addStringProperty('value', 'off', { values: ['on', 'off'] });

        var positionMessageSchema = this.createMessageSchema('Position')
            .addNumberProperty('latitude', 42.9069)
            .addNumberProperty('longitude', -78.9055923);


        this.addCommand('Turn LED on-off', onOffMessageSchema, function (message, configuration, logger) {

            // Every time this command is received, we will simply log the fact
            logger.log('User', 'Turn LED  ' + message.value);

        });

        this.addDataCollector('Position', positionMessageSchema, 60000, function (message, configuration, logger) {

            // Instead of collecting real data, we are just sending random data
            // for this test
            message.latitude = Math.floor((Math.random() * 100) + 1);
            message.longitude = Math.floor((Math.random() * 100) + 1);

        });
    };


    this.onMessage = function(message, configuration, logger) {
        // Messages will go through here, check them and do something.
        logger.log('User', 'Got message and handling', message);

    };

}

module.exports = Extension;



