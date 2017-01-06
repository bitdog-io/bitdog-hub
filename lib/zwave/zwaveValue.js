//-----------------------------------------------------------------------------
//
//	zwaveValue.js
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

var zwaveAlarmNotification = require('./zwaveAlarmNotification.js');

function ZWaveValue(zwaveValueInfo) {
    var _id = zwaveValueInfo.index;
    var _isReadOnly = zwaveValueInfo.read_only;
    var _isWriteOnly = zwaveValueInfo.write_only;
    var _type = zwaveValueInfo.type;
    var _label = zwaveValueInfo.label;
    var _help = zwaveValueInfo.help;
    var _units = zwaveValueInfo.units;
    var _valueId = zwaveValueInfo.value_id;
    var _value = convertType(zwaveValueInfo.value);
    var _genre = zwaveValueInfo.genre;
    var _isPolled = zwaveValueInfo.is_polled;
    var _values = zwaveValueInfo.values;
    var _firstUpdate = true;
    var _notificationType = null;
    var event = null;

    if (zwaveValueInfo.class_id === 113 && zwaveValueInfo.index > 3) {
        _notificationType = zwaveAlarmNotification.getNotificationType(zwaveValueInfo.index);

        if (typeof _notificationType !== typeof undefined && _notificationType !== null) {
            _values = [];
            _type = 'list';
            for (event in _notificationType.events) {
                _values.push(_notificationType.events[event].name);
            }

        }

    }

    this.updateValue = function (zwaveValueInfo) {
        var result = false;
        var convertedValue = convertType(zwaveValueInfo.value);
        
        if (_value !== convertedValue || _firstUpdate === true)
            result = true;
        
        _value = convertedValue;
        
        _firstUpdate = false;
        
        // fix value type issues
        zwaveValueInfo.value = _value;
        
        return result;
        
    };
    
    this.convert = function (value) {
        return convertType(value);
    };

    function convertType(value) {
        var result = value;
        
        if (typeof value === typeof undefined || value === null) {
            result = value;
        }
        else if (typeof value == 'string') {
            switch (_type) {
                case 'button':
                case 'string':
                    result = value;
                    break;
                case 'list':
                    if (typeof _notificationType !== typeof undefined && _notificationType !== null) {
                        result = _notificationType.events[value];
                        if (typeof result !== undefined) {
                            result = result.name;
                        }
                        else {
                            result = value;
                        }
                    } else {
                        result = value;
                    }

                    break;
                case 'int':
                case 'short':
                case 'byte':
                    result = parseInt(value);
                    break;
                case 'bool':
                    result = value === 'true' || value ==='1' || value === 1;
                    break;
                case 'decimal':
                    result = parseFloat(value);
                    break;
                default:
                    result = value;
                    break;
              
            }
            
        }
        
        return result;
    }
    
    this.__defineGetter__("id", function () { return _id; });
    this.__defineGetter__("isReadOnly", function () { return _isReadOnly; });
    this.__defineGetter__("isWriteOnly", function () { return _isWriteOnly; });
    this.__defineGetter__("type", function () { return _type; });
    this.__defineGetter__("label", function () { return _label; });
    this.__defineGetter__("help", function () { return _help; });
    this.__defineGetter__("units", function () { return _units; });
    this.__defineGetter__("value", function () { return _value; });
    this.__defineGetter__("genre", function () { return _genre; });
    this.__defineGetter__("isPolled", function () { return _isPolled; });
    this.__defineGetter__("values", function () { return _values; });
    this.__defineGetter__("valueId", function () { return _valueId; });
}

module.exports = ZWaveValue;