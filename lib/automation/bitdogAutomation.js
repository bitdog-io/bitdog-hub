var EventProcessor = require('../eventProcessor.js').EventProcessor;
var Scheduler = require('./scheduler.js');
var EventCapturer = require('./eventCapturer.js');
var util = require('util');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');


function BitdogAutomation() {
    var _bitdogZWave = null;
    var _automationConfiguration = [];
    var _isRunning = false;
    var _timer = setInterval(function () { this.tock() }.bind(this), 30000); // 30 second tick-tock
    var _scheduler = null;
    var _eventCapturer = null;

    // Pass in the external zwave controller instance so that automation can send its own commands
    this.__defineGetter__('bitdogZWave', function () { return _bitdogZWave; });
    this.__defineSetter__('bitdogZWave', function (value) { _bitdogZWave = value; });

    this.__defineGetter__('automationConfiguration', function () { return _automationConfiguration; });
    this.__defineSetter__('automationConfiguration', function (value) { _automationConfiguration = value; });

    this.__defineGetter__('isRunning', function () { return _isRunning; });
    this.__defineSetter__('isRunning', function (value) { _isRunning = value; });

    this.__defineGetter__('scheduler', function () { return _scheduler; });
    this.__defineSetter__('scheduler', function (value) { _scheduler = value; });

    this.__defineGetter__('eventCapturer', function () { return _eventCapturer; });
    this.__defineSetter__('eventCapturer', function (value) { _eventCapturer = value; });

}

util.inherits(BitdogAutomation, EventProcessor);

BitdogAutomation.prototype.tock = function () {
    if (this.isRunning === true && typeof this.scheduler !== typeof undefined && this.scheduler !== null ) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Tock');
        try {
            this.scheduler.tock();
        } catch (error) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Exception', error);
        }
    }
}

BitdogAutomation.prototype.onProcessMessage = function (message) {
    if (this.isRunning === true && typeof this.eventCapturer !== typeof undefined && this.eventCapturer !== null) {
        try {
            this.eventCapturer.onProcessMessage(message);
        } catch (error) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Exception', error);
        }
    }
}

BitdogAutomation.prototype.stop = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Stopping....');
    this.isRunning = false;

}

BitdogAutomation.prototype.start = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Starting....');
    this.automationConfiguration = bitdogClient.configuration.get(constants.AUTOMATIONS_CONFIG);
    this.createSchedule();
    this.createEventCapturer();
    this.isRunning = true;

}

BitdogAutomation.prototype.restart = function () {
    this.isRunning = false;

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Restarting....');
    this.automationConfiguration = bitdogClient.configuration.get(constants.AUTOMATIONS_CONFIG);
    this.createScheduler();
    this.createEventCapturer();
    this.isRunning = true;


}

BitdogAutomation.prototype.createScheduler = function () {
    this.scheduler = new Scheduler(this.automationConfiguration);

}

BitdogAutomation.prototype.createEventCapturer = function () {
    this.eventCapturer = new EventCapturer(this.automationConfiguration);

}

module.exports = new BitdogAutomation();