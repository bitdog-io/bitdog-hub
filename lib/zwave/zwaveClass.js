//-----------------------------------------------------------------------------
//
//	zwaveClass.js
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


var ZWaveInstance = require('./zwaveInstance.js');
var zwaveCommandClasses = require('./zwaveCommandClasses.js');


function ZWaveClass(id) {
    var _name = zwaveCommandClasses.getCommand(id);
    var _id = id;
    var _instances = []; 
    
    this.updateValue = function (zwaveValueInfo) {
        var zwaveInstance = getZWaveInstance(zwaveValueInfo);
        return zwaveInstance.updateValue(zwaveValueInfo);
    };
    
    this.removeValue = function (commandClassId, instanceId, valueIndex) {
        for (var index = 0; index < _instances.length; index++) {
            if (_instances[index].id == instanceId) {
                var zwaveInstance = _instances[index];
                zwaveInstance.removeValue(commandClassId, instanceId, valueIndex);
                
                if (zwaveInstance.values.length < 1) {
                    _instances.splice(index, 1);
                }
                
                return;
            }
        }
    }
    
    this.getValue = function (instanceId, indexId) {
        var zwaveInstance = null;
        for (var index = 0; index < _instances.length; index++) {
            if (_instances[index].id == instanceId) {
                zwaveInstance = _instances[index];
                break;
            }
        }
        
        if (zwaveInstance != null)
            return zwaveInstance.getValue(indexId);
        else
            return null;
    }

     function getZWaveInstance(zwaveValueInfo) {
        for (var index = 0; index < _instances.length; index++) {
            if (_instances[index].id == zwaveValueInfo.instance)
                return _instances[index];
        }
        
        var zwaveInstance = new ZWaveInstance(zwaveValueInfo.instance);
        _instances.push(zwaveInstance);

        return zwaveInstance;
    };
    
    this.__defineGetter__("name", function () { return _name; });
    this.__defineGetter__("id", function () { return _id; });
    this.__defineGetter__("instances", function () { return _instances; });
}

module.exports = ZWaveClass;