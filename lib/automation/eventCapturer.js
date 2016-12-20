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
            automation = schedules[automationIndex];
            definition = automation.Definition;
            trigger = defintion.trigger;
            name = defintion.Name;

            if (this.compare(message, trigger) === true) {
                for (var commandIndex = 0; commandIndex < definition.commands.length; commandIndex++) {
                    messageResult = bitdogClient.sendMessage(definition.commands[commandIndex].message);
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Executed automation: \'' + name + '\' command: \'' + definition.commands[commandIndex].name + '\'', messageResult);
                }
            }
        }

    }

};

EventCapturer.prototype.calculateId = function (message) {
    switch (message.h.n) {
        case 'bd-zValueChanged':
            return message.c.n + '/' + message.d.homeId + '/' + message.d.classId + '/' + message.d.instanceId + '/' + message.d.indexId;
        default:
            return message.c.n + '/' + message.h.n;
    }

}

EventCapturer.prototype.compare = function (message, trigger) {
    var results = true;
    var logic = trigger.logic;
    for (var property in logic) {
        switch () {
            case 'ignore':
                break;
            case '=':
                break;
            case '!=':
                break;
            case '>':
                break;
            case '>=':
                break;
            case '<':
                break;
            case '<=':
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