//-----------------------------------------------------------------------------
//
//	eventCapturer.js
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


function EventCapturer(automationConfiguration) {
    var _automationConfiguration = automationConfiguration;
    var _captureList = {};


    this.__defineGetter__('automationConfiguration', function () { return _automationConfiguration; });
    this.__defineGetter__('captureList', function () { return _captureList; });


    this.createEventCaptureList();

}

EventCapturer.prototype.createEventCaptureList = function () {
    for (var index = 0; index < this.automationConfiguration.length; index++) {
        var automation = this.automationConfiguration[index];
        var name = automation.Name;
        var automationId = automation.AutomationId;
        var definition = automation.Definition;
        var trigger = definition.trigger;

        switch (trigger.triggerId) {
            case 'recurringTime':
                break;
            case 'deviceValueChanges':
                this.addAutomationToEventCapturer(trigger.reference.id, automation);
                break;
            case 'valueChangesAnyDevice':
                this.addAutomationToEventCapturer(trigger.classId + '/' + trigger.propertyId, automation);
                break;
            case 'sceneEvent':
                this.addAutomationToEventCapturer(trigger.reference.id + '/' + trigger.value, automation);
                break;

        }
    }

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Created event capture list', this.captureList);

};

EventCapturer.prototype.addAutomationToEventCapturer = function (eventId, automation) {
    if (typeof this.captureList[eventId] === typeof undefined)
        this.captureList[eventId] = [];

    this.captureList[eventId].push(automation);
};

EventCapturer.prototype.onProcessMessage = function (message) {
    var id = this.calculateId(message);
    var definition = null;
    var name = null;
    var logic = null;
    var trigger = null;
    var propertyName = null;
    var automations = [];
    var specific = this.captureList[id.specific];
    var generic = this.captureList[id.generic];

    if (typeof specific !== typeof undefined && specific != null) {
        automations = automations.concat(specific);
    }

    if (typeof generic !== typeof undefined && generic != null) {
        automations = automations.concat(generic);
    }

    for (var automationIndex = 0; automationIndex < automations.length; automationIndex++) {
        automation = automations[automationIndex];
        definition = automation.Definition;
        trigger = definition.trigger;
        name = automation.Name;

        if (this.compare(message, trigger) === true) {

            if (this.shouldIgnore(definition) === false) { // This step potentially requires heavier computation, so its checked second
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Trigger matched message for automation: \'' + name + '\'', message);

                bitdogClient.sendData('bd-automationExecuted', coreMessageSchemas.automationExecutedMessageSchema, function (message) {
                    message.automationId = automation.AutomationId;
                });

                for (var commandIndex = 0; commandIndex < definition.commands.length; commandIndex++) {
                    messageResult = bitdogClient.sendMessage(definition.commands[commandIndex].message);
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Executed automation: \'' + name + '\' command: \'' + definition.commands[commandIndex].name + '\'', messageResult);
                }
            }
            else {

                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Trigger matched message for automation, but it has been filtered: \'' + name + '\'', message);

            }
        }
    }



};

EventCapturer.prototype.shouldIgnore = function (definition) {
    var triggerFilter = definition.triggerFilter;
    var now = new Date();
    var result = true;


    if (triggerFilter.filterTypeId === 'always') {
        result = false;
    } else  if (triggerFilter.filterTypeId === 'betweenTimes') {
        var startTime = this.getTargetTime(triggerFilter.start, definition.latitude, definition.longitude);
        var endTime = this.getTargetTime(triggerFilter.end, definition.latitude, definition.longitude);

        if (startTime.isSame(endTime)) { // invalid value, ignore
            result = true;
        } else if (endTime.isBefore(startTime)) { // schedule crosses days

            if (endTime.isAfter(now)) { // start was yesterday and we haven't ended yet
                result = false; // don't ignore
            }
            else if (startTime.isSameOrBefore(now)) { // we started and the end is tomorrow
                result = false; // don't ignore
            } else {
                result = true; // ignore
            }

        } else if (startTime.isSameOrBefore(now) && endTime.isAfter(now)) { // now is between start and end, don't ignore
            result = false;
        }
    }

    return result;

}

EventCapturer.prototype.getTargetTime = function (timeDefintion, latitude, longitude) {

    var targetTime = null;
    var now = new Date();


    if (timeDefintion.timeTypeId === 'specific') {
        var hour = parseInt(timeDefintion.hour);
        var minute = parseInt(timeDefintion.minute);

        if (timeDefintion.amPm.toLowerCase() === 'pm')
            hour += 12;

        targetTime = moment();
        targetTime.hour(hour);
        targetTime.minute(minute);
        targetTime.second(0);

    }
    else {

        var astronomicalTimes = this.getAstronomicalTimes(latitude, longitude);
        targetTime = moment(astronomicalTimes[timeDefintion.timeTypeId]);
    }

    return targetTime;

}

// This is used to determine the unique id of what is changing
EventCapturer.prototype.calculateId = function (message) {
    var id = { specific: null , generic: null };


    switch (message.h.n) {
        case 'bd-zValueChanged':
            id.specific = message.c.n + '/' + message.d.homeId + '/' + message.d.nodeId + '/' + message.d.classId + '/' + message.d.instanceId + '/' + message.d.indexId;
            id.generic = message.d.classId + '/' + message.d.indexId
            break;

        case 'bd-zSceneEvent':
            id.specific = message.c.n + '/' + message.d.homeId + '/' + message.d.nodeId + '/' + message.d.value;
            break;

        default:
            id.specific = message.c.n + '/' + message.h.n;
            // the following is not supported yet
            id.generic = message.h.n;
            break;
    }

    return id;

}

EventCapturer.prototype.getAstronomicalTimes = function (latitude, longitude) {
    var todayAtNoon = new Date();
    todayAtNoon.setHours(12);

    // Using noon to avoid the wrong day being picked when too close to midnight
    return SunCalc.getTimes(todayAtNoon, latitude, longitude);
}

EventCapturer.prototype.compare = function (message, trigger) {
    var results = true;
    var logic = trigger.logic;
    for (var property in logic) {
        switch (logic[property]) {
            case 'ignore':
                break;
            case '=':
                results = results && ( message.d[property] == trigger.value ); 
                break;
            case '!=':
                results = results && (message.d[property] != trigger.value); 
                break;
            case '>':
                results = results && (message.d[property] > trigger.value); 
                break;
            case '>=':
                results = results && (message.d[property] >= trigger.value); 
                break;
            case '<':
                results = results && (message.d[property] < trigger.value); 
                break;
            case '<=':
                results = results && (message.d[property] <= trigger.value); 
                break;
            case 'between':
                break;
            case 'starts with':
                break;
            case 'ends with':
                break;
            case 'contains':
                break;
            case "equals":
                break;

        }
    }

    return results;
}

module.exports = EventCapturer;