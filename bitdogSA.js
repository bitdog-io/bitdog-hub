var bitdogClient = require('bitdog-client');
var constants = require('./lib/constants.js');
var BitdogZWave = require('./lib/bitdogZWave.js');
var bitdogZWave = null;


bitdogClient.on('ready', function () {

    bitdogZWave = new BitdogZWave(bitdogClient);
    bitdogZWave.start();

});

process.on('SIGINT', function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BITDOG_SA, 'SIGINT, stopping.');

    if (bitdogZWave != null) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Stopping.');
        bitdogZWave.stop();
    }
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_BITDOG_CLIENT, 'Stopping.');
    bitdogClient.stop();

    process.exit();
});


bitdogClient.start();