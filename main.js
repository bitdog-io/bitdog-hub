var bitdogHub = require('./lib/bitdogHub.js');
var bitdogClient = require('bitdog-client');
var program = require('commander');
var path = require('path');
var constants = require('./lib/constants.js');
var saveExtensionPaths = bitdogClient.configuration.get(constants.EXTENSION_PATHS);

process.on('SIGINT', function () {
    bitdogClient.logger.logProcessEvent('Bitdog Hub', 'SIGINT, stopping.');
    bitdogHub.stop();
    setTimeout(function () { process.exit(0); }, 5000);
});

process.on('uncaughtException', function (error) {
    bitdogClient.logger.logProcessEvent('Bitdog Hub','Unhandled exception: ' , error);
});

program
    .version('0.0.52')
    .description('Bitdog Hub')
    .option('-l,--logpath <log directory path>', 'The direcotry for log files.')
    .option('-c,--configpath <config directory path>', 'The directory for configuration files.')
    .option('-t,--tail', 'Write logs to console also.')
    .option('-e,--extension <extension file path | clear>', 'Path to file that has extension code. Use clear to remote extension from stored configuration.'); 
 

program.parse(process.argv);

if (typeof program.tail === typeof undefined) {
    bitdogClient.configuration.logToConsole = false;  
} else {
    bitdogClient.configuration.logToConsole = true;
}

if (typeof program.logpath !== typeof undefined) {
    var logFilePath = path.resolve(program.logpath, bitdogClient.constants.LOG_FILE_NAME);
    bitdogClient.configuration.logFilePath = logFilePath;
}

console.log("Configuration file path is " + bitdogClient.configuration.configFilePath);
console.log("Logging to " + bitdogClient.configuration.logFilePath);


if (typeof program.extension !== typeof undefined) {

    if (program.extension === 'clear')
        bitdogClient.configuration.set(constants.EXTENSION_PATHS, []);
    else
        loadExtension(path.resolve(program.extension));

} else if (typeof saveExtensionPaths !== typeof undefined && saveExtensionPaths !== null && saveExtensionPaths.length > 0) {
    loadExtension(saveExtensionPaths[0]);
} 

bitdogHub.start();

function loadExtension(extensionFilePath) {
    //process.chdir(__dirname);
    //console.log("Setting working directory to " + __dirname);
    console.log("Loading extension at " + extensionFilePath);

    try {
        var Extension = require(extensionFilePath);

        var extension = new Extension();
        extension.bitdogHub = bitdogHub;

        extension.onInitialize(bitdogClient.configuration, bitdogClient.logger);

        bitdogClient.configuration.set(constants.EXTENSION_PATHS, [extensionFilePath]);
    }
    catch (exception) {
        bitdogClient.logger.logProcessEvent('Bitdog Hub', 'Unhandled exception: ', { message: exception.message, stack: exception.stack } );
    }
}




