//-----------------------------------------------------------------------------
//
//	scheduler.js
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


var SunCalc = require('suncalc');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');
var moment = require('moment');

function Scheduler(automationConfiguration) {
    var _schedules = {};

    var _automationConfiguration = automationConfiguration;

    this.__defineGetter__('automationConfiguration', function () { return _automationConfiguration; });
    this.__defineGetter__('schedules', function () { return _schedules; });
    this.__defineSetter__('schedules', function (value) { _schedules = value; });

}

Scheduler.prototype.createTodaysSchedule = function () {
    var now = new Date();
    this.schedules = {};
    this.schedules.dayOfWeek = this.getDayOfWeek();

  for (var index = 0; index < this.automationConfiguration.length; index++) {
        var automation = this.automationConfiguration[index];
        var name = automation.Name;
        var automationId = automation.AutomationId;
        var definition = automation.Definition;
        var trigger = definition.trigger;
        var targetTime = null; 

        switch (trigger.triggerId) {
            case 'recurringTime':

                switch (trigger.dateTimeId) {
                    case 'weekdays':
                        if (trigger.weekdays[this.schedules.dayOfWeek] !== true)
                            break;

                    case 'everyDay':

                        if (trigger.timeTypeId === 'specific'  ) {
                            var hour = parseInt(trigger.hour);
                            var minute = parseInt(trigger.minute);

                            if (trigger.amPm.toLowerCase() === 'pm')
                                hour += 12;

                            targetTime = moment();
                            targetTime.hour(hour);
                            targetTime.minute(minute);
                            targetTime.second(0);
                        
                            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Target time ' + trigger.timeTypeId + ' for automation \'' + name + '\': ' + targetTime.format());

                            if (targetTime.isSameOrAfter(now)) {
                                this.addAutomationToSchedule(targetTime, automation);
                            }
                        }
                        else {
                            var location = bitdogClient.configuration.get(constants.AUTOMATIONS_LOCATION);

                            if (typeof location !== typeof undefined && location !== null) {
                                var astronomicalTimes = this.getAstronomicalTimes(location.latitude, location.longitude);
                                targetTime = moment(astronomicalTimes[trigger.timeTypeId]);

                                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Target time ' + trigger.timeTypeId + ' for automation \'' + name + '\': ' + targetTime.format());

                                if (targetTime.isSameOrAfter(now)) {
                                    this.addAutomationToSchedule(targetTime, automation);
                                }
                            } else {
                                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Location not set and cannot calculate ' + trigger.timeTypeId + ' for automation \'' + name + '\': ' + targetTime.format());

                            }
                        }
                        break;
                    case 'everyHour':
                        break;
  
                }

                break;
            case 'deviceValueChanges':
                break;
            case 'valueChangesAnyDevice':
                break;

        }

    }

  bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Calculated todays schedule', this.schedules);

}

Scheduler.prototype.addAutomationToSchedule = function (moment, automation) {
    var timeValue = moment.unix().toString();
    if (typeof this.schedules[timeValue] !== typeof Array)
        this.schedules[timeValue] = [];

    this.schedules[timeValue].push(automation);
}

Scheduler.prototype.tock = function () {

    if (this.schedules.dayOfWeek !== this.getDayOfWeek()) {
        this.createTodaysSchedule();
    }
    else {
        var now = moment();
        var fiveMinutesAgo = moment(); fiveMinutesAgo.subtract(5, 'minutes');
        var schedules = [];
        var automation = null;
        var definition = null;
        var name = null;
        var executedTimes = [];
        var timeValue = null;
        var messageResult = null;

        for (timeValue in this.schedules) {

            if (timeValue === 'dayOfWeek') // ignore variable property on schedules
                continue;

            var time = moment.unix(parseInt(timeValue));
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Comparing times', { time: time.format() });

            if (time.isSameOrAfter(fiveMinutesAgo) && time.isSameOrBefore(now)) {
                var schedules = this.schedules[timeValue];
                executedTimes.push(timeValue);
                

                for (var automationIndex = 0; automationIndex < schedules.length; automationIndex++) {
                    automation = schedules[automationIndex];
                    definition = automation.Definition;
                    name = automation.Name;

                    bitdogClient.sendData('bd-automationExecuted', coreMessageSchemas.automationExecutedMessageSchema, function (message) {
                        message.automationId = automation.AutomationId;
                    });

                    for (var commandIndex = 0; commandIndex < definition.commands.length; commandIndex++) {
                        messageResult = bitdogClient.sendMessage(definition.commands[commandIndex].message);
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Executed automation: \'' + name + '\' command: \'' + definition.commands[commandIndex].name + '\'', messageResult);
                    }
                }

            }
                

        }

        for (var timesIndex = 0; timesIndex < executedTimes.length; timesIndex++) {
            timeValue = executedTimes[timesIndex];
            delete this.schedules[timeValue];
        }

        
    }
};

Scheduler.prototype.weatherTock = function () {
    var location = bitdogClient.configuration.get(constants.AUTOMATIONS_LOCATION);

    if (typeof location !== typeof undefined && location !== null) {
        bitdogClient.sendCommand(constants.BITDOG_CLOUD_NODE, 'bd-getWeatherCurrent', coreMessageSchemas.weatherRequestMessageSchema, function (message) {
            message.lat = location.latitude;
            message.long = location.longitude;
        }).then(function(result) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Retrieved weather forecast', result);
        });
    }
};

Scheduler.prototype.getDayOfWeek = function () {
    return moment().format('dddd').toLowerCase();
};

Scheduler.prototype.getAstronomicalTimes = function (latitude, longitude) {
    var todayAtNoon = new Date();
    todayAtNoon.setHours(12);

    // Using noon to avoid the wrong day being picked when too close to midnight
    return SunCalc.getTimes(todayAtNoon, latitude, longitude);
}

module.exports = Scheduler;