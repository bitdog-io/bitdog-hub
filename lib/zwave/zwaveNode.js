var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var zwaveCommandClasses = require('../zwaveCommandClasses.js');

function ZWaveNode(zwaveNodeId) {
    this.zwaveNodeId = zwaveNodeId;
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
        var commandClass = this.commandClasses[zwaveValue.class_id];

        if (typeof commandClass === typeof undefined)
            commandClass = this.commandClasses[zwaveValue.class_id] = {};

        var instance = commandClass[zwaveValue.instance];

        if (typeof instance === typeof undefined)
            instance = commandClass[zwaveValue.instance] = {};

        var oldValue = instance[zwaveValue.index];
        
        if (typeof oldValue === typeof undefined)
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value added', { zwaveNodeId: zwaveNodeId, commandClass: zwaveCommandClasses.getCommand(zwaveValue.class_id), value: zwaveValue });
        else
            bitdogClient.logger.logProcessEvent(constants.LOG_PROCESS_ZWAVE, 'Value updated', { zwaveNodeId: zwaveNodeId, commandClass: zwaveCommandClasses.getCommand(zwaveValue.class_id), oldValue: oldValue, newValue: zwaveValue });

        instance[zwaveValue.index] = zwaveValue;

    }
}

module.exports = ZWaveNode