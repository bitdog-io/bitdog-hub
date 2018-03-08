//-----------------------------------------------------------------------------
//
//	zwaveValue.js
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

var zwaveAlarmNotification = require('./zwaveAlarmNotification.js');
var moment = require('moment');

function ZWaveValue(zwaveValueInfo) {
    var _id = zwaveValueInfo.index;
    var _isReadOnly = zwaveValueInfo.read_only;
    var _isWriteOnly = zwaveValueInfo.write_only;
    var _type = zwaveValueInfo.type;
    var _label = zwaveValueInfo.label;
    var _help = zwaveValueInfo.help;
    var _units = zwaveValueInfo.units;
    var _valueId = zwaveValueInfo.value_id;
    var _genre = zwaveValueInfo.genre;
    var _isPolled = zwaveValueInfo.is_polled;
    var _values = zwaveValueInfo.values;
    var _firstUpdate = true;
    var _notificationType = null;
    var _status = 0;
    var _event = null;
    var _updateDateTimeUTC = null;

    convertNotificationValueToList();

    //convertNotificationValueToList before attempting the convert and setting default value.
    var _value = convertType(zwaveValueInfo.value);

    if ( typeof _value !== typeof undefined && _value.decoded === true) {
        _status = _value.status;
        _value = _value.value;
    }

    // set the notification status
    zwaveValueInfo.status = _status;
    
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
    this.__defineGetter__("status", function () { return _status; });
    this.__defineGetter__("updateDateTimeUTC", function () { return _updateDateTimeUTC; });

    function convertNotificationValueToList() {
        _notificationType = zwaveAlarmNotification.getNotificationType(zwaveValueInfo.class_id, zwaveValueInfo.index);

        // If this is a notification value then get the decoded list of known values
        // turn this value into a list instead of a number and fill the list with all the known values.
        // This may be handled by OpenZWave in the future
        if (typeof _notificationType !== typeof undefined) {
            _values = [];
            _type = 'list';
            for (_event in _notificationType.events) {
                _values.push(_notificationType.events[_event].value);
            }

        }
    }

    function convertType(value) {
        var result = value;

        if (typeof value === typeof undefined || value === null) {
            result = value;
        }
        else if (typeof value == 'string') {
            switch (_type) {
                case 'button':
                case 'string':
                case 'list':
                    result = value;
                    break;
                case 'int':
                case 'short':
                case 'byte':
                    result = parseInt(value);
                    break;
                case 'bool':
                    result = value === 'true' || value === '1' || value === 1;
                    break;
                case 'decimal':
                    result = parseFloat(value);
                    break;
                default:
                    result = value;
                    break;

            }

        }
        else if (_type === 'list' && typeof _notificationType !== typeof undefined && _notificationType !== null) {
            // 
            // Change the current numeric values to more complex decoded objects values
            // which makes application logic easier up the stack
            //

            if (value === true) {
                result = _notificationType.events[1];
            } else if (value === false) {
                result = _notificationType.events[0];
            } else {
                result = _notificationType.events[value];
            }

            if (typeof result !== typeof undefined) {
                result.decoded = true;
            }
            else {
                result = value;
            }

        } else {
            result = value;
        }

        return result;
    }

    this.updateValue = function (zwaveValueInfo) {
        var result = false;
        var convertedValue = convertType(zwaveValueInfo.value);
        var status = 0;

        // if we have converted the value to decoded message
        if (typeof convertedValue !== typeof undefined && convertedValue.decoded === true) {
            // set the status to the status of the decoded message
            status = convertedValue.status;
            // use the new decoded message name as the value instead of the orginal numerical code
            convertedValue = convertedValue.value;
        } 

        if (_value !== convertedValue || _firstUpdate === true || _updateDateTimeUTC.getTime() + 60000 < (new Date(moment.utc().format())).getTime() )
            result = true;

        // update our state
        _value = convertedValue;
        _status = status;
        _firstUpdate = false;
        _updateDateTimeUTC = new Date(moment.utc().format());

        zwaveValueInfo.value = _value;
        zwaveValueInfo.status = _status;
        zwaveValueInfo.units = _units;

        return result;

    };

    // This method is used to convert incomming values to the correct type before sending to OpenZWave
    // If the result is decoded, use the orginal numeric value for OpenZWave
    this.convert = function (value) {
        var result = convertType(value);

        if (result.decoded === true)
            result = result.id;

        return result;
    };

}

module.exports = ZWaveValue;