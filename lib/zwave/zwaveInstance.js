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


    function getZWaveValue(zwaveValueInfo) {
        for (var index = 0; index < _values.length; index++) {
            if (_values[index].id == zwaveValueInfo.index)
                return _values[index];
        }
        
        var zwaveValue = new ZWaveValue(zwaveValueInfo);
        _values.push(value);
        
        return zwaveValue;
    };
    
    this.__defineGetter__("name", function () { return _name; });
    this.__defineGetter__("id", function () { return _id; });
    this.__defineGetter__("values", function () { return _values; });
}

module.exports = ZWaveInstance;