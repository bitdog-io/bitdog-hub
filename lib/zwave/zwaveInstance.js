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