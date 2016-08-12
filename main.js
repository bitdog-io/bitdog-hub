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
    .version('0.0.52');
    .description('Bitdog Hub')
	.option('-l,--logpath <log directory path>', 'The path for log files.')
    .option('-c,--configpath <config file path>', 'The path for configuration files.')
	.option('-t,--tail', 'Write logs to console also.')
    .action(function (options) {

        bitdogHub.start();

    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exitCode = 1;

}




