var EventProcessor = require('../eventProcessor.js').EventProcessor;
var util = require('util');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');

function BitdogAutomation() {
    var _bitdogZWave = null;
    var _automationConfiguration = bitdogClient.configuration.get(constants.AUTOMATIONS_CONFIG);
    var _isRunning = false;
    var _timer = setInterval(function () { this.tock() }.bind(this), 10000);

    // Pass in the external zwave controller instance so that automation can send its own commands
    this.__defineGetter__('bitdogZWave', function () { return _bitdogZWave; });
    this.__defineSetter__('bitdogZWave', function (value) { _bitdogZWave = value; });

    this.__defineGetter__('automationConfiguration', function () { return _automationConfiguration; });

    this.__defineGetter__('isRunning', function () { return _isRunning; });
    this.__defineSetter__('isRunning', function (value) { _isRunning = value; });

}

util.inherits(BitdogAutomation, EventProcessor);

BitdogAutomation.prototype.tock = function () {
    if (this.isRunning) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Tock');
    }
}

BitdogAutomation.prototype.onProcessMessage = function (message) {
   
}

BitdogAutomation.prototype.stop = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Stopping....');
    this.isRunning = false;

}

BitdogAutomation.prototype.start = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Starting....');
    this.isRunning = true;

}

BitdogAutomation.prototype.restart = function () {

}

module.exports = new BitdogAutomation();