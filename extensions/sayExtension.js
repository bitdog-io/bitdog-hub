//-----------------------------------------------------------------------------
//
//	sayExtension.js
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

// Extension will inherit functions from ExtensionBase
// Make sure the path to extensionBase is correct 
var ExtensionBase = require('../lib/extensionBase.js');
var util = require('util');
var crypto = require('crypto');
var url = require('url');
var https = require('https');
var http = require('http');
var os = require('os');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var sayQueue = [];


function Extension() {
    this.isPlaying = false;
}
// Extension inherits from ExtensionBase
util.inherits(Extension, ExtensionBase);

Extension.prototype.onMessage = function (message, configuration, logger) {
};

Extension.prototype.onInitialize = function (configuration, logger) {
};

Extension.prototype.onSystemEvent = function (eventInfo, configuration, logger) {

    logger.log('Say extension', 'Saying - ' + eventInfo.text);
    this.say(eventInfo.text, configuration, logger);

};

Extension.prototype.say = function (text, configuration, logger) {
    var self = this;

    this.getMp3(text, configuration, logger,
        function (filePath) {
            logger.log('Say extension', 'Downloaded ' + filePath);
            self.enqueue(filePath, configuration, logger);

        },
        function (error) {
            logger.log('Say extension', 'Download error ' + error);
        });
};

Extension.prototype.getMp3 = function (text, configuration, logger, successCallback, errorCallback) {

    var self = this;
    var port = null;
    var protocol = null;
    var fileName = crypto.createHash('sha256').update(text).digest('hex') + '.mp3';
    var filePath = os.tmpdir() + path.sep + fileName;

    if (fs.exists(filePath))
        if (successCallback)
            successCallback(filePath);

    var request = {
        nodeId: configuration.nodeId,
        authKey: configuration.authKey,
        text: text
    };

    var requestJson = JSON.stringify(request);

    var headers = {
        'Content-Type': 'application/json',
    };

    var parsedUrl = url.parse(this.constants.CENTRAL_URL + '/realm/say');

    if (parsedUrl.port != null)
        port = parsedUrl.port;
    else {
        if (parsedUrl.protocol == 'http:')
            port = 80;
        else (parsedUrl.protocol == 'https:')
        port = 443;
    }

    var options = {
        host: parsedUrl.hostname,
        port: port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: headers
    };

    protocol = parsedUrl.protocol == 'https:' ? https : http;

    var request = protocol.request(options, function (response) {
        var fileStream = fs.createWriteStream(filePath);

        response.on('data', function (chunk) {
            fileStream.write(chunk);
        });

        response.on('end', function () {
            fileStream.close();

            if (this.statusCode == 200) {
                if (successCallback)
                    successCallback(filePath);
            } else {
                if (errorCallback)
                    errorCallback();
            }

        });
    });

    request.on('error', function (e) {
        if (errorCallback)
            errorCallback(e);
    });

    request.write(requestJson);
    request.end();

}

Extension.prototype.enqueue = function (filePath, configuration, logger) {
    sayQueue.push(filePath);
    this.play(configuration, logger);
}

Extension.prototype.play = function (configuration, logger) {

    if (this.isPlaying === true)
        return;

    this.isPlaying = true;

    var self = this;
    var filePath = sayQueue.shift();
    var playerProcess = null;

    try {
        playerProcess = child_process.spawn('omxplayer', [filePath]);

        playerProcess.stdout.on('data', function (data) {
            logger.log(`Say extension`, data);
        });

        playerProcess.stderr.on('data', function (data) {
            logger.log(`Say extension`, data);
        });

        playerProcess.on('close', function(code) {
            self.isPlaying = false;

            if (sayQueue.length > 0) {
                setInterval(function () { self.play(configuration, logger); }, 1000);
            }

        });

    } catch (error) {
        logger.log(`Say extension`, error);
        this.isPlaying = false;

    }
}
// Export your Extension class so it can be loaded by the framework
module.exports = Extension;



