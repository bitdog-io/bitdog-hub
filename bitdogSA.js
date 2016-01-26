var BitdogZWave = require('../lib/bitdogZWave.js');
var bitdogClient = require('bitdog-client');
var bitdogZWave = null;


bitdogClient.on('ready', function () {

    bitdogZWave = new BitdogZWave();
    bitdogZWave.start();

});

process.on('SIGINT', function () {
    bitdogClient.logger.logProcessEvent('disconnecting...');
    
    if (bitdogZWave != null)
        bitdogZWave.stop();
    
    bitdogClient.stop();

    process.exit();
});


bitdogClient.start();