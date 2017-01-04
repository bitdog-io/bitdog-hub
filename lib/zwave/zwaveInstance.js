//-----------------------------------------------------------------------------
//
//	zwaveInstance.js
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


var ZWaveValue = require('./zwaveValue.js');

function ZWaveInstance(id) {
    var _id = id;
    var _values = [];
    
    this.updateValue = function (zwaveValueInfo) {
        var zwaveValue = getZWaveValue(zwaveValueInfo);
        return zwaveValue.updateValue(zwaveValueInfo);
    };
    
    this.removeValue = function (commandClassId, instanceId, valueIndex) {
        for (var index = 0; index < _values.length; index++) {
            if (_values[index].id == valueIndex) {
                _values.splice(index, 1);
            }
            
            return;
        }
    }
    
    this.getValue = function (indexId) {
        var zwaveValue = null;
        for (var index = 0; index < _values.length; index++) {
            if (_values[index].id == indexId) {
                zwaveValue = _values[index];
                break;
            }
        }

        return zwaveValue;

    }

    function getZWaveValue(zwaveValueInfo) {
        for (var index = 0; index < _values.length; index++) {
            if (_values[index].id == zwaveValueInfo.index)
                return _values[index];
        }
        
        var zwaveValue = new ZWaveValue(zwaveValueInfo);
        _values.push(zwaveValue);
        
        return zwaveValue;
    };
    
    this.__defineGetter__("id", function () { return _id; });
    this.__defineGetter__("values", function () { return _values; });
}

module.exports = ZWaveInstance;