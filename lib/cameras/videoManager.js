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

var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var childProcess = require('child_process');

function VideoManager() {


}

VideoManager.prototype.getVideoSources = function () {
    var deviceRegEx = /(^.*):\s*(\W*\w*\W*\w*)/g;
    var capture = null;
    var devices = [];

    var result = childProcess.execFileSync('v4l2-ctl', ['--list-devices'], { encoding: 'utf8' });
    var records = result.trim('\n\n').split('\n\n');

    for (var index = 0; index < records.length; index++) {
        capture = deviceRegEx.exec(records[index]);
        if(capture.length > 2)
            devices.push({ type: capture[1], source: capture[2] });
    }

    return devices;
}

module.exports = new VideoManager();