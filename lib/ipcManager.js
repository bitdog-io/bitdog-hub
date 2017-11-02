//-----------------------------------------------------------------------------
//
//	ipcManager.js
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

var http = require('http');
var bitdogClient = require('bitdog-client');
var constants = require('./constants.js');
var path = require('path');
var coreMessageSchemas = require('./coreMessageSchemas.js');

_httpServer = null;
_isRunning = false;
_ipcPort = bitdogClient.configuration.get(constants.IPC_PORT);

function IPCManager() {


}

IPCManager.prototype.start = function () {
    if (_isRunning === false) {
        _isRunning = true;
        startHttpServer();
    }
};

IPCManager.prototype.stop = function () {
    if (_isRunning === true) {
        _isRunning = false;

        if (_httpServer !== null)
           _httpServer.close();
    }
}

function startHttpServer() {
    var ipcPort = bitdogClient.configuration.get(constants.IPC_PORT);

    if (ipcPort !== typeof undefined || ipcPort === null)
        ipcPort = 9001;

    _httpServer = http.createServer(function (req, res) {
        var message = '';

        req.on('data', function (data) {
            message += data;
        });

        req.on('end', function () {
            var result = false;
            try {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_IPC_MANAGER, 'Received IPC message', message);
                message = JSON.parse(message);
                processIPCMessage(message);
                result = true;
            }
            catch (error) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_IPC_MANAGER, 'Could not parse IPC message', error);
            }


            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ result: result }));
            res.end();
        });


    }).listen(_ipcPort, '127.0.0.1', function () {
        var address = _httpServer.address().address;
        var port = _httpServer.address().port;

        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_IPC_MANAGER, 'IPC HTTP listener ready', { host: address, port: port });

    });

    _httpServer.on('close', function () {

        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_IPC_MANAGER, 'IPC HTTP listener stopped');

    });
}

function processIPCMessage(message) {

    switch (message.name) {
        case 'motion-event-start':
            bitdogClient.sendData('bd-videoMotionEventStart', coreMessageSchemas.videoMotionEventStartMessageSchema, function (newMessage) {
            });
            break;
        case 'motion-event-end':
            bitdogClient.sendData('bd-videoMotionEventEnd', coreMessageSchemas.videoMotionEventEndMessageSchema, function (newMessage) {
            });
            break;
        case 'motion-image-captured':
            bitdogClient.sendData('bd-videoMotionImageCaptured', coreMessageSchemas.videoMotionImageCapturedMessageSchema, function (newMessage) {
                newMessage.imageFileName = path.basename(message.imagePath);
            });
            break;
        default:
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_IPC_MANAGER, 'IPC message invalid', message);
            break;
    }

}

module.exports = new IPCManager();