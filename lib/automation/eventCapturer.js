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

Scheduler.prototype.createEventCaptureList = function () {
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
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Processing event', message);

};

module.exports = EventCapturer;