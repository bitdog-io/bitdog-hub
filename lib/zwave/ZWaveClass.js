var ZWaveInstance = require('./zwaveInstance.js');
var zwaveCommandClasses = require('../zwaveCommandClasses.js');


function ZWaveClass(id) {
    var _name = zwaveCommandClasses.getCommand(id);
    var _id = id;
    var _instances = []; 
    
    this.updateValue = function (zwaveValueInfo) {
        var zwaveInstance = getInstance(zwaveValueInfo);
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

     function getInstance(zwaveValueInfo) {
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