var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');

function BitdogAutomation() {
    var _bitdogZWave = null;
    var _automationConfiguration = bitdogClient.configuration.get(constants.AUTOMATIONS_CONFIG);

    // Pass in the external zwave controller instance so that automation can send its own commands
    this.__defineGetter__('bitdogZWave', function () { return _bitdogZWave; });
    this.__defineSetter__('bitdogZWave', function (value) { _bitdogZWave = value; });

    this.__defineGetter__('automationConfiguration', function () { return _automationConfiguration; });
}

util.inherits(BitdogAutomation, EventProcessor);


BitdogAutomation.prototype.onProcessMessage = function (message) {
   
}

BitdogAutomation.prototype.stop = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Stopping....');

}

BitdogAutomation.prototype.start = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Starting....');

}

BitdogAutomation.prototype.restart = function () {

}

module.exports = new BitdogAutomation();