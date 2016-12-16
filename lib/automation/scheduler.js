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

    this.createTodaysSchedule();



}

Scheduler.prototype.createTodaysSchedule = function () {
    var now = new Date();

  for (var index = 0; index < this.automationConfiguration.length; index++) {
        var automation = this.automationConfiguration[index];
        var name = automation.Name;
        var automationId = automation.AutomationId;
        var definition = automation.Definition;

        var trigger = definition.trigger;

        switch (trigger.triggerId) {
            case 'recurringTime':

                switch (trigger.dateTimeId) {
                    case 'weekdays':
                        var dayOfWeek = moment(now).format('dddd').toLowerCase();
                    case 'everyDay':

                        if (trigger.timeTypeId === 'specific') {

                        }
                        else {
                            var astronomicalTimes = SunCalc.getTimes(now, definition.latitude, definition.longitude);
                            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Calculated astronomical times for automation \'' + name + '\'', astronomicalTimes);
                            var targetTime = moment(astronomicalTimes[trigger.timeTypeId]);
                            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Target time for automation \'' + name + '\': ' + targetTime.format());

                            if (targetTime.isSameOrAfter(now)) {
                                this.schedules[targetTime.unix()] = automation; 
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

        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Calculated todays schedule', this.schedules);


    }
}

Scheduler.prototype.tock = function () {
};

module.exports = Scheduler;