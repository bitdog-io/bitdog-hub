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
'use strict';
let SunCalc = require('suncalc');
let bitdogClient = require('bitdog-client');
let constants = require('../constants.js');
let coreMessageSchemas = require('../coreMessageSchemas.js');
let moment = require('moment');
let weatherManager = require('./weatherManager.js');

function Scheduler(automationConfiguration) {

    let _schedules = {};
    let _weatherForecast = null;
    let _automationConfiguration = automationConfiguration;

    this.__defineGetter__('automationConfiguration', function () { return _automationConfiguration; });

    this.__defineGetter__('schedules', function () { return _schedules; });
    this.__defineSetter__('schedules', function (value) { _schedules = value; });

    this.__defineGetter__('weatherForecast', function () { return _weatherForecast; });
    this.__defineSetter__('weatherForecast', function (value) { _weatherForecast = value; });

}

Scheduler.prototype.createTodaysSchedule = function () {
    let now = new Date();
    this.schedules = {};
    this.schedules.dayOfWeek = this.getDayOfWeek();

    let automation = null;
    let name = null;
    let automationId = null;
    let definition = null;
    let trigger = null;
    let targetTime = null;
    let index = null;
    let hour = null;
    let minute = null;
    let location = null;
    let astronomicalTimes = null;

    try {

        for (index = 0; index < this.automationConfiguration.length; index++) {
            automation = this.automationConfiguration[index];
            name = automation.Name;
            automationId = automation.AutomationId;
            definition = automation.Definition;
            trigger = definition.trigger;
            targetTime = null;

            switch (trigger.triggerId) {
                case 'recurringTime':

                    switch (trigger.dateTimeId) {
                        case 'weekdays':
                            if (trigger.weekdays[this.schedules.dayOfWeek] !== true)
                                break;

                        case 'everyDay':

                            if (trigger.timeTypeId === 'specific') {
                                hour = parseInt(trigger.hour);
                                minute = parseInt(trigger.minute);

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
                                location = bitdogClient.configuration.get(constants.AUTOMATIONS_LOCATION);

                                if (typeof location !== typeof undefined && location !== null) {
                                    astronomicalTimes = this.getAstronomicalTimes(location.latitude, location.longitude);
                                    targetTime = moment(astronomicalTimes[trigger.timeTypeId]);

                                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Target time ' + trigger.timeTypeId + ' for automation \'' + name + '\': ' + targetTime.format());

                                    if (typeof trigger.offsetTypeId !== typeof undefined && typeof trigger.offsetMinutes !== typeof undefined) {
                                        switch (trigger.offsetTypeId) {
                                            case 'before':
                                                targetTime.subtract(trigger.offsetMinutes, 'minutes');
                                                break;
                                            case 'after':
                                                targetTime.add(trigger.offsetMinutes, 'minutes');
                                                break;
                                        }

                                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Target has offset for ' + trigger.offsetMinutes + ' minutes ' + trigger.offsetTypeId + ' ' + trigger.timeTypeId + ', new target time for automation \'' + name + '\': ' + targetTime.format());

                                    }

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

        bitdogClient.sendData('bd-automationScheduled', coreMessageSchemas.automationScheduledMessageSchema, function (message) {
            let items = [];
            let time = null;
            let index = 0;
            let item = null;

            for (time in this.schedules) {
                for (index = 0; index < this.schedules[time].length; index++) {
                    item = this.schedules[time][index];
                    items.push({
                        automationId: item.AutomationId, executionTime: item.scheduledExecutionDateTime
                    });
                }
            }

            message.schedule = items;
        }.bind(this));
    }
    catch (e) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Could not calculate schedule', e);

    }
}

Scheduler.prototype.addAutomationToSchedule = function (momentValue, automation) {
    let timeValue = momentValue.unix().toString();
    automation.scheduledExecutionDateTime = momentValue.utc().format();

    if (typeof this.schedules[timeValue] === typeof undefined)
        this.schedules[timeValue] = [];

    this.schedules[timeValue].push(automation);
}

Scheduler.prototype.tock = function () {

    if (this.schedules.dayOfWeek !== this.getDayOfWeek()) {
        this.createTodaysSchedule();
    }
    else {
        let now = moment();
        let fiveMinutesAgo = moment(); fiveMinutesAgo.subtract(5, 'minutes');
        let schedules = [];
        let automation = null;
        let definition = null;
        let name = null;
        let executedTimes = [];
        let timeValue = null;
        let messageResult = null;
        let automationIndex = 0;
        let commandIndex = 0;

        for (timeValue in this.schedules) {

            if (timeValue === 'dayOfWeek') // ignore variable property on schedules
                continue;

            let time = moment.unix(parseInt(timeValue));
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Comparing times', { time: time.format() });

            // Between now and five minutes ago
            if (time.isSameOrAfter(fiveMinutesAgo) && time.isSameOrBefore(now)) {
                schedules = this.schedules[timeValue];
                executedTimes.push(timeValue);


                for (automationIndex = 0; automationIndex < schedules.length; automationIndex++) {
                    automation = schedules[automationIndex];
                    definition = automation.Definition;
                    name = automation.Name;

                    bitdogClient.sendData('bd-automationExecuted', coreMessageSchemas.automationExecutedMessageSchema, function (message) {
                        message.automationId = automation.AutomationId;
                    });

                    for (commandIndex = 0; commandIndex < definition.commands.length; commandIndex++) {
                        messageResult = bitdogClient.sendMessage(definition.commands[commandIndex].message);
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Executed automation: \'' + name + '\' command: \'' + definition.commands[commandIndex].name + '\'', messageResult);
                    }
                }

            }


        }

        for (let timesIndex = 0; timesIndex < executedTimes.length; timesIndex++) {
            timeValue = executedTimes[timesIndex];
            delete this.schedules[timeValue];
        }


    }
};

Scheduler.prototype.weatherTock = function () {
    let location = bitdogClient.configuration.get(constants.AUTOMATIONS_LOCATION);
    let self = this;

    if (typeof location !== typeof undefined && location !== null) {
        bitdogClient.sendCommand(constants.BITDOG_CLOUD_NODE, 'bd-getWeatherCurrent', coreMessageSchemas.weatherRequestMessageSchema, function (message) {
            message.lat = location.latitude;
            message.long = location.longitude;
        }).then(function (commandResult) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Retrieved weather forecast');
            self.weatherForecast = commandResult.result.value;
            weatherManager.processWeatherForecast(self.weatherForecast);
        }, function (error) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Could not retrieve weather forecast', error);
        });
    }
};

Scheduler.prototype.getDayOfWeek = function () {
    return moment().format('dddd').toLowerCase();
};

Scheduler.prototype.getAstronomicalTimes = function (latitude, longitude) {
    let todayAtNoon = new Date();
    todayAtNoon.setHours(12);

    // Using noon to avoid the wrong day being picked when too close to midnight
    return SunCalc.getTimes(todayAtNoon, latitude, longitude);
}

module.exports = Scheduler;