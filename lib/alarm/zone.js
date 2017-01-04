//-----------------------------------------------------------------------------
//
//	zone.js
//
//	Copyright (c) 2016 Bitdog LLC.
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


var alarmMode = require('./alarmMode.js');

function Zone() {
    var _name = '';
    var _nodes = [];
    var _zwaveNodes = [];
    var _id = '';
    var _alarmMode = alarmMode.Disarmed;

    this.__defineGetter__("name", function () { return _name; });
    this.__defineSetter__("name", function (value) { _name = value; });
    this.__defineGetter__("id", function () { return _id; });
}

module.exports = Zone;