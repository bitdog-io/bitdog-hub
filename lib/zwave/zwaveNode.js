var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var zwaveCommandClasses = require('../zwaveCommandClasses.js');
var ZWaveValue = require('./zwaveValue.js');

function ZWaveNode(nodeId, homeId) {
    this.homeId = homeId;
    this.nodeId = nodeId;
    this.manufacturer = '';
    //this.manufacturerId = '';
    this.product = '';
    //this.productType = '';
    //this.productId = '';
    this.type = '';
    this.name = '';
    this.loc = '';
    this.classes = { };
    this.ready = false;

    this.setNodeInformation = function (zwaveNodeInfo) {
        this.manufacturer = zwaveNodeInfo.manufacturer;
        //this.manufacturerId = zwaveNodeInfo.manufacturerid;
        this.product = zwaveNodeInfo.product;
        //this.productType = zwaveNodeInfo.producttype;
        //this.productId = zwaveNodeInfo.productid;
        this.type = zwaveNodeInfo.type;
        this.name = zwaveNodeInfo.name;
        this.loc = zwaveNodeInfo.loc;
        this.ready = true;
    }

    this.updateValue = function (zwaveValueInfo)
    {
        var result = false;
        var className = zwaveCommandClasses.getCommand(zwaveValueInfo.class_id)
        var commandClass = this.classes[className];

        if (typeof commandClass === typeof undefined)
            commandClass = this.classes[className] = {};

        var instance = commandClass[zwaveValueInfo.instance];

        if (typeof instance === typeof undefined)
            instance = commandClass[zwaveValueInfo.instance] = {};

        var zwaveValue = instance[zwaveValueInfo.index];
        
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
}

module.exports = ZWaveNode