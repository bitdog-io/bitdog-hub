//-----------------------------------------------------------------------------
//
//	bitdogAutomation.js
//
//	Copyright (c) 2015-2017 Bitdog LLC.
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
'use strict';

let EventProcessor = require('../eventProcessor.js').EventProcessor;
let Scheduler = require('./scheduler.js');
let EventCapturer = require('./eventCapturer.js');
let util = require('util');
let bitdogClient = require('bitdog-client');
let constants = require('../constants.js');
let coreMessageSchemas = require('../coreMessageSchemas.js');

function BitdogAutomation() {


    let _bitdogZWave = null;
    let _automationConfiguration = [];
    let _isRunning = false;
    let _timer = null;
    let _weatherTimer = null;
    let _scheduler = null;
    let _eventCapturer = null;

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

    this.__defineGetter__('timer', function () { return _timer; });
    this.__defineSetter__('timer', function (value) { _timer = value; });

    this.__defineGetter__('weatherTimer', function () { return _weatherTimer; });
    this.__defineSetter__('weatherTimer', function (value) { _weatherTimer = value; });


}

util.inherits(BitdogAutomation, EventProcessor);

BitdogAutomation.prototype.tock = function () {
    if (this.isRunning === true && typeof this.scheduler !== typeof undefined && this.scheduler !== null) {
        //bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Tock');
        try {
            this.scheduler.tock();
        } catch (error) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Exception', error);
        }
    }
}

BitdogAutomation.prototype.weatherTock = function () {
    if (this.isRunning === true && typeof this.scheduler !== typeof undefined && this.scheduler !== null) {
        //bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Tock');
        try {
            this.scheduler.weatherTock();
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
    clearInterval(this.timer);
    clearInterval(this.weatherTimer);
    this.isRunning = false;

}

BitdogAutomation.prototype.getConfiguration = function () {
    let configuration = bitdogClient.configuration.get(constants.AUTOMATIONS_CONFIG);

    if (typeof configuration === typeof undefined || configuration === null)
        this.automationConfiguration = [];
    else
        this.automationConfiguration = configuration;
}

BitdogAutomation.prototype.start = function () {

    if (this.isRunning === false) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Starting....');
        this.getConfiguration();

        this.createScheduler();
        this.createEventCapturer();
        this.isRunning = true;

        this.timer = setInterval(function () { this.tock(); }.bind(this), 30000); // 30 second tick-tock
        this.weatherTimer = setInterval(function () { this.weatherTock(); }.bind(this), 1000 * 60 * 60); // Get weather update one hour tick-tock

        setTimeout(function () { this.weatherTock(); }.bind(this), 1000); // Get first weather update now
    }

}

BitdogAutomation.prototype.restart = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Restarting....');

    if (this.isRunning === true) {
        this.stop();
    }

    this.start();
}

BitdogAutomation.prototype.createScheduler = function () {
    this.scheduler = new Scheduler(this.automationConfiguration);

}

BitdogAutomation.prototype.createEventCapturer = function () {
    this.eventCapturer = new EventCapturer(this.automationConfiguration);

}

module.exports = new BitdogAutomation();
