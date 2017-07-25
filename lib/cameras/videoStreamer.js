//-----------------------------------------------------------------------------
//
//	videoStreamer.js
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
// Code for this file was inspired by project http://drejkim.com/projects/edi-cam/ 
//-----------------------------------------------------------------------------

// modules
var childProcess = require('child_process');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');

var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var websocketsProcessPath = path.resolve(__dirname , './websocketsProcess.js');


function VideoStreamer(source) {
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Starting websocket streamer to Bitdog Cloud for ' + source);
    var websocketChild = childProcess.fork(websocketsProcessPath, [], { execArgv: [], cwd: process.cwd(), silent: true });
    
    websocketChild.stdout.on("data", function (data) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, data);
    });
    
    websocketChild.stderr.on("data", function (data) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, data);
    });
    
    websocketChild.on('error', function (error) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Websocket streamer error', error);
    });
    
    websocketChild.on('message', function (message) {
        
        if (typeof message != typeof undefined && typeof message.name != typeof undefined && message.name != null) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'Received websocket streamer message', message);
            
            switch (message.name) {
                case 'connection-ready': {
                    var ffmpegChild = childProcess.spawn('ffmpeg' , ['-s', '640x480', '-f', 'video4linux2', '-i', '/dev/video0', '-f', 'mpeg1video', '-b:v', '800k', '-r', '30', 'http://127.0.0.1:' + dynamicPort]);
                    
                    ffmpegChild.stdout.on('data', function (data) {
           
                    });
                    
                    ffmpegChild.stderr.on('data', function (data) {
            
                    });
                    
                    ffmpegChild.on('close', function (code) {
                        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_VIDEO_STREAMER, 'ffmpeg process exited with code ' + code);
                    });
                }
                break;
                case 'connection-lost':
                    break;
            }
        }
    
    });
    
    websocketChild.on('disconnected', function () { 
    
    });
    
    websocketChild.send({ name: 'start', source: source });
    
    
}
util.inherits(VideoStreamer, EventEmitter);

module.exports = VideoStreamer;