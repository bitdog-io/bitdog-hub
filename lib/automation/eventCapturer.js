var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');

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

        }
    }

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Created event capture list', this.captureList);

};

EventCapturer.prototype.addAutomationToEventCapturer = function (eventId, automation) {
    if (typeof this.captureList[eventId] !== typeof Array)
        this.captureList[eventId] = [];

    this.captureList[eventId].push(automation);
};

EventCapturer.prototype.onProcessMessage = function (message) {
    var id = this.calculateId(message);
    var automations = this.captureList[id];
    var definition = null;
    var name = null;
    var logic = null;
    var trigger = null;
    var propertyName = null;

    if (typeof automations !== typeof undefined && automations != null) {
        for (var automationIndex = 0; automationIndex < automations.length; automationIndex++) {
            automation = automations[automationIndex];
            definition = automation.Definition;
            trigger = definition.trigger;
            name = definition.Name;

            if (this.compare(message, trigger) === true) {
                if (this.shouldIgnore(definition) === false) { // This step potentially requires heavy computation, so its checked second
                    for (var commandIndex = 0; commandIndex < definition.commands.length; commandIndex++) {
                        messageResult = bitdogClient.sendMessage(definition.commands[commandIndex].message);
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Executed automation: \'' + name + '\' command: \'' + definition.commands[commandIndex].name + '\'', messageResult);
                    }
                }
            }
        }

    }

};

EventCapture.property.shouldIgnore = function (definition) {
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

            if (endTime.after(now)) { // start was yesterday and we haven't ended yet
                result = false; // don't ignore
            }
            else if (startTime.isSameOrBefore(now)) { // we started and the end is tomorrow
                result = false; // don't ignore
            } else {
                result = true; // ignore
            }

        } else if (startTime.isSameOrBefore(now) && endTime.after(now)) { // now is between start and end, don't ignore
            result = false;
        }
    }

    return result;

}

EventCapture.property.getTargetTime = function (timeDefintion, latitude, longitude) {

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

        var astronomicalTimes = SunCalc.getTimes(now, definition.latitude, definition.longitude);
        targetTime = moment(astronomicalTimes[timeDefintion.timeTypeId]);
    }

    return targetTime;

}

EventCapturer.prototype.calculateId = function (message) {
    switch (message.h.n) {
        case 'bd-zValueChanged':
            return message.c.n + '/' + message.d.homeId + '/' + message.d.nodeId + '/' + message.d.classId + '/' + message.d.instanceId + '/' + message.d.indexId;
        default:
            return message.c.n + '/' + message.h.n;
    }

}

EventCapturer.prototype.compare = function (message, trigger) {
    var results = true;
    var logic = trigger.logic;
    for (var property in logic) {
        switch (logic[property]) {
            case 'ignore':
                break;
            case '=':
                results = results && ( message.d.value == trigger.value ); 
                break;
            case '!=':
                results = results && (message.d.value != trigger.value); 
                break;
            case '>':
                results = results && (message.d.value > trigger.value); 
                break;
            case '>=':
                results = results && (message.d.value >= trigger.value); 
                break;
            case '<':
                results = results && (message.d.value < trigger.value); 
                break;
            case '<=':
                results = results && (message.d.value <= trigger.value); 
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