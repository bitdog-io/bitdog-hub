//-----------------------------------------------------------------------------
//
//	videoManager.js
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
var VideoStreamer = require('./videoStreamer.js');
var dvrManager = require('./dvrManager.js');

var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var childProcess = require('child_process');

//
// Video manager is an orchestator for multiple video sources amd streaming processes.
// Each video source is given two separate processes that help stream video. One process is
// ffmpeg encoder. The other process forwards the encoded video from ffmpeg to a cloud based
// video hub via websockets. The video hub can broadcast the video to any securely connected viewing 
// applications. The cloud forwarder and video encoder are in external processes to prevent their message loops
// from clogging up the hub's main message loop that handles automation and monitoring.
//

function VideoManager() {
    var _videoStreamers = [];
    var _isRunning = false;

    this.__defineGetter__('videoStreamers', function () { return _videoStreamers; });

    this.__defineGetter__('isRunning', function () { return _isRunning; });
    this.__defineSetter__('isRunning', function (value) { _isRunning = value; });

}

VideoManager.prototype.getVideoSources = function () {
    var capture = null;
    var devices = [];

    var result = childProcess.execFileSync('v4l2-ctl', ['--list-devices'], { encoding: 'utf8' });
    var records = result.split('\n\n');
    var record = null;

    for (var index = 0; index < records.length; index++) {
        record = records[index].trim();
        
        // Look for only loopback devices
        if (record.includes('loopback') === true) {
            capture = /(^.*):\s*(\W*\w*\W*\w*)/g.exec(record);
            if (capture !== null && capture.length > 2)
                devices.push({ type: capture[1], source: capture[2].replace('/dev/', ''), sourcePath: capture[2]  });
        }
    }

    return devices;
};

VideoManager.prototype.start = function () {
        var self = this;

    if (this.isRunning === true)
        return;
    
    this.isRunning = true;

     bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Starting.');

     var videoSources = this.getVideoSources();
     var videoStreamer = null;

    if (videoSources.length > 0) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Found ' + videoSources.length + ' video sources.', videoSources);

        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Acquiring video hub address.');

        bitdogClient.getVideoHubUrl(
            function (url) {

                for (var index = 0; index < videoSources.length; index++) {
                    videoStreamer = new VideoStreamer(url, videoSources[index].source);
                    self.videoStreamers.push(videoStreamer);

                    videoStreamer.start();
                }
            },
            function (error) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Could not contact Bitdog Cloud for video.', error);
            },
            function (error) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Could not contact Bitdog Cloud for video.', error);
            }
        );

        bitdogClient.getFileAssetUrl(
            function (url) {
                dvrManager.start(url);
               
            },
            function (error) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Could not contact Bitdog Cloud for file asset management.', error);
            },
            function (error) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Could not contact Bitdog Cloud for file asset management.', error);
            }
        );
    } else {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Did not find any video sources.');
     }

    saveCameraConfigurations(hubCameras);

};

VideoManager.prototype.stop = function () {
    
    if (this.isRunning === false)
        return;
    
    this.isRunning = false;

    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Stopping.');

    for (var index = 0; index < this.videoStreamers.length; index++) {
        this.videoStreamers[index].stop();
    }

    dvrManager.stop();
};

function saveCameraConfigurations(hubCameras, successCallback, errorCallback) {
    var self = this;
    var port = null;
    var protocol = null;

    var request = {
        nodeId: bitdogClient.configuration.nodeId,
        authKey: bitdogClient.configuration.authKey,
        hubCamerasJson: JSON.stringify({ hubCameras: hubCameras })
    };

    var requestJson = JSON.stringify(request);

    var headers = {
        'Content-Type': 'application/json',
    };

    var parsedUrl = url.parse(bitdogClient.constants.CENTRAL_URL + '/realm/saveHubCameras');

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
        response.setEncoding('utf-8');

        var responseString = '';

        response.on('data', function (data) {
            responseString += data;
        });

        response.on('end', function () {

            if (this.statusCode == 200 && responseString.length > 1) {
                var resultObject = {};

                try {
                    resultObject = JSON.parse(responseString);
                }
                catch (e) {
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Error parsing JSON from saveHubCameras:', e);
                }

                if (resultObject.Success === true) {
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Saved hub camera configurations');

                    if (typeof successCallback !== typeof undefined) {
                        successCallback();
                    }

                    return;
                }

                if (resultObject.Success !== true) {
                    if (typeof errorCallback !== typeof undefined)
                        errorCallback('Authorization failed');
                    return;
                }

                if (typeof errorCallback !== typeof undefined)
                    errorCallback('Unexpected response /realm/saveHubCameras');

            }
            else {
                if (typeof errorCallback !== typeof undefined)
                    errorCallback('Unexpected response from /realm/saveHubCameras. Status code: ' + this.statusCode + ' Response: ' + responseString);
            }
        });
    });

    request.on('error', function (e) {
        if (typeof errorCallback !== typeof undefined)
            errorCallback(e);
    });

    request.write(requestJson);
    request.end();

}

module.exports = new VideoManager();