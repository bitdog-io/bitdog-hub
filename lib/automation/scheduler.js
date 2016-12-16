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

                        if (trigger.timeTypeId === 'specific' ||  ) {
                            var hour = parseInt(trigger.hour);
                            var minute = parseInt(trigger.minute);

                            if (trigger.amPm.toLowerCase() === 'pm')
                                hour += 12;

                            targetTime = moment({ hour: hour, minute: minute }); 

                            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Target time ' + trigger.timeTypeId + ' for automation \'' + name + '\': ' + targetTime.format());

                            if (targetTime.isSameOrAfter(now)) {
                                this.schedules[targetTime.unix()] = automation;
                            }
                        }
                        else {
                            var astronomicalTimes = SunCalc.getTimes(now, definition.latitude, definition.longitude);
                            targetTime = moment(astronomicalTimes[trigger.timeTypeId]);

                            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Target time ' + trigger.timeTypeId + ' for automation \'' + name + '\': ' + targetTime.format());

                            if (targetTime.isSameOrAfter(now)) {
                                if (typeof this.schedules[targetTime.unix()] !== typeof Array)
                                    this.schedules[targetTime.unix()] = [];

                                this.schedules[targetTime.unix()].push(automation); 
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

Scheduler.prototype.tock = function () {

    if (this.schedules.dayOfWeek !== this.getDayOfWeek())
        createTodaysSchedule();
    else {
        var now = moment();
        var fiveMinutesAgo = now.subtract(5, 'minutes');
        var schedules = [];
        var automation = null;
        var definition = null;
        var name = null;
        var executedTimes = [];

        for (var time in this.schedules) {
            if (time === 'dayOfWeek') // ignore variable property on schedules
                continue;

            if (time > fiveMinutesAgo.unix() && time <= now.unix()) {
                var schedules = this.schedules[time];
                executedTimes.push(time);
                

                for (var automationIndex = 0; automationIndex < schedules.length; automationIndex++) {
                    automation = schedules[automationIndex];
                    definition = automation.Definition;
                    name = automation.Name;

                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Executing automation \'' + name + '\'');

                    for (var commandIndex = 0; commandIndex < definition.commands.length; commandIndex++) {
                        bitdogClient.sendMessage(def.commands[commandIndex]);
                    }
                }

            }
                

        }

        for (var timesIndex = 0; timesIndex < executedTimes.length; timesIndex++) {
             delete this.schedules[executedTimes[timesIndex]];
        }




    }
};

Scheduler.prototype.getDayOfWeek = function () {
    return moment(now).format('dddd').toLowerCase();
};


module.exports = Scheduler;