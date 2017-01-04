//-----------------------------------------------------------------------------
//
//	bitdogAutomation.js
//
//	Copyright (c) 2016 Bitdog LLC.
//
//	SOFTWARE NOTICE AND LICENSE
//
//	This file is part of bitdog-hub.
//
//	bitdog-hub is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published
//	by the Free Software Foundation, either version 3 of the License,
//	or (at your option) any later version.
//
//	bitdog-hub is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with bitdog-hub.  If not, see <http://www.gnu.org/licenses/>.
//
//-----------------------------------------------------------------------------



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

BitdogAutomation.prototype.getConfiguration = function () {
    var configuration = bitdogClient.configuration.get(constants.AUTOMATIONS_CONFIG);

    if (typeof configuration === typeof undefined ||  configuration === null )
        this.automationConfiguration = [];
    else
        this.automationConfiguration = configuration;
}

BitdogAutomation.prototype.start = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Starting....');
    this.getConfiguration();

    this.createScheduler();
    this.createEventCapturer();
    this.isRunning = true;

}

BitdogAutomation.prototype.restart = function () {
    this.isRunning = false;

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Restarting....');
    this.getConfiguration();

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