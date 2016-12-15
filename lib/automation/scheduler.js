var SunCalc = require('suncalc');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');


function Scheduler(automationConfiguration) {

    for (var index = 0; index < automationConfiguration; index++) {
        var automation = automationConfiguration[index];
        var definition = automation.Definition;
        var specificTimes = SunCalc.getTimes(new Date(), definition.latitude, definition.longitude);
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Calculated astronomical times', specificTimes);

    }

}

module.exports = Scheduler;