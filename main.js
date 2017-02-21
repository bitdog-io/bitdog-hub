//-----------------------------------------------------------------------------
//
//	main.js
//
//	Copyright (c) 2015-2017 Bitdog LLC.
//
//	SOFTWARE NOTICE AND LICENSE
//
//	This file is part of bitdog-hub.
//
//	bitdog-hub is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published
//	by the Free Software Foundation, either version 3 of the License,
//	or (at your option) any later version.
//
//	bitdog-hub is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with bitdog-hub.  If not, see <http://www.gnu.org/licenses/>.
//
//-----------------------------------------------------------------------------

var bitdogHub = require('./lib/bitdogHub.js');
var bitdogClient = require('bitdog-client');
var program = require('commander');
var path = require('path');
var constants = require('./lib/constants.js');
var savedExtensionPaths = bitdogClient.configuration.get(constants.EXTENSION_PATHS);

if (typeof savedExtensionPaths === typeof undefined || savedExtensionPaths === null)
    savedExtensionPaths = [];

// Create serializable error objects
if (!('toJSON' in Error.prototype)) {
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            var alt = {};

            Object.getOwnPropertyNames(this).forEach(function (key) {
                alt[key] = this[key];
            }, this);

            return alt;
        },
        configurable: true,
        writable: true
    });
}

process.on('SIGINT', function () {
    setTimeout(function () {
        bitdogClient.logger.logProcessEvent('Bitdog Hub', 'Calling process exit...');
        process.exit(0);
    }, 10000);

    bitdogClient.logger.logProcessEvent('Bitdog Hub', 'SIGINT, stopping.');

    bitdogHub.stop();

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

    if (program.extension === 'clear') {
        savedExtensionPaths = [];
        bitdogClient.configuration.set(constants.EXTENSION_PATHS, savedExtensionPaths);
    }
    else {
        saveExtension(path.resolve(program.extension));
    }
}

loadExtensions();

bitdogHub.start();

function saveExtension(extensionFilePath) {
    savedExtensionPaths.push(extensionFilePath);
    bitdogClient.configuration.set(constants.EXTENSION_PATHS, savedExtensionPaths);
}

function loadExtensions() {
    //process.chdir(__dirname);
    //console.log("Setting working directory to " + __dirname);
    var extensionFilePath = '';

    for (var index = 0; index < savedExtensionPaths.length; index++) {
        extensionFilePath = savedExtensionPaths[index];
        console.log("Loading extension at " + extensionFilePath);

        try {
            var Extension = require(extensionFilePath);

            var extension = new Extension();
            extension.bitdogHub = bitdogHub;

            extension.onInitialize(bitdogClient.configuration, bitdogClient.logger);

        }
        catch (exception) {
            bitdogClient.logger.logProcessEvent('Bitdog Hub', 'Exception loading extension: ', { message: exception.message, stack: exception.stack });
        }
    }
}




