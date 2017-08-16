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
    this.__defineSetter__('isRunning', function (value) {  _isRunning = value; });

}

VideoManager.prototype.getVideoSources = function () {
    var capture = null;
    var devices = [];
    
    var result = childProcess.execFileSync('v4l2-ctl', ['--list-devices'], { encoding: 'utf8' });
    var records = result.split('\n\n');
    var record = null;

    for (var index = 0; index < records.length; index++) {
        record = records[index].trim();

        if (record.includes('loopback') === false) {
            capture = /(^.*):\s*(\W*\w*\W*\w*)/g.exec(record);
            if (capture !== null && capture.length > 2)
                devices.push({ type: capture[1], source: capture[2].replace('/dev/', '') });
        }
    }
    
    return devices;
};

VideoManager.prototype.startVideoServices = function () {
    var self = this;
    var videoSources = this.getVideoSources();
    var videoStreamer = null;
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Starting.');

    if (videoSources.length > 0) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Found ' + videoSources.length + ' video sources.');
        
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Acquiring video hub address');

        bitdogClient.getVideoHubUrl(
            function (url) {
                
                for (var index = 0; index < videoSources.length; index++) {
                    videoStreamer = new VideoStreamer(url, videoSources[index].source);
                    self.videoStreamers.push(videoStreamer);

                    videoStreamer.start();
                }
            },
        function (error) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Could not contact video hub.', error);
            },
        function (error) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Could not contact video hub.', error);
            }
        );
    } else {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Did not find any video sources');
    }
};

VideoManager.prototype.stopVideoServices = function () {
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_MANAGER, 'Stopping.');

    for (var index = 0; index < this.videoStreamers.length; index++) {
        this.videoStreamers[index].stop();
    }
};

module.exports = new VideoManager();