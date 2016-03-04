var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');

function BitdogAutomation() {

}

util.inherits(BitdogAutomation, EventProcessor);


BitdogAutomation.prototype.onProcessMessage = function (message) {
    console.log('automation', message);
}

module.exports = new BitdogAutomation();