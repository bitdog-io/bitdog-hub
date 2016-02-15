var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var ZWaveClass = require('./ZWaveClass.js');

function ZWaveNode(nodeId, homeId) {
    this.homeId = homeId;
    this.nodeId = nodeId;
    this.manufacturer = '';
    this.manufacturerId = '';
    this.product = '';
    this.productType = '';
    this.productId = '';
    this.type = '';
    this.name = '';
    this.loc = '';
    this.classes = [];
    this.ready = false;

    this.setNodeInformation = function (zwaveNodeInfo) {
        this.manufacturer = zwaveNodeInfo.manufacturer;
        this.manufacturerId = zwaveNodeInfo.manufacturerid;
        this.product = zwaveNodeInfo.product;
        this.productType = zwaveNodeInfo.producttype;
        this.productId = zwaveNodeInfo.productid;
        this.type = zwaveNodeInfo.type;
        this.name = zwaveNodeInfo.name;
        this.loc = zwaveNodeInfo.loc;
        this.ready = true;
    }

    this.updateValue = function (zwaveValueInfo)
    {
  
        
        if (typeof zwaveValue === typeof undefined) {
            zwaveValue = instance[zwaveValueInfo.index] = new ZWaveValue(zwaveValueInfo);
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value added', { nodeId: nodeId, commandClass: className, value: zwaveValue });
            result = true;
        }
        else if (zwaveValue.value !== zwaveValueInfo.value || zwaveValueInfo.is_polled === false) {
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value updated', { nodeId: nodeId, commandClass: className, valueId: zwaveValue.id, label: zwaveValue.label, oldValue: zwaveValue.value, newValue: zwaveValueInfo.value });
            zwaveValue.value = zwaveValueInfo.value;
            result = true;
        }

        return result;
    }

    this.removeValue = function (commandClassId, instanceId, index) {
        var className = zwaveCommandClasses.getCommand(commandClassId)
        var commandClass = this.classes[className];
        
        if (typeof commandClass != typeof undefined) {
            
            var instance = commandClass[instanceId];
            
            if (typeof instance != typeof undefined) {
                if (instance[index])
                    delete instance[index];
            }
        }
    }

    function getClass(zwaveValueInfo) {
        for (var index = 0; index < this.classes.length; index++) {
            if (this.classes[index].id == zwaveValueInfo.class_id)
                return this.classes[index];
        }
        
        var zwaveClass = new ZWaveClass(zwaveValueInfo.class_id)
        this.classes.push(zwaveClass);
        return zwaveClass;
    }

}

module.exports = ZWaveNode