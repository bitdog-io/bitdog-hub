var ExtensionBase = require('../lib/extensionBase.js');
var util = require('util');

var rpio = require('rpio');


function Extension() {

}

util.inherits(Extension, ExtensionBase);


Extension.prototype.onMessage = function (message, configuration, logger) {

    // Messages will go through here, check them and do something.
    logger.log('User', 'Got message and handling', message);

};

Extension.prototype.onInitialize = function (configuration, logger) {
    var onOffMessageSchema = this.createMessageSchema('OnOff')
        .addStringProperty('value', 'off', { values: ['on', 'off'] });

    var state = 'off';

    rpio.open(12, rpio.OUTPUT, rpio.LOW);
    rpio.open(15, rpio.INPUT, rpio.PULL_DOWN);

    function pollcb(pin) {

        state = rpio.read(pin) ? 'on' : 'off';
    }

    rpio.poll(15, pollcb);


    this.addCommand('Turn LED on/off', onOffMessageSchema, function (message, configuration, logger) {

        if (message.value === 'off') {
            rpio.write(12, rpio.HIGH);
        } else {
            rpio.write(12, rpio.LOW);
        }
        
    });

    this.addDataCollector('Switch Status', onOffMessageSchema, 60000, function (message, configuration, logger) {
        message.value = state;
    });
};

module.exports = Extension;



