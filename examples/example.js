var bitdogSA = require('../lib/bitdogSA.js');
var bitdogClient = require('bitdog-client');

bitdogSA.start();

process.on('SIGINT', function () {
    bitdogClient.logger.logProcessEvent('Example Security and Automation', 'SIGINT, stopping.');
    bitdogSA.stop();
    process.exit();
});