function ZWaveValue(zwaveValueInfo) {
    var _id = zwaveValueInfo.index;
    var _isReadOnly = zwaveValueInfo.read_only;
    var _isWriteOnly = zwaveValueInfo.write_only;
    var _type = zwaveValueInfo.type;
    var _label = zwaveValueInfo.label;
    var _help = zwaveValueInfo.help;
    var _units = zwaveValueInfo.units;
    var _value = convertType(zwaveValueInfo.value);
    var _genre = zwaveValueInfo.genre;
    var _isPolled = zwaveValueInfo.is_polled;
    var _values = zwaveValueInfo.values;
    var _firstUpdate = true;
    var _valueId = zwaveValueInfo.value_id;
    
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
    
    function convertType(value) {
        var result = value;
        
        if (typeof value === typeof undefined || value === null) {
            result = value;
        }
        else if (typeof value == 'string') {
            switch (this.type) {
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
                    result = value === 'true';
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