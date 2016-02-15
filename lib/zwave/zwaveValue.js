function ZWaveValue(zwaveValueInfo) {
    var _id = zwaveValueInfo.value_id;
    var _isReadOnly = zwaveValueInfo.read_only;
    var _isWriteOnly = zwaveValueInfo.write_only;
    var _type = zwaveValueInfo.type;
    var _label = zwaveValueInfo.label;
    var _help = zwaveValueInfo.help;
    var _units = zwaveValueInfo.units;
    var _value = zwaveValueInfo.value;
    var _genre = zwaveValueInfo.genre;
    var _isPolled = zwaveValueInfo.is_polled;
    var _values = zwaveValueInfo.values;
    var _firstUpdate = true;
    
    this.updateValue = function (zwaveValueInfo) {
        var result = false;

        if (_value !== zwaveValueInfo.value || _firstUpdate)
            result = true;

        _value = zwaveValueInfo.value;
        _firstUpdate = false;

        return result;
        
    };

    this.__defineGetter__("id", function () { return _name; });
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
}

module.exports = ZWaveValue;