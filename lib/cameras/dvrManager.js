//-----------------------------------------------------------------------------
//
//	dvrManager.js
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

var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');

var fs = require('fs');
var request = require('request');
var path = require('path');
var dvrPath = bitdogClient.configuration.get(constants.VIDEO_DVR_PATH);
var moment = require('moment');

//
// DVR manager watches the DVR directory for new motion capture jpegs and video mp4s. It uploads 
// then to the Bitdog cloud where they are saved in fault tolerant geo diversified storage. The files are made
// availabe to the mobile app for security notifications and historical viewing.
//
function DVRManager() {
    var _isRunning = false;
    var _fileAssetUrl = '';
    
    this.__defineGetter__('isRunning', function () { return _isRunning; });
    this.__defineSetter__('isRunning', function (value) { _isRunning = value; });
    
    this.__defineGetter__('url', function () { return _fileAssetUrl; });
    this.__defineSetter__('url', function (value) { _fileAssetUrl = value; });
}

DVRManager.prototype.start = function () {
    if (this.isRunning === true) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, 'Already in running state.');
        return;
    }
    
    this.url = fileAssetUrl;
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, 'Starting.');
    
    this.isRunning = true;
    
    // Start uploading in 60 seconds
    setTimeout(this.uploadFiles.bind(this), 60000, ++index);
    
};

DVRManager.prototype.stop = function () {
    
    
    if (this.isRunning === false) {
        bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, 'Already in stopped state.');
        return;
    }
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, 'Stopping.');
    
    this.isRunning = false;
    


};

DVRManager.prototype.uploadFiles = function (index) {
    var file = null;
    var fileExt = '';
    var promise = null;
    var self = this;
    
    if (this.isRunning === false)
        return;

    if (typeof index === typeof undefined)
        index = 0;
    
    var files = fs.readdirSync(dvrPath, { encoding: 'utf8' });
    
    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, 'Found ' + files.length + ' for upload');
    
    if (files.length > 0) {
        
        // We caught up, reset the index
        if (index >= files.length)
            index = 0;
        
        fileName = files[index]
        fileExt = path.extname(fileName);
        
        if (fileExt !== '.jpg' && fileExt !== '.mp4') {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, 'Ignoring file of incorrect type' + fileName);
            setTimeout(self.uploadFiles.bind(self), 1000, ++index);
            return;
        }
        
        var stat = fs.statSync(path.resolve(dvrPath, fileName));

                    
        self.uploadFile(fileName).then(function (result, error) {
            
            if (typeof error === typeof undefined) {
                bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, error);
                    // continue to next file if running
            }
            
            if (self.isRunning === true) {
                setTimeout(self.uploadFiles.bind(self), 1000, ++index);
            }

        }).catch(function (error) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, error);
            // continue to next file if running
            
            if (self.isRunning === true) {
                setTimeout(self.uploadFiles.bind(self), 1000, ++index);
            }

        });
	       		
        
    } else {
        if (self.isRunning === true) {
            // No files, wait 15 seconds and check again
            setTimeout(self.uploadFiles.bind(self), 15000, 0);
        }
    }
       	
};

DVRManager.prototype.uploadFile = function (fileName) {
    var self = this;
    var filePath = path.resolve(dvrPath, fileName);
     
    var promise = new Promise(function (resolve, reject) {
        try {
            
            var fileExt = path.extname(fileName);
            var contentType = '';
            var uri = '';

            switch (fileExt) {
                case '.jpg':
                    contentType = 'image/jpeg';
                    uri = '/uploadsecurityimage';
                    break;
                case '.mp4':
                    contentType = 'video/mp4';
                    uri = '/uploadsecurityvideo';
                    break;         
            }

            var fileStream = fs.createReadStream(filePath, { flags: 'r+' });
            var  formData  =  {
                  file:  {
                        value:  fileStream ,
                        options:  {  filename:  fileName ,   contentType: contentType }
                },
                fileDateTimeUTC: moment().toISOString()
            };
            
            request.post({ url: url + uri ,  formData:  formData }, function  (error, httpResponse, body)  {
                
                if  (typeof error !== typeof undefined)  {
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, 'File upload failed for ' + filePath, error);
                    reject(error);
                } else {
                    var result = JSON.parse(body);
                    bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER, 'Upload success, removing local file', filePath);
                    fs.unlinkSync(filePath);
                    resolve(result);
                }
            });

        }
        catch (error) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_DVR_MANAGER,'File upload failed for ' + filePath, error);
            reject(error);
        }

    });
    
    return promise;
};

module.exports = new DVRManager();