var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var zwaveCommandClasses = require('../zwaveCommandClasses.js');

function ZWaveNode(nodeId, homeId) {
    this.nodeId = nodeId;
    this.homeId = homeId;
    this.manufacturer = '';
    this.manufacturerId = '';
    this.product = '';
    this.productType = '';
    this.productId = '';
    this.type = '';
    this.name = '';
    this.loc = '';
    this.commandClasses = { };
    this.ready = false;

    this.setNodeInformation = function (nodeInfo) {
        this.manufacturer = nodeInfo.manufacturer;
        this.manufacturerId = nodeInfo.manufacturerid;
        this.product = nodeInfo.product;
        this.productType = nodeInfo.producttype;
        this.productId = nodeInfo.productid;
        this.type = nodeInfo.type;
        this.name = nodeInfo.name;
        this.loc = nodeInfo.loc;
        this.ready = true;
    }

    this.updateValue = function (zwaveValue)
    {
        var result = false;
        var commandClassName = zwaveCommandClasses.getCommand(zwaveValue.class_id)
        var commandClass = this.commandClasses[commandClassName];

        if (typeof commandClass === typeof undefined)
            commandClass = this.commandClasses[commandClassName] = {};

        var instance = commandClass[zwaveValue.instance];

        if (typeof instance === typeof undefined)
            instance = commandClass[zwaveValue.instance] = {};

        var oldValue = instance[zwaveValue.index];
        
        if (typeof oldValue === typeof undefined) {
            instance[zwaveValue.index] = zwaveValue;
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value added', { nodeId: nodeId, commandClass: commandClassName, value: zwaveValue });
            result = true;
        }
        else if(oldValue.value !== zwaveValue.value || zwaveValue.is_polled === false) {
            instance[zwaveValue.index] = zwaveValue;
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value updated', { nodeId: nodeId, commandClass: commandClassName, oldValue: oldValue, newValue: zwaveValue });
            result = true;
        }

        return result;
    }

    this.removeValue = function (commandClassId, instanceId, index) {
        var commandClassName = zwaveCommandClasses.getCommand(commandClassId)
        var commandClass = this.commandClasses[commandClassName];
        
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