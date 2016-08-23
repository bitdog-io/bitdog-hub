var bitdogHub = require('./lib/bitdogHub.js');
var bitdogClient = require('bitdog-client');
var program = require('commander');

process.on('SIGINT', function () {
    bitdogClient.logger.logProcessEvent('Bitdog Hub', 'SIGINT, stopping.');
    bitdogHub.stop();
    setTimeout(function () { process.exit(0); }, 5000);
});

process.on('uncaughtException', function (ex) {
    bitdogClient.logger.logProcessEvent('Unhandled exception, stopping.', ex);
    setTimeout(function () { process.exit(1); }, 5000);

});

program
    .version('0.0.52')
    .description('Bitdog Hub')
    .option('-l,--logpath <log directory path>', 'The direcotry for log files.')
    .option('-c,--configpath <config directory path>', 'The directory for configuration files.')
    .option('-t,--tail', 'Write logs to console also.');
 

program.parse(process.argv);

if (typeof program.tail === typeof undefined) {
    bitdogClient.configuration.logToConsole = false;
} else {
    bitdogClient.configuration.logToConsole = true;
}

if (typeof program.logpath !== typeof undefined) {
    bitdogClient.configuration.logpath = program.logpath;
}

console.log("Configuration file path is " + bitdogClient.configuration.configFilePath);
console.log("Logging to " + bitdogClient.configuration.logFilePath);

bitdogHub.start();





