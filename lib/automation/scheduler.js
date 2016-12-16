var SunCalc = require('suncalc');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');
var moment = require('moment');



function Scheduler(automationConfiguration) {
    var _schedules = [];

    for (var index = 0; index < automationConfiguration.length; index++) {
        var automation = automationConfiguration[index];
        var name = automation.Name;
        var automationId = automation.AutomationId;
        var definition = automation.Definition;

        var trigger = definition.trigger;

        switch (trigger.triggerId) {
            case 'recurringTime':

                switch (trigger.dateTimeId) {
                    case 'weekdays':
                    case 'everyDay':

                        if (trigger.timeTypeId === 'specific') {

                        }
                        else {
                            var astronomicalTimes = SunCalc.getTimes(new Date(), definition.latitude, definition.longitude);
                            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Calculated astronomical times for automation \'' + name + '\'', astronomicalTimes);
                            var targetTime = moment(astronomicalTimes[trigger.timeTypeId]);
                            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Target time for automation \'' + name + '\': ' + targetTime.format());

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

}

Scheduler.prototype.tock = function () {
};

module.exports = Scheduler;